import type { PaymentDirection } from "@/types/agency-escrow";

/**
 * Create-flow-only presentation helpers.
 *
 * These do NOT change shared domain behaviour: role mapping is still derived by
 * `deriveAgencyEscrowRoles` / `getPaymentParties` in the frozen foundation. This
 * module only holds direction-aware copy and the config defaults the default UX
 * intentionally hides from the user (fee + platform/resolver addresses), so the
 * screen never asks the user to configure Trustless Work roles by hand.
 */

const FALLBACK_STELLAR_ADDRESS =
  "GDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD";

function envAddress(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : FALLBACK_STELLAR_ADDRESS;
}

/** Platform + resolver config. Sourced from env for testnet, mock fallback otherwise. */
export const DEFAULT_PLATFORM_ADDRESS = envAddress(
  process.env.NEXT_PUBLIC_PLATFORM_ADDRESS,
);
export const DEFAULT_DISPUTE_RESOLVER_ADDRESS = envAddress(
  process.env.NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS,
);

/** V1 platform fee in basis points (0.30%). */
export const DEFAULT_PLATFORM_FEE_BPS = 30;

/** Assets selectable in V1. Mock mode settles in USDC. */
export const SUPPORTED_ASSETS = ["USDC", "XLM"] as const;

/**
 * Generate a human-readable engagement reference. Called on the client (in an
 * effect) to avoid SSR/CSR hydration mismatches from the random suffix.
 */
export function generateEngagementReference(seed?: string): string {
  const base =
    (seed ?? "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6) || "ESCROW";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TR-${base}-${suffix}`;
}

export function formatAsset(amount: number, asset: string): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `${safe.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${asset}`.trim();
}

export function formatFeePercent(bps: number): string {
  return `${(bps / 100).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}%`;
}

export type DirectionCopy = {
  /** Label on the direction option card. */
  optionLabel: string;
  /** Sub-label describing the option. */
  optionHint: string;
  /** Heading for the counterparty section. */
  counterpartyHeading: string;
  counterpartyDescription: string;
  /** Field label for the counterparty name. */
  counterpartyNameLabel: string;
  counterpartyNamePlaceholder: string;
  counterpartyWalletLabel: string;
  /** Amount label. */
  amountLabel: string;
  /** Heading for the deliverable/acceptance section. */
  deliverableHeading: string;
  deliverableDescription: string;
  acceptanceLabel: string;
  acceptanceHint: string;
  /** Preview: role tag under each party. */
  payerRoleTag: string;
  payeeRoleTag: string;
  /** One-line plain-language summary of who pays whom. */
  summary: (params: {
    payer: string;
    payee: string;
    amount: string;
  }) => string;
  /** Success next-action guidance. */
  nextActionTitle: string;
  nextAction: (counterparty: string) => string;
};

export const DIRECTION_OPTIONS: PaymentDirection[] = ["receivable", "payable"];

const COPY: Record<PaymentDirection, DirectionCopy> = {
  receivable: {
    optionLabel: "We're getting paid",
    optionHint: "A client funds the escrow and pays you on approval.",
    counterpartyHeading: "Who's paying you",
    counterpartyDescription:
      "The client who will fund the escrow and approve the work.",
    counterpartyNameLabel: "Client name",
    counterpartyNamePlaceholder: "e.g. Acme Inc.",
    counterpartyWalletLabel: "Client Stellar wallet",
    amountLabel: "Amount you'll receive",
    deliverableHeading: "What you'll deliver",
    deliverableDescription:
      "Describe the work you'll submit for the client to review.",
    acceptanceLabel: "Acceptance criteria",
    acceptanceHint:
      "What must be true before the client can approve and release payment.",
    payerRoleTag: "Funds & approves",
    payeeRoleTag: "Delivers & gets paid",
    summary: ({ payer, payee, amount }) =>
      `${payer} funds ${amount} and releases it to ${payee} once the deliverable is approved.`,
    nextActionTitle: "Share it with your client",
    nextAction: (counterparty) =>
      `Send the escrow link to ${counterparty} so they can review and fund it.`,
  },
  payable: {
    optionLabel: "We're paying someone",
    optionHint: "You fund the escrow and release payment on approval.",
    counterpartyHeading: "Who you're paying",
    counterpartyDescription:
      "The contractor or vendor who will deliver the work.",
    counterpartyNameLabel: "Payee name",
    counterpartyNamePlaceholder: "e.g. Maria Santos",
    counterpartyWalletLabel: "Payee Stellar wallet",
    amountLabel: "Amount you'll pay",
    deliverableHeading: "What they'll deliver",
    deliverableDescription:
      "Describe the work the payee will submit for you to review.",
    acceptanceLabel: "Acceptance criteria",
    acceptanceHint:
      "What must be true before you can approve and release payment.",
    payerRoleTag: "Funds & approves",
    payeeRoleTag: "Delivers & gets paid",
    summary: ({ payer, payee, amount }) =>
      `${payer} funds ${amount} and releases it to ${payee} once the deliverable is approved.`,
    nextActionTitle: "Fund the escrow",
    nextAction: (counterparty) =>
      `Fund the escrow to lock the amount, then ${counterparty} can start the work.`,
  },
};

export function getDirectionCopy(direction: PaymentDirection): DirectionCopy {
  return COPY[direction];
}
