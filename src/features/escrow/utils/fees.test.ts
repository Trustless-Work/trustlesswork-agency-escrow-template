import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateFeeBreakdown,
  DEFAULT_PLATFORM_FEE_BPS,
  DEFAULT_TW_PROTOCOL_FEE_BPS,
} from "./fees.ts";

test("calculateFeeBreakdown — 100 USDC standard testnet scenario (30 bps platform + 30 bps protocol)", () => {
  const breakdown = calculateFeeBreakdown(100, 30, 30);
  assert.equal(breakdown.grossAmount, 100);
  assert.equal(breakdown.platformFeeBps, 30);
  assert.equal(breakdown.platformFeeAmount, 0.3);
  assert.equal(breakdown.protocolFeeBps, 30);
  assert.equal(breakdown.protocolFeeAmount, 0.3);
  assert.equal(breakdown.totalFeeAmount, 0.6);
  assert.equal(breakdown.netAmount, 99.4);
  assert.equal(breakdown.isEstimate, true);
});

test("calculateFeeBreakdown — 50 USDC escrow scenario (PR #37 / issue #20 benchmark)", () => {
  const breakdown = calculateFeeBreakdown(50, 30, 30);
  assert.equal(breakdown.grossAmount, 50);
  assert.equal(breakdown.platformFeeAmount, 0.15);
  assert.equal(breakdown.protocolFeeAmount, 0.15);
  assert.equal(breakdown.totalFeeAmount, 0.3);
  assert.equal(breakdown.netAmount, 49.7);
});

test("calculateFeeBreakdown — default options match 30 bps platform and 30 bps protocol", () => {
  const breakdown = calculateFeeBreakdown(100);
  assert.equal(breakdown.platformFeeBps, DEFAULT_PLATFORM_FEE_BPS);
  assert.equal(breakdown.protocolFeeBps, DEFAULT_TW_PROTOCOL_FEE_BPS);
  assert.equal(breakdown.netAmount, 99.4);
});

test("calculateFeeBreakdown — zero platform fee preserves protocol fee deduction", () => {
  const breakdown = calculateFeeBreakdown(100, 0, 30);
  assert.equal(breakdown.platformFeeAmount, 0);
  assert.equal(breakdown.protocolFeeAmount, 0.3);
  assert.equal(breakdown.totalFeeAmount, 0.3);
  assert.equal(breakdown.netAmount, 99.7);
});

test("calculateFeeBreakdown — zero gross amount yields zero fees and zero net", () => {
  const breakdown = calculateFeeBreakdown(0, 30, 30);
  assert.equal(breakdown.grossAmount, 0);
  assert.equal(breakdown.platformFeeAmount, 0);
  assert.equal(breakdown.protocolFeeAmount, 0);
  assert.equal(breakdown.totalFeeAmount, 0);
  assert.equal(breakdown.netAmount, 0);
});

test("calculateFeeBreakdown — decimal precision and rounding handling", () => {
  const breakdown = calculateFeeBreakdown(33.33, 30, 30);
  // 33.33 * 0.003 = 0.09999
  assert.equal(breakdown.platformFeeAmount, 0.09999);
  assert.equal(breakdown.protocolFeeAmount, 0.09999);
  assert.equal(breakdown.totalFeeAmount, 0.19998);
  assert.equal(breakdown.netAmount, 33.13002);
});

test("calculateFeeBreakdown — rejects negative gross amounts", () => {
  assert.throws(
    () => calculateFeeBreakdown(-10, 30, 30),
    /Gross amount must be a non-negative finite number/,
  );
});

test("calculateFeeBreakdown — rejects invalid platform fee bps", () => {
  assert.throws(
    () => calculateFeeBreakdown(100, -1, 30),
    /Platform fee basis points must be between 0 and 10000/,
  );
  assert.throws(
    () => calculateFeeBreakdown(100, 10001, 30),
    /Platform fee basis points must be between 0 and 10000/,
  );
  assert.throws(
    () => calculateFeeBreakdown(100, 2.5 as any, 30),
    /Platform fee basis points must be between 0 and 10000/,
  );
});

test("calculateFeeBreakdown — rejects invalid protocol fee bps", () => {
  assert.throws(
    () => calculateFeeBreakdown(100, 30, -5),
    /Protocol fee basis points must be between 0 and 10000/,
  );
  assert.throws(
    () => calculateFeeBreakdown(100, 30, 15000),
    /Protocol fee basis points must be between 0 and 10000/,
  );
});
