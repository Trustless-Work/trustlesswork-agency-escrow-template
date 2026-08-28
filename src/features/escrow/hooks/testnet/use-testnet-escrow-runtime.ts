"use client";

import { useCallback } from "react";
import {
  useApproveMilestone,
  useChangeMilestoneStatus,
  useFundEscrow,
  useGetEscrowFromIndexerByContractIds,
  useGetEscrowsFromIndexerBySigner,
  useInitializeEscrow,
  useReleaseFunds,
  useSendTransaction,
} from "@trustless-work/escrow/hooks";
import type {
  GetEscrowsFromIndexerResponse,
  SingleReleaseMilestone,
} from "@trustless-work/escrow/types";
import type {
  AgencyEscrow,
  AgencyEscrowEvent,
  CreateAgencyEscrowInput,
  RequestChangesInput,
  SubmitDeliverableInput,
} from "@/types/agency-escrow";
import { useWallet } from "@/lib/wallet-provider";
import { getTestnetConfig } from "@/features/escrow/config/escrow-config";
import {
  IndexerTimeoutError,
  SignatureRejectedError,
  SubmissionError,
  TestnetError,
  WalletNotConnectedError,
  WrongWalletError,
} from "@/features/escrow/services/testnet/errors";
import {
  assertBalanceAndTrustline,
  assertTrustlineReady,
} from "@/features/escrow/services/testnet/stellar-preflight";
import {
  appendEscrowEvent,
  getEscrowEvents,
  getEscrowMeta,
  getKnownContractIds,
  patchEscrowMeta,
  saveEscrowMeta,
  type TestnetEscrowMeta,
} from "@/features/escrow/services/testnet/metadata-store";
import { pollUntil, withRateLimitRetry } from "@/features/escrow/services/testnet/retry";
import {
  buildSingleReleaseDeployPayload,
  mapIndexerEscrowToAgencyEscrow,
  TW_STATUS_UNDER_REVIEW,
  V1_MILESTONE_INDEX,
  type EscrowMetaOverlay,
} from "@/features/escrow/services/testnet/tw-mappers";

const SINGLE_RELEASE = "single-release" as const;

function overlayFromMeta(meta: TestnetEscrowMeta | null): EscrowMetaOverlay | undefined {
  if (!meta) return undefined;
  return {
    paymentDirection: meta.paymentDirection,
    workspaceAddress: meta.workspace.walletAddress,
    workspaceName: meta.workspace.name,
    workspaceEmail: meta.workspace.email,
    counterpartyName: meta.counterparty.name,
    counterpartyEmail: meta.counterparty.email,
    agreementUrl: meta.agreementUrl,
    dueDate: meta.dueDate,
    milestoneTitle: meta.milestoneTitle,
    acceptanceCriteria: meta.acceptanceCriteria,
    deliverySummary: meta.deliverySummary,
    deliverableLinks: meta.deliverableLinks,
    revisionNotes: meta.revisionNotes,
    revisionRequested: meta.revisionRequested,
    platformFeeBps: meta.platformFeeBps,
    createdAt: meta.timestamps.createdAt,
    fundedAt: meta.timestamps.fundedAt,
    submittedAt: meta.timestamps.submittedAt,
    revisionRequestedAt: meta.timestamps.revisionRequestedAt,
    approvedAt: meta.timestamps.approvedAt,
    releasedAt: meta.timestamps.releasedAt,
    creationTx: meta.transactions.creationTx,
    fundingTx: meta.transactions.fundingTx,
    submissionTx: meta.transactions.submissionTx,
    approvalTx: meta.transactions.approvalTx,
    releaseTx: meta.transactions.releaseTx,
  };
}

