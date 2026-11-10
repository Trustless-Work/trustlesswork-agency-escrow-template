/**
 * Default Trustless Work protocol fee in basis points (0.30% = 30 bps).
 * Deduced from testnet contract execution where 100 USDC escrow releases
 * 99.4 USDC to receiver and 0.3 USDC to platform fee.
 */
export const DEFAULT_PROTOCOL_FEE_BPS = 30;

export type FeeBreakdown = {
  grossAmount: number;
  platformFeeBps: number;
  platformFeeAmount: number;
  protocolFeeBps: number;
  protocolFeeAmount: number;
  totalFeeAmount: number;
  netAmount: number;
};

export function calculateFeeBreakdown(
  grossAmount: number,
  platformFeeBps: number,
  protocolFeeBps: number = DEFAULT_PROTOCOL_FEE_BPS,
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

  const platformFeeAmount = Number((grossAmount * (platformFeeBps / 10_000)).toFixed(7));
  const protocolFeeAmount = Number((grossAmount * (protocolFeeBps / 10_000)).toFixed(7));
  const totalFeeAmount = Number((platformFeeAmount + protocolFeeAmount).toFixed(7));
  const netAmount = Number((grossAmount - totalFeeAmount).toFixed(7));

  return {
    grossAmount,
    platformFeeBps,
    platformFeeAmount,
    protocolFeeBps,
    protocolFeeAmount,
    totalFeeAmount,
    netAmount,
  };
}
