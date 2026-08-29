import {
  InsufficientBalanceError,
  MissingTrustlineError,
  SubmissionError,
} from "./errors";

/**
 * Stellar readiness pre-flight checks against Horizon (testnet).
 *
 * Trustlines cannot be created through Trustless Work — participants add them
 * from their own wallet. Before funding/releasing we verify the relevant wallet
 * is actually ready to hold the asset (and, for funding, has enough balance),
 * so users get actionable guidance instead of a cryptic Soroban failure.
 */

const HORIZON_REQUEST_TIMEOUT_MS = 10_000;

type HorizonBalance = {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
};

export type AssetReadiness = {
  accountExists: boolean;
  hasTrustline: boolean;
  balance: number;
};

/**
 * Read an account's trustline + balance for a specific issued asset.
 * A missing account (404) is reported as `accountExists: false` rather than
 * throwing, so callers can produce a friendly "fund your testnet account" hint.
 */
export async function getAssetReadiness(
  horizonUrl: string,
  address: string,
  issuer: string,
  symbol: string,
): Promise<AssetReadiness> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HORIZON_REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(
      `${horizonUrl}/accounts/${encodeURIComponent(address)}`,
      {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      },
    );
  } catch (error) {
    if (controller.signal.aborted) {
      throw new SubmissionError(
        "The Stellar testnet readiness check timed out. Please try again.",
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404) {
    return { accountExists: false, hasTrustline: false, balance: 0 };
  }
  if (!response.ok) {
    throw new SubmissionError(
      `The Stellar testnet readiness check failed (${response.status}). Please try again.`,
    );
  }

  const account = (await response.json()) as { balances?: HorizonBalance[] };
  const balances = account.balances ?? [];
  const line = balances.find(
    (entry) =>
      entry.asset_type !== "native" &&
      entry.asset_code === symbol &&
      entry.asset_issuer === issuer,
  );

  return {
    accountExists: true,
    hasTrustline: Boolean(line),
    balance: line ? Number(line.balance) : 0,
  };
}

export async function assertTrustlineReady(
  horizonUrl: string,
  address: string,
  issuer: string,
  symbol: string,
  roleLabel: string,
): Promise<AssetReadiness> {
  const readiness = await getAssetReadiness(horizonUrl, address, issuer, symbol);
  if (!readiness.accountExists) {
    throw new SubmissionError(
      `The ${roleLabel} Stellar testnet account does not exist yet. Fund or create the account first, then add the ${symbol} trustline.`,
    );
  }
  if (!readiness.hasTrustline) {
    throw new MissingTrustlineError(roleLabel, symbol);
  }
  return readiness;
}

export async function assertBalanceAndTrustline(
  horizonUrl: string,
  address: string,
  issuer: string,
  symbol: string,
  requiredAmount: number,
  roleLabel: string,
): Promise<AssetReadiness> {
  const readiness = await assertTrustlineReady(
    horizonUrl,
    address,
    issuer,
    symbol,
    roleLabel,
  );
  if (readiness.balance < requiredAmount) {
    throw new InsufficientBalanceError(
      symbol,
      requiredAmount,
      readiness.balance,
    );
  }
  return readiness;
}
