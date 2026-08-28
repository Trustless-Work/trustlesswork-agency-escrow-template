import { test } from "node:test";
import assert from "node:assert/strict";
import type { GetEscrowsFromIndexerResponse } from "@trustless-work/escrow/types";
import type { CreateAgencyEscrowInput } from "@/types/agency-escrow";
import {
  bpsFromFeePercent,
  buildSingleReleaseDeployPayload,
  deriveStatusFromChain,
  feePercentFromBps,
  mapIndexerEscrowToAgencyEscrow,
  type DeployConfig,
} from "./tw-mappers.ts";

const A = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"; // workspace
const B = "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"; // counterparty
const PLATFORM = "GDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD";
const RESOLVER = "GEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE";
const USDC_ISSUER = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

const config: DeployConfig = {
  platformAddress: PLATFORM,
  disputeResolverAddress: RESOLVER,
  usdcIssuer: USDC_ISSUER,
  assetSymbol: "USDC",
};

function input(
  direction: "receivable" | "payable",
): CreateAgencyEscrowInput {
  return {
    engagementId: "TR-ACME-001",
    paymentDirection: direction,
    workspace: { name: "TechRebel", walletAddress: A },
    counterparty: { name: "Acme", walletAddress: B },
    agreement: { title: "Strategy sprint", description: "Two-week engagement" },
    payment: { amount: 5000, asset: "USDC" },
    milestone: {
      title: "Final deck",
      description: "Deliver the deck",
      acceptanceCriteria: "Deck delivered and workshop done",
    },
    // These input fields must be IGNORED in testnet in favour of config.
    platformFeeBps: 30,
    platformAddress: "GNOTREALPLATFORMNOTREALPLATFORMNOTREALPLATFORMNOTREAL01",
    disputeResolverAddress: "GNOTREALRESOLVERNOTREALRESOLVERNOTREALRESOLVERNOTRE0002",
  };
}

// ── Fee conversion (critical: bps → percentage) ─────────────────────────────

test("feePercentFromBps converts basis points to a TW percentage", () => {
  assert.equal(feePercentFromBps(30), 0.3); // 30 bps = 0.30%, NOT 30
  assert.equal(feePercentFromBps(250), 2.5);
  assert.equal(feePercentFromBps(0), 0);
  assert.equal(feePercentFromBps(10_000), 100);
  assert.equal(bpsFromFeePercent(0.3), 30);
});

test("feePercentFromBps rejects invalid basis points", () => {
  assert.throws(() => feePercentFromBps(-1));
  assert.throws(() => feePercentFromBps(10_001));
  assert.throws(() => feePercentFromBps(1.5));
});

// ── Deploy payload mapping ──────────────────────────────────────────────────

test("deploy payload — receivable — derives roles and TW fields", () => {
  const payload = buildSingleReleaseDeployPayload(input("receivable"), config);

  assert.equal(payload.signer, A, "issuer/signer is the workspace");
  assert.equal(typeof payload.amount, "number");
  assert.equal(payload.amount, 5000);
  assert.equal(payload.platformFee, 0.3, "fee is a percentage, not bps");

  // Receivable: payer = counterparty (B), payee = workspace (A)
  assert.equal(payload.roles.approver, B); // payer
  assert.equal(payload.roles.releaseSigner, B); // payer
  assert.equal(payload.roles.serviceProvider, A); // payee
  assert.equal(payload.roles.receiver, A); // payee, in roles for single-release

  // Platform/resolver come from config, never from the input fallbacks.
  assert.equal(payload.roles.platformAddress, PLATFORM);
  assert.equal(payload.roles.disputeResolver, RESOLVER);

  // Trustline is the G-issuer + symbol, exactly one milestone.
  assert.equal(payload.trustline.address, USDC_ISSUER);
  assert.equal(payload.trustline.symbol, "USDC");
  assert.ok(!payload.trustline.address.startsWith("C"));
  assert.equal(payload.milestones.length, 1);
  assert.equal(payload.milestones[0].description, "Deliver the deck");
});

