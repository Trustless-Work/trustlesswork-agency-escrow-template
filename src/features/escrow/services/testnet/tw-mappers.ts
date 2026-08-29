import type {
  GetEscrowsFromIndexerResponse,
  InitializeSingleReleaseEscrowPayload,
  Roles as TwRoles,
  SingleReleaseMilestone,
} from "@trustless-work/escrow/types";
import type {
  AgencyEscrow,
  AgencyEscrowStatus,
  CreateAgencyEscrowInput,
  PaymentDirection,
} from "@/types/agency-escrow";
// Relative imports with explicit extensions (not the "@/" alias) so this pure
// module — and its tests — load under Node's type-stripping test runner without
// a path-alias resolver. roles.ts has no runtime dependencies.
import { deriveAgencyEscrowRoles } from "../../utils/roles.ts";
import { shortenAddress } from "./errors.ts";

/** Milestone status text written on-chain when the provider submits for review. */
export const TW_STATUS_UNDER_REVIEW = "Under Review";

/** Trustless Work single-release uses exactly one milestone in V1. */
export const V1_MILESTONE_INDEX = "0";

/**
 * Convert the application's basis-point fee into the Trustless Work percentage
 * number. TW's `platformFee` is a percentage value, NOT basis points.
 *
 *   30 bps  -> 0.30   (i.e. 0.30%)
 *   250 bps -> 2.5
 *
 * Passing the raw bps (e.g. 30) would tell TW to charge 30%. Do not do that.
 */
export function feePercentFromBps(bps: number): number {
  if (!Number.isInteger(bps) || bps < 0 || bps > 10_000) {
    throw new Error("platformFeeBps must be an integer between 0 and 10000");
  }
  return bps / 100;
}

/** Inverse of `feePercentFromBps`, used when mapping indexer reads back. */
export function bpsFromFeePercent(percent: number): number {
  return Math.round(percent * 100);
}

export type DeployConfig = {
  platformAddress: string;
  disputeResolverAddress: string;
  usdcIssuer: string;
  assetSymbol: string;
};

/**
 * Map a CreateAgencyEscrowInput into a Trustless Work Single-Release deploy
 * payload. Roles are DERIVED from the payment direction (never hand-set), the
 * issuer/signer is the workspace, amounts are numbers, the fee is converted to a
 * percentage, the trustline uses the G-issuer address, and there is exactly one
 * milestone. Platform/resolver come from validated config — no input fallbacks.
 */
export function buildSingleReleaseDeployPayload(
  input: CreateAgencyEscrowInput,
  config: DeployConfig,
): InitializeSingleReleaseEscrowPayload {
  const roles = deriveAgencyEscrowRoles({
    paymentDirection: input.paymentDirection,
    workspace: input.workspace,
    counterparty: input.counterparty,
    platformAddress: config.platformAddress,
    disputeResolverAddress: config.disputeResolverAddress,
  });

  return {
    signer: input.workspace.walletAddress,
    engagementId: input.engagementId,
    title: input.agreement.title,
    description: input.agreement.description,
    amount: input.payment.amount,
    platformFee: feePercentFromBps(input.platformFeeBps),
    roles: {
      approver: roles.approver,
      serviceProvider: roles.serviceProvider,
      releaseSigner: roles.releaseSigner,
      disputeResolver: roles.disputeResolver,
      receiver: roles.receiver,
      platformAddress: roles.platformAddress,
    },
    trustline: {
      address: config.usdcIssuer,
      symbol: config.assetSymbol,
    },
    milestones: [{ description: input.milestone.description }],
  };
}

/** App-only metadata merged into the indexer read (see metadata-store). */
export type EscrowMetaOverlay = {
  paymentDirection?: PaymentDirection;
  workspaceAddress?: string;
  workspaceName?: string;
  workspaceEmail?: string;
  counterpartyName?: string;
  counterpartyEmail?: string;
  agreementUrl?: string;
  dueDate?: string;
  milestoneTitle?: string;
  acceptanceCriteria?: string;
  deliverySummary?: string;
  deliverableLinks?: string[];
  revisionNotes?: string;
  revisionRequested?: boolean;
  platformFeeBps?: number;
  createdAt?: string;
  fundedAt?: string;
  submittedAt?: string;
  revisionRequestedAt?: string;
  approvedAt?: string;
  releasedAt?: string;
  creationTx?: string;
  fundingTx?: string;
  submissionTx?: string;
  approvalTx?: string;
  releaseTx?: string;
};

function firstMilestone(
  tw: GetEscrowsFromIndexerResponse,
): SingleReleaseMilestone | undefined {
  return tw.milestones?.[0] as SingleReleaseMilestone | undefined;
}

