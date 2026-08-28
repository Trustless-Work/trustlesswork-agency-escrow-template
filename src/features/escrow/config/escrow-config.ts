import type { EscrowRuntimeMode } from "@/types/agency-escrow";
import { TestnetConfigError } from "../services/testnet/errors.ts";

/**
 * Runtime + network configuration for the escrow layer.
 *
 * Network source of truth (V1): the app runs on Stellar TESTNET only. `mainnet`
 * is explicitly out of scope for this issue, so we fail fast if someone tries to
 * force it on. `NEXT_PUBLIC_USE_MAINNET` is reconciled here rather than being
 * read independently in multiple places.
 */

export const STELLAR_TESTNET = "testnet" as const;
export const TESTNET_NETWORK_PASSPHRASE =
  "Test SDF Network ; September 2015";
export const TESTNET_HORIZON_URL = "https://horizon-testnet.stellar.org";

/** V1 settles in USDC. */
export const ESCROW_ASSET_SYMBOL = "USDC";

const STELLAR_ADDRESS_RE = /^G[A-Z2-7]{55}$/;

export function isStellarAddress(value: string | undefined | null): boolean {
  return typeof value === "string" && STELLAR_ADDRESS_RE.test(value.trim());
}

export function getEscrowRuntimeMode(): EscrowRuntimeMode {
  return process.env.NEXT_PUBLIC_ESCROW_MODE === "testnet" ? "testnet" : "mock";
}

export function isTestnetMode(): boolean {
  return getEscrowRuntimeMode() === "testnet";
}

/** True only if a mainnet flag is set — used purely to fail fast in V1. */
export function isMainnetRequested(): boolean {
  return process.env.NEXT_PUBLIC_USE_MAINNET === "true";
}

export type TestnetConfig = {
  apiKey: string;
  platformAddress: string;
  disputeResolverAddress: string;
  usdcIssuer: string;
  network: typeof STELLAR_TESTNET;
  networkPassphrase: string;
  horizonUrl: string;
  assetSymbol: string;
};

/**
 * Validate and return the testnet configuration. Fails fast with a
 * `TestnetConfigError` listing every missing/invalid value so misconfiguration
 * is obvious at the boundary rather than as a cryptic downstream failure.
 *
 * There are intentionally NO fake fallback addresses in real mode.
 */
export function getTestnetConfig(): TestnetConfig {
  if (isMainnetRequested()) {
    throw new TestnetConfigError(
      "Mainnet is out of scope for V1. Set NEXT_PUBLIC_USE_MAINNET=false (testnet only).",
    );
  }

  const apiKey = (process.env.NEXT_PUBLIC_API_KEY ?? "").trim();
  const platformAddress = (process.env.NEXT_PUBLIC_PLATFORM_ADDRESS ?? "").trim();
  const disputeResolverAddress = (
    process.env.NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS ?? ""
  ).trim();
  const usdcIssuer = (process.env.NEXT_PUBLIC_USDC_ISSUER ?? "").trim();

  const problems: string[] = [];
  if (!apiKey) problems.push("NEXT_PUBLIC_API_KEY is required in testnet mode");
  if (!isStellarAddress(platformAddress)) {
    problems.push("NEXT_PUBLIC_PLATFORM_ADDRESS must be a valid G-address");
  }
  if (!isStellarAddress(disputeResolverAddress)) {
    problems.push(
      "NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS must be a valid G-address",
    );
  }
  if (!isStellarAddress(usdcIssuer)) {
    problems.push(
      "NEXT_PUBLIC_USDC_ISSUER must be the G-issuer address of testnet USDC (never a C-contract address)",
    );
  }
  if (usdcIssuer.startsWith("C")) {
    problems.push(
      "NEXT_PUBLIC_USDC_ISSUER is a C-address; the trustline issuer must be the G-issuer address, not a Soroban contract",
    );
  }

  if (problems.length > 0) {
    throw new TestnetConfigError(
      `Testnet configuration is incomplete:\n- ${problems.join("\n- ")}`,
    );
  }

  return {
    apiKey,
    platformAddress,
    disputeResolverAddress,
    usdcIssuer,
    network: STELLAR_TESTNET,
    networkPassphrase: TESTNET_NETWORK_PASSPHRASE,
    horizonUrl: TESTNET_HORIZON_URL,
    assetSymbol: ESCROW_ASSET_SYMBOL,
  };
}

/** Non-throwing config probe for surfacing setup status in the UI. */
export function getTestnetConfigStatus(): {
  ok: boolean;
  problems: string[];
} {
  try {
    getTestnetConfig();
    return { ok: true, problems: [] };
  } catch (error) {
    const message =
      error instanceof TestnetConfigError ? error.message : "Invalid config";
    return { ok: false, problems: [message] };
  }
}
