import { describe, it } from "node:test";
import assert from "node:assert";
import { calculateFeeBreakdown } from "./fees";

describe("calculateFeeBreakdown", () => {
  it("computes V1 canonical: 100 USDC at 30 bps platform + 30 bps protocol = 99.4 net", () => {
    const result = calculateFeeBreakdown(100, 30, 30);
    assert.strictEqual(result.grossAmount, 100);
    assert.strictEqual(result.platformFeeBps, 30);
    assert.strictEqual(result.protocolFeeBps, 30);
    assert.strictEqual(result.platformFeeAmount, 0.3);
    assert.strictEqual(result.protocolFeeAmount, 0.3);
    assert.strictEqual(result.netAmount, 99.4);
  });

  it("computes 50 USDC at 30 bps platform + 30 bps protocol = 49.7 net", () => {
    const result = calculateFeeBreakdown(50, 30, 30);
    assert.strictEqual(result.netAmount, 49.7);
  });

  it("defaults protocol fee to 30 bps when omitted", () => {
    const result = calculateFeeBreakdown(100, 30);
    assert.strictEqual(result.protocolFeeBps, 30);
    assert.strictEqual(result.protocolFeeAmount, 0.3);
    assert.strictEqual(result.netAmount, 99.4);
  });

  it("handles zero platform fee", () => {
    const result = calculateFeeBreakdown(100, 0, 30);
    assert.strictEqual(result.platformFeeAmount, 0);
    assert.strictEqual(result.protocolFeeAmount, 0.3);
    assert.strictEqual(result.netAmount, 99.7);
  });

  it("handles zero protocol fee", () => {
    const result = calculateFeeBreakdown(100, 30, 0);
    assert.strictEqual(result.platformFeeAmount, 0.3);
    assert.strictEqual(result.protocolFeeAmount, 0);
    assert.strictEqual(result.netAmount, 99.7);
  });

  it("handles zero both fees", () => {
    const result = calculateFeeBreakdown(100, 0, 0);
    assert.strictEqual(result.netAmount, 100);
  });

  it("rejects negative gross amount", () => {
    assert.throws(() => calculateFeeBreakdown(-1, 30, 30), /non-negative/);
  });

  it("rejects out-of-range platform fee bps", () => {
    assert.throws(() => calculateFeeBreakdown(100, 10_001, 30), /Platform fee/);
    assert.throws(() => calculateFeeBreakdown(100, -1, 30), /Platform fee/);
  });

  it("rejects out-of-range protocol fee bps", () => {
    assert.throws(() => calculateFeeBreakdown(100, 30, 10_001), /Protocol fee/);
    assert.throws(() => calculateFeeBreakdown(100, 30, -1), /Protocol fee/);
  });
});