/**
 * Derive the application lifecycle status from on-chain truth plus the one
 * app-only signal (`revisionRequested`). Approval is irreversible and
 * request-changes is a pre-approval app concept, so it can only ever downgrade
 * an in-review escrow, never an approved/released one.
 */
export function deriveStatusFromChain(
  tw: GetEscrowsFromIndexerResponse,
  overlay?: EscrowMetaOverlay,
): AgencyEscrowStatus {
  const flags = tw.flags ?? {};
  const milestone = firstMilestone(tw);

  if (flags.released) return "released";
  if (milestone?.approved) return "approved";
  if (overlay?.revisionRequested) return "revision_requested";

  const statusText = (milestone?.status ?? "").trim().toLowerCase();
  const submitted = statusText.length > 0 && statusText !== "pending";
  if (submitted) return "in_review";

  if ((tw.balance ?? 0) > 0) return "funded";
  return "created";
}

function twDateToIso(
  value: { _seconds: number } | undefined,
  fallback: string,
): string {
  if (!value || typeof value._seconds !== "number") return fallback;
  return new Date(value._seconds * 1000).toISOString();
}

/**
 * Merge a Trustless Work indexer escrow with local app metadata into the stable
 * AgencyEscrow model the screens consume. See metadata-store for the provenance
 * of each field (on-chain vs derived vs local-only).
 */
export function mapIndexerEscrowToAgencyEscrow(
  tw: GetEscrowsFromIndexerResponse,
  overlay?: EscrowMetaOverlay,
): AgencyEscrow {
  const contractId = tw.contractId ?? "";
  const roles = tw.roles as TwRoles;
  const workspaceAddress = tw.signer ?? overlay?.workspaceAddress ?? "";

  // Payment direction: prefer stored app metadata, else derive from chain.
  // In our role model the single-release receiver is the workspace only when the
  // escrow is receivable, so receiver === workspace(issuer) <=> receivable.
  const direction: PaymentDirection =
    overlay?.paymentDirection ??
    (roles.receiver === workspaceAddress ? "receivable" : "payable");

  const counterpartyAddress =
    direction === "receivable" ? roles.approver : roles.receiver;

  const milestone = firstMilestone(tw);
  const createdAt = twDateToIso(tw.createdAt, overlay?.createdAt ?? "");

  return {
    escrowId: contractId,
    contractId,
    engagementId: tw.engagementId,
    templateType: "agency_payment",
    paymentDirection: direction,
    workspace: {
      name: overlay?.workspaceName ?? shortenAddress(workspaceAddress),
      walletAddress: workspaceAddress,
      email: overlay?.workspaceEmail,
    },
    counterparty: {
      name: overlay?.counterpartyName ?? shortenAddress(counterpartyAddress),
      walletAddress: counterpartyAddress,
      email: overlay?.counterpartyEmail,
    },
    agreement: {
      title: tw.title,
      description: tw.description,
      agreementUrl: overlay?.agreementUrl,
      dueDate: overlay?.dueDate,
    },
    payment: {
      amount: tw.amount,
      asset: tw.trustline?.symbol ?? "USDC",
    },
    milestone: {
      title: overlay?.milestoneTitle ?? tw.title,
      description: milestone?.description ?? tw.description,
      acceptanceCriteria: overlay?.acceptanceCriteria ?? "",
      deliverySummary: overlay?.deliverySummary,
      deliverableLinks: overlay?.deliverableLinks,
      revisionNotes: overlay?.revisionNotes,
      evidence: milestone?.evidence,
    },
    roles: {
      // issuer/funder are app concepts; TW roles carry the rest verbatim.
      issuer: workspaceAddress,
      funder: roles.approver, // payer == approver == releaseSigner in our model
      serviceProvider: roles.serviceProvider,
      approver: roles.approver,
      releaseSigner: roles.releaseSigner,
      receiver: roles.receiver,
      platformAddress: roles.platformAddress,
      disputeResolver: roles.disputeResolver,
    },
    fee: {
      platformFeeBps: overlay?.platformFeeBps ?? bpsFromFeePercent(tw.platformFee),
      platformAddress: roles.platformAddress,
    },
    status: deriveStatusFromChain(tw, overlay),
    timestamps: {
      createdAt: createdAt || new Date(0).toISOString(),
      fundedAt: overlay?.fundedAt,
      submittedAt: overlay?.submittedAt,
      revisionRequestedAt: overlay?.revisionRequestedAt,
      approvedAt: overlay?.approvedAt,
      releasedAt: overlay?.releasedAt,
    },
    transactions: {
      creationTx: overlay?.creationTx,
      fundingTx: overlay?.fundingTx,
      submissionTx: overlay?.submissionTx,
      approvalTx: overlay?.approvalTx,
      releaseTx: overlay?.releaseTx,
    },
  };
}
