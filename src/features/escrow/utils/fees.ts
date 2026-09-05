/**
 * Fee model and calculation utilities for Trustless Work agency escrows.
 *
 * Reconciles both:
 * 1. Platform/integrator fee (configured by this agency escrow template)
 * 2. Trustless Work protocol fee (deducted by the Trustless Work smart contract on release)
 */

/** Default platform fee in basis points (0.30% = 30 bps). */
export const DEFAULT_PLATFORM_FEE_BPS = 30;

/**
 * Default Trustless Work protocol fee in basis points (0.30% = 30 bps).
 * Sourced from canonical two-wallet testnet integration benchmarks (PR #37 / Issue #20).
 */
export const DEFAULT_TW_PROTOCOL_FEE_BPS = 30;

export type FeeBreakdown = {
  /** Gross funded escrow amount locked in the contract */
  grossAmount: number;
  /** Platform/template fee in basis points */
  platformFeeBps: number;
  /** Platform fee amount routed to template platform address */
  platformFeeAmount: number;
  /** Protocol fee in basis points */
  protocolFeeBps: number;
  /** Trustless Work protocol release fee amount */
  protocolFeeAmount: number;
  /** Combined platform + protocol fees deducted at release */
  totalFeeAmount: number;
  /** Expected net amount received by the payee */
  netAmount: number;
  /** Whether the net amount includes estimated protocol-level deductions */
  isEstimate: boolean;
};

/**
 * Calculate the complete fee breakdown distinguishing platform and protocol fees.
 *
 * @param grossAmount Total escrow amount to be funded
 * @param platformFeeBps Platform fee rate in basis points (defaults to 30 bps = 0.30%)
 * @param protocolFeeBps Protocol fee rate in basis points (defaults to 30 bps = 0.30%)
 */
export function calculateFeeBreakdown(
  grossAmount: number,
  platformFeeBps: number = DEFAULT_PLATFORM_FEE_BPS,
  protocolFeeBps: number = DEFAULT_TW_PROTOCOL_FEE_BPS,
): FeeBreakdown {
  if (!Number.isFinite(grossAmount) || grossAmount < 0) {
    throw new Error("Gross amount must be a non-negative finite number");
  }

  if (
    !Number.isInteger(platformFeeBps) ||
    platformFeeBps < 0 ||
    platformFeeBps > 10_000
  ) {
    throw new Error("Platform fee basis points must be between 0 and 10000");
  }

  if (
    !Number.isInteger(protocolFeeBps) ||
    protocolFeeBps < 0 ||
    protocolFeeBps > 10_000
  ) {
    throw new Error("Protocol fee basis points must be between 0 and 10000");
  }

  // Calculate fees rounded to 7 decimals (Stellar token precision)
  const platformFeeAmount = Number(
    (grossAmount * (platformFeeBps / 10_000)).toFixed(7),
  );
  const protocolFeeAmount = Number(
    (grossAmount * (protocolFeeBps / 10_000)).toFixed(7),
  );
  const totalFeeAmount = Number(
    (platformFeeAmount + protocolFeeAmount).toFixed(7),
  );
  const netAmount = Number(
    Math.max(0, grossAmount - totalFeeAmount).toFixed(7),
  );

  return {
    grossAmount,
    platformFeeBps,
    platformFeeAmount,
    protocolFeeBps,
    protocolFeeAmount,
    totalFeeAmount,
    netAmount,
    isEstimate: true,
  };
}
