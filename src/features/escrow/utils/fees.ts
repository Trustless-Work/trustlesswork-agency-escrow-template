export type FeeBreakdown = {
  grossAmount: number;
  platformFeeBps: number;
  platformFeeAmount: number;
  netAmount: number;
};

export function calculateFeeBreakdown(
  grossAmount: number,
  platformFeeBps: number,
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

  const platformFeeAmount = grossAmount * (platformFeeBps / 10_000);

  return {
    grossAmount,
    platformFeeBps,
    platformFeeAmount,
    netAmount: grossAmount - platformFeeAmount,
  };
}