function extractContractId(result: unknown): string | undefined {
  if (result && typeof result === "object" && "contractId" in result) {
    const value = (result as { contractId?: unknown }).contractId;
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

/**
 * Testnet runtime: owns the Trustless Work SDK + wallet + XDR orchestration.
 * Screens never see any of this — they call the same application hooks, which
 * delegate here in testnet mode. Every write follows the non-custodial contract:
 * get unsigned XDR -> verify actor -> sign -> submit -> confirm indexed state.
 */
export function useTestnetEscrowRuntime() {
  const { address, signTransaction } = useWallet();

  const { deployEscrow } = useInitializeEscrow();
  const { fundEscrow } = useFundEscrow();
  const { changeMilestoneStatus } = useChangeMilestoneStatus();
  const { approveMilestone } = useApproveMilestone();
  const { releaseFunds } = useReleaseFunds();
  const { sendTransaction } = useSendTransaction();
  const { getEscrowByContractIds } = useGetEscrowFromIndexerByContractIds();
  const { getEscrowsBySigner } = useGetEscrowsFromIndexerBySigner();

  const assertActor = useCallback(
    (required: string, roleLabel: string) => {
      if (!address) throw new WalletNotConnectedError();
      if (address !== required) {
        throw new WrongWalletError(roleLabel, required, address);
      }
    },
    [address],
  );

  const readByContract = useCallback(
    async (contractId: string): Promise<GetEscrowsFromIndexerResponse | null> => {
      const results = await withRateLimitRetry(() =>
        getEscrowByContractIds({ contractIds: [contractId] }),
      );
      return results[0] ?? null;
    },
    [getEscrowByContractIds],
  );

  /** Sign the unsigned XDR with the required wallet and submit it. */
  const signAndSubmit = useCallback(
    async (unsignedTransaction: string | undefined, signer: string) => {
      if (!unsignedTransaction) {
        throw new SubmissionError(
          "Trustless Work did not return a transaction to sign.",
        );
      }
      let signedXdr: string;
      try {
        signedXdr = await signTransaction(unsignedTransaction, signer);
      } catch {
        throw new SignatureRejectedError();
      }
      try {
        return await withRateLimitRetry(() => sendTransaction(signedXdr));
      } catch (error) {
        if (error instanceof TestnetError) throw error;
        throw new SubmissionError();
      }
    },
    [signTransaction, sendTransaction],
  );

  /** Poll the indexer until the expected on-chain state is observable. */
  const confirmState = useCallback(
    async (
      contractId: string,
      predicate: (tw: GetEscrowsFromIndexerResponse) => boolean,
      expectedLabel: string,
    ): Promise<GetEscrowsFromIndexerResponse> => {
      const { value, confirmed } = await pollUntil(
        () => readByContract(contractId),
        (tw) => Boolean(tw) && predicate(tw as GetEscrowsFromIndexerResponse),
      );
      if (!confirmed || !value) throw new IndexerTimeoutError(expectedLabel);
      return value;
    },
    [readByContract],
  );

  const createEscrow = useCallback(
    async (input: CreateAgencyEscrowInput): Promise<AgencyEscrow> => {
      const config = getTestnetConfig();
      // The workspace is the issuer/deployer: connected wallet must be it.
      assertActor(input.workspace.walletAddress, "workspace (issuer)");

      const payload = buildSingleReleaseDeployPayload(input, config);
      const deployResult = await withRateLimitRetry(() =>
        deployEscrow(payload, SINGLE_RELEASE),
      );
      const sendResult = await signAndSubmit(
        deployResult.unsignedTransaction,
        input.workspace.walletAddress,
      );

      const contractId = extractContractId(sendResult);
      if (!contractId) {
        throw new SubmissionError(
          "The escrow was submitted but no contract ID was returned.",
        );
      }

      const nowIso = new Date().toISOString();
      const meta: TestnetEscrowMeta = {
        contractId,
        engagementId: input.engagementId,
        paymentDirection: input.paymentDirection,
        workspace: input.workspace,
        counterparty: input.counterparty,
        agreementUrl: input.agreement.agreementUrl,
        dueDate: input.agreement.dueDate,
        milestoneTitle: input.milestone.title,
        acceptanceCriteria: input.milestone.acceptanceCriteria,
        platformFeeBps: input.platformFeeBps,
        asset: input.payment.asset,
        timestamps: { createdAt: nowIso },
        transactions: {},
      };
      saveEscrowMeta(meta);
      appendEscrowEvent(contractId, "created", {
        actor: input.workspace.walletAddress,
      });

      const tw = await confirmState(contractId, () => true, "created");
      return mapIndexerEscrowToAgencyEscrow(tw, overlayFromMeta(meta));
    },
    [assertActor, deployEscrow, signAndSubmit, confirmState],
  );

  const fundEscrowAction = useCallback(
    async (contractId: string): Promise<AgencyEscrow> => {
      const config = getTestnetConfig();
      const tw = await readByContract(contractId);
      if (!tw) throw new SubmissionError(`Escrow not found: ${contractId}`);
      const meta = getEscrowMeta(contractId);
      const escrow = mapIndexerEscrowToAgencyEscrow(tw, overlayFromMeta(meta));

      assertActor(escrow.roles.funder, "funder (payer)");
      // Funder must have the USDC trustline and enough balance to fund.
      await assertBalanceAndTrustline(
        config.horizonUrl,
        escrow.roles.funder,
        config.usdcIssuer,
        config.assetSymbol,
        escrow.payment.amount,
        "funder",
      );

      const result = await withRateLimitRetry(() =>
        fundEscrow(
          {
            contractId,
            signer: escrow.roles.funder,
            amount: escrow.payment.amount, // number — all TW amounts are numbers
          },
          SINGLE_RELEASE,
        ),
      );
      await signAndSubmit(result.unsignedTransaction, escrow.roles.funder);

      patchEscrowMeta(contractId, {
        timestamps: { createdAt: escrow.timestamps.createdAt, fundedAt: new Date().toISOString() },
      });
      appendEscrowEvent(contractId, "funded", { actor: escrow.roles.funder });

      const confirmed = await confirmState(
        contractId,
        (next) => (next.balance ?? 0) > 0,
        "funded",
      );
      return mapIndexerEscrowToAgencyEscrow(confirmed, overlayFromMeta(getEscrowMeta(contractId)));
    },
    [assertActor, readByContract, fundEscrow, signAndSubmit, confirmState],
  );

  const submitDeliverable = useCallback(
    async (
      contractId: string,
      data: SubmitDeliverableInput,
    ): Promise<AgencyEscrow> => {
      getTestnetConfig();
      const tw = await readByContract(contractId);
      if (!tw) throw new SubmissionError(`Escrow not found: ${contractId}`);
      const meta = getEscrowMeta(contractId);
      const escrow = mapIndexerEscrowToAgencyEscrow(tw, overlayFromMeta(meta));

      assertActor(escrow.roles.serviceProvider, "service provider (payee)");

      const evidence = data.evidence || data.deliverableLinks?.[0];
      const result = await withRateLimitRetry(() =>
        changeMilestoneStatus(
          {
            contractId,
            serviceProvider: escrow.roles.serviceProvider,
            milestoneIndex: V1_MILESTONE_INDEX,
            newStatus: TW_STATUS_UNDER_REVIEW,
            newEvidence: evidence,
          },
          SINGLE_RELEASE,
        ),
      );
      await signAndSubmit(result.unsignedTransaction, escrow.roles.serviceProvider);

      // Richer delivery metadata has no on-chain field; keep it local. Clearing
      // revisionRequested reflects a resubmission after changes were requested.
      patchEscrowMeta(contractId, {
        deliverySummary: data.deliverySummary,
        deliverableLinks: data.deliverableLinks,
        revisionRequested: false,
        timestamps: { createdAt: escrow.timestamps.createdAt, submittedAt: new Date().toISOString() },
      });
      appendEscrowEvent(
        contractId,
        meta?.revisionRequested ? "resubmitted" : "submitted",
        { actor: escrow.roles.serviceProvider, note: data.deliverySummary },
      );

      const confirmed = await confirmState(
        contractId,
        (next) => {
          const status = (next.milestones?.[0]?.status ?? "").trim().toLowerCase();
          return status.length > 0 && status !== "pending";
        },
        "in review",
      );
      return mapIndexerEscrowToAgencyEscrow(confirmed, overlayFromMeta(getEscrowMeta(contractId)));
    },
    [assertActor, readByContract, changeMilestoneStatus, signAndSubmit, confirmState],
  );

  const requestChanges = useCallback(
    async (
      contractId: string,
      data: RequestChangesInput,
    ): Promise<AgencyEscrow> => {
      getTestnetConfig();
      const tw = await readByContract(contractId);
      if (!tw) throw new SubmissionError(`Escrow not found: ${contractId}`);
      const meta = getEscrowMeta(contractId);
      const escrow = mapIndexerEscrowToAgencyEscrow(tw, overlayFromMeta(meta));

      // Request changes is a PRE-APPROVAL app-layer action by the approver.
      // It is NOT an on-chain operation: approval is irreversible and there is
      // no un-approve. We record the revision request locally only.
      assertActor(escrow.roles.approver, "approver (payer)");
      if (escrow.status === "approved" || escrow.status === "released") {
        throw new TestnetError(
          "not_found",
          "Changes cannot be requested after approval — approval is irreversible.",
        );
      }

      patchEscrowMeta(contractId, {
        revisionNotes: data.revisionNotes,
        revisionRequested: true,
        timestamps: {
          createdAt: escrow.timestamps.createdAt,
          revisionRequestedAt: new Date().toISOString(),
        },
      });
      appendEscrowEvent(contractId, "changes_requested", {
        actor: escrow.roles.approver,
        note: data.revisionNotes,
      });

      const latest = await readByContract(contractId);
      return mapIndexerEscrowToAgencyEscrow(
        latest ?? tw,
        overlayFromMeta(getEscrowMeta(contractId)),
      );
    },
    [assertActor, readByContract],
  );

  const approveDeliverable = useCallback(
    async (contractId: string): Promise<AgencyEscrow> => {
      getTestnetConfig();
      const tw = await readByContract(contractId);
      if (!tw) throw new SubmissionError(`Escrow not found: ${contractId}`);
      const escrow = mapIndexerEscrowToAgencyEscrow(tw, overlayFromMeta(getEscrowMeta(contractId)));

      assertActor(escrow.roles.approver, "approver (payer)");

      const result = await withRateLimitRetry(() =>
        approveMilestone(
          {
            contractId,
            approver: escrow.roles.approver,
            milestoneIndex: V1_MILESTONE_INDEX,
          },
          SINGLE_RELEASE,
        ),
      );
      await signAndSubmit(result.unsignedTransaction, escrow.roles.approver);

      patchEscrowMeta(contractId, {
        revisionRequested: false,
        timestamps: { createdAt: escrow.timestamps.createdAt, approvedAt: new Date().toISOString() },
      });
      appendEscrowEvent(contractId, "approved", { actor: escrow.roles.approver });

      // Approval does NOT move funds — we confirm the approved flag only.
      const confirmed = await confirmState(
        contractId,
        (next) =>
          Boolean(
            (next.milestones?.[0] as SingleReleaseMilestone | undefined)
              ?.approved,
          ),
        "approved",
      );
      return mapIndexerEscrowToAgencyEscrow(confirmed, overlayFromMeta(getEscrowMeta(contractId)));
    },
    [assertActor, readByContract, approveMilestone, signAndSubmit, confirmState],
  );

  const releaseProtectedPayment = useCallback(
    async (contractId: string): Promise<AgencyEscrow> => {
      const config = getTestnetConfig();
      const tw = await readByContract(contractId);
      if (!tw) throw new SubmissionError(`Escrow not found: ${contractId}`);
      const escrow = mapIndexerEscrowToAgencyEscrow(tw, overlayFromMeta(getEscrowMeta(contractId)));

      assertActor(escrow.roles.releaseSigner, "release signer (payer)");
      // Receiver must be able to hold the asset before payout.
      await assertTrustlineReady(
        config.horizonUrl,
        escrow.roles.receiver,
        config.usdcIssuer,
        config.assetSymbol,
        "receiver",
      );

      const result = await withRateLimitRetry(() =>
        releaseFunds(
          { contractId, releaseSigner: escrow.roles.releaseSigner },
          SINGLE_RELEASE,
        ),
      );
      await signAndSubmit(result.unsignedTransaction, escrow.roles.releaseSigner);

      patchEscrowMeta(contractId, {
        timestamps: { createdAt: escrow.timestamps.createdAt, releasedAt: new Date().toISOString() },
      });
      appendEscrowEvent(contractId, "released", { actor: escrow.roles.releaseSigner });

      const confirmed = await confirmState(
        contractId,
        (next) => Boolean(next.flags?.released),
        "released",
      );
      return mapIndexerEscrowToAgencyEscrow(confirmed, overlayFromMeta(getEscrowMeta(contractId)));
    },
    [assertActor, readByContract, releaseFunds, signAndSubmit, confirmState],
  );

  const listEscrows = useCallback(async (): Promise<AgencyEscrow[]> => {
    getTestnetConfig();
    const known = new Set(getKnownContractIds());
    if (address) {
      const bySigner = await withRateLimitRetry(() =>
        getEscrowsBySigner({ signer: address }),
      );
      for (const item of bySigner) {
        if (item.contractId) known.add(item.contractId);
      }
    }

    const contractIds = [...known];
    if (contractIds.length === 0) return [];

    const escrows = await withRateLimitRetry(() =>
      getEscrowByContractIds({ contractIds }),
    );
    return escrows
      .filter((tw) => Boolean(tw.contractId))
      .map((tw) =>
        mapIndexerEscrowToAgencyEscrow(tw, overlayFromMeta(getEscrowMeta(tw.contractId as string))),
      )
      .sort((a, b) => b.timestamps.createdAt.localeCompare(a.timestamps.createdAt));
  }, [address, getEscrowsBySigner, getEscrowByContractIds]);

  const getEscrow = useCallback(
    async (contractId: string): Promise<AgencyEscrow | null> => {
      getTestnetConfig();
      const tw = await readByContract(contractId);
      if (!tw) return null;
      return mapIndexerEscrowToAgencyEscrow(tw, overlayFromMeta(getEscrowMeta(contractId)));
    },
    [readByContract],
  );

  const getEscrowActivity = useCallback(
    async (contractId: string): Promise<AgencyEscrowEvent[]> => {
      return getEscrowEvents(contractId);
    },
    [],
  );

  return {
    createEscrow,
    fundEscrow: fundEscrowAction,
    submitDeliverable,
    requestChanges,
    approveDeliverable,
    releaseProtectedPayment,
    listEscrows,
    getEscrow,
    getEscrowActivity,
  };
}

export type TestnetEscrowRuntime = ReturnType<typeof useTestnetEscrowRuntime>;