test("deploy payload — payable — flips payer/payee", () => {
  const payload = buildSingleReleaseDeployPayload(input("payable"), config);

  assert.equal(payload.signer, A, "issuer is still the workspace");
  // Payable: payer = workspace (A), payee = counterparty (B)
  assert.equal(payload.roles.approver, A); // payer
  assert.equal(payload.roles.releaseSigner, A); // payer
  assert.equal(payload.roles.serviceProvider, B); // payee
  assert.equal(payload.roles.receiver, B); // payee
});

// ── Indexer → AgencyEscrow mapping ──────────────────────────────────────────

function twEscrow(
  overrides: Partial<GetEscrowsFromIndexerResponse> = {},
): GetEscrowsFromIndexerResponse {
  return {
    signer: A,
    engagementId: "TR-ACME-001",
    title: "Strategy sprint",
    description: "Two-week engagement",
    amount: 5000,
    platformFee: 0.3,
    balance: 0,
    roles: {
      approver: B,
      serviceProvider: A,
      platformAddress: PLATFORM,
      releaseSigner: B,
      disputeResolver: RESOLVER,
      receiver: A,
    },
    milestones: [{ description: "Deliver the deck", status: "Pending", approved: false }],
    flags: {},
    trustline: { address: USDC_ISSUER, symbol: "USDC" },
    user: A,
    createdAt: { _seconds: 1_700_000_000, _nanoseconds: 0 },
    updatedAt: { _seconds: 1_700_000_000, _nanoseconds: 0 },
    type: "single-release",
    contractId: "CCONTRACTID000000000000000000000000000000000000000000000",
    ...overrides,
  };
}

test("indexer → AgencyEscrow maps direction, roles, amount, and fee", () => {
  const escrow = mapIndexerEscrowToAgencyEscrow(twEscrow());

  assert.equal(escrow.paymentDirection, "receivable"); // receiver === issuer
  assert.equal(escrow.escrowId, escrow.contractId);
  assert.equal(escrow.payment.amount, 5000);
  assert.equal(escrow.payment.asset, "USDC");
  assert.equal(escrow.fee.platformFeeBps, 30); // 0.3% → 30 bps
  assert.equal(escrow.roles.funder, B); // payer == approver
  assert.equal(escrow.roles.receiver, A);
  assert.equal(escrow.workspace.walletAddress, A);
  assert.equal(escrow.counterparty.walletAddress, B);
});

test("indexer → AgencyEscrow derives payable when receiver !== issuer", () => {
  const escrow = mapIndexerEscrowToAgencyEscrow(
    twEscrow({
      roles: {
        approver: A,
        serviceProvider: B,
        platformAddress: PLATFORM,
        releaseSigner: A,
        disputeResolver: RESOLVER,
        receiver: B,
      },
    }),
  );
  assert.equal(escrow.paymentDirection, "payable");
  assert.equal(escrow.roles.funder, A); // payer
  assert.equal(escrow.counterparty.walletAddress, B);
});

// ── Status derivation ───────────────────────────────────────────────────────

test("status derivation follows the lifecycle", () => {
  assert.equal(deriveStatusFromChain(twEscrow()), "created");
  assert.equal(deriveStatusFromChain(twEscrow({ balance: 5000 })), "funded");
  assert.equal(
    deriveStatusFromChain(
      twEscrow({
        balance: 5000,
        milestones: [{ description: "d", status: "Under Review" }],
      }),
    ),
    "in_review",
  );
  assert.equal(
    deriveStatusFromChain(
      twEscrow({ balance: 5000, milestones: [{ description: "d", status: "Under Review" }] }),
      { revisionRequested: true },
    ),
    "revision_requested",
  );
  assert.equal(
    deriveStatusFromChain(
      twEscrow({ balance: 5000, milestones: [{ description: "d", status: "Under Review", approved: true }] }),
      { revisionRequested: true },
    ),
    "approved", // approval wins over a stale local revision flag
  );
  assert.equal(
    deriveStatusFromChain(twEscrow({ balance: 0, flags: { released: true } })),
    "released",
  );
});
