import { describe, it, expect } from "vitest";
import { calculateFeeBreakdown, DEFAULT_PROTOCOL_FEE_BPS } from "./fees";

describe("calculateFeeBreakdown (Issue #45)", () => {
  it("reconciles Trustless Work protocol fee for 100 USDC escrow", () => {
    // 100 USDC escrow with 30 bps platform fee + 30 bps protocol fee
    const breakdown = calculateFeeBreakdown(100, 30, DEFAULT_PROTOCOL_FEE_BPS);

    expect(breakdown.grossAmount).toBe(100);
    expect(breakdown.platformFeeBps).toBe(30);
    expect(breakdown.platformFeeAmount).toBe(0.3);
    expect(breakdown.protocolFeeBps).toBe(30);
    expect(breakdown.protocolFeeAmount).toBe(0.3);
    expect(breakdown.totalFeeAmount).toBe(0.6);
    expect(breakdown.netAmount).toBe(99.4);
  });

  it("reconciles Trustless Work protocol fee for 50 USDC escrow", () => {
    // 50 USDC escrow with 30 bps platform fee + 30 bps protocol fee
    const breakdown = calculateFeeBreakdown(50, 30, DEFAULT_PROTOCOL_FEE_BPS);

    expect(breakdown.grossAmount).toBe(50);
    expect(breakdown.platformFeeAmount).toBe(0.15);
    expect(breakdown.protocolFeeAmount).toBe(0.15);
    expect(breakdown.totalFeeAmount).toBe(0.3);
    expect(breakdown.netAmount).toBe(49.7);
  });

  it("handles zero platform fee", () => {
    const breakdown = calculateFeeBreakdown(100, 0, DEFAULT_PROTOCOL_FEE_BPS);

    expect(breakdown.platformFeeAmount).toBe(0);
    expect(breakdown.protocolFeeAmount).toBe(0.3);
    expect(breakdown.netAmount).toBe(99.7);
  });

  it("handles zero protocol fee", () => {
    const breakdown = calculateFeeBreakdown(100, 30, 0);

    expect(breakdown.platformFeeAmount).toBe(0.3);
    expect(breakdown.protocolFeeAmount).toBe(0);
    expect(breakdown.netAmount).toBe(99.7);
  });

  it("rejects negative amounts and invalid bps", () => {
    expect(() => calculateFeeBreakdown(-10, 30)).toThrow();
    expect(() => calculateFeeBreakdown(100, -5)).toThrow();
    expect(() => calculateFeeBreakdown(100, 10_001)).toThrow();
  });
});
