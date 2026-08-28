/**
 * Typed, user-safe errors for the Trustless Work testnet runtime.
 *
 * Every message here is safe to surface in the UI: it never contains API keys,
 * private keys, signed/unsigned XDR, or other sensitive material. Orchestration
 * code should throw these instead of leaking raw SDK/network errors.
 */

export type TestnetErrorCode =
  | "config"
  | "wallet_not_connected"
  | "wrong_wallet"
  | "wrong_network"
  | "missing_trustline"
  | "insufficient_balance"
  | "api_key"
  | "rate_limited"
  | "signature_rejected"
  | "submission_failed"
  | "indexer_timeout"
  | "not_found";

export class TestnetError extends Error {
  readonly code: TestnetErrorCode;

  constructor(code: TestnetErrorCode, message: string) {
    super(message);
    this.name = "TestnetError";
    this.code = code;
  }
}

export class TestnetConfigError extends TestnetError {
  constructor(message: string) {
    super("config", message);
    this.name = "TestnetConfigError";
  }
}

export class WalletNotConnectedError extends TestnetError {
  constructor(
    message = "Connect your Stellar wallet to continue.",
  ) {
    super("wallet_not_connected", message);
    this.name = "WalletNotConnectedError";
  }
}

export class WrongWalletError extends TestnetError {
  readonly expected: string;
  readonly connected: string | null;

  constructor(roleLabel: string, expected: string, connected: string | null) {
    super(
      "wrong_wallet",
      `This action must be signed by the ${roleLabel} (${shortenAddress(
        expected,
      )}). Your connected wallet is ${
        connected ? shortenAddress(connected) : "not connected"
      }. Switch to the ${roleLabel} wallet and try again.`,
    );
    this.name = "WrongWalletError";
    this.expected = expected;
    this.connected = connected;
  }
}

export class MissingTrustlineError extends TestnetError {
  constructor(roleLabel: string, symbol: string) {
    super(
      "missing_trustline",
      `The ${roleLabel} wallet is not ready to use testnet ${symbol}. Add the ${symbol} trustline in your Stellar wallet and try again.`,
    );
    this.name = "MissingTrustlineError";
  }
}

export class InsufficientBalanceError extends TestnetError {
  constructor(symbol: string, required: number, available: number) {
    super(
      "insufficient_balance",
      `Insufficient testnet ${symbol}. This action needs ${required} ${symbol} but the connected wallet holds ${available} ${symbol}.`,
    );
    this.name = "InsufficientBalanceError";
  }
}

export class ApiKeyError extends TestnetError {
  constructor(
    message = "Trustless Work rejected the request. Check that NEXT_PUBLIC_API_KEY is a valid testnet API key.",
  ) {
    super("api_key", message);
    this.name = "ApiKeyError";
  }
}

export class SignatureRejectedError extends TestnetError {
  constructor(message = "Wallet signature was rejected or cancelled.") {
    super("signature_rejected", message);
    this.name = "SignatureRejectedError";
  }
}

export class SubmissionError extends TestnetError {
  constructor(
    message = "The signed transaction could not be submitted to the network. Please try again.",
  ) {
    super("submission_failed", message);
    this.name = "SubmissionError";
  }
}

export class IndexerTimeoutError extends TestnetError {
  constructor(expectedState: string) {
    super(
      "indexer_timeout",
      `The transaction was submitted but the indexer has not yet confirmed the expected state (${expectedState}). It may still settle shortly — refresh in a moment.`,
    );
    this.name = "IndexerTimeoutError";
  }
}

/** Shorten a G-address for display without exposing anything sensitive. */
export function shortenAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

/**
 * Normalize an unknown thrown value into a safe, user-facing message. Used at
 * the mutation boundary so raw SDK/network errors never reach the UI verbatim.
 */
export function toSafeErrorMessage(error: unknown): string {
  if (error instanceof TestnetError) return error.message;
  if (error instanceof Error) {
    const message = error.message ?? "";
    if (/429|rate limit/i.test(message)) {
      return "Trustless Work is rate limiting requests. Please wait a moment and try again.";
    }
    if (/401|unauthor/i.test(message)) {
      return new ApiKeyError().message;
    }
    if (/trustline/i.test(message)) {
      return "A participant is missing the required asset trustline. Add the USDC trustline and try again.";
    }
    if (/reject|declin|cancel/i.test(message)) {
      return new SignatureRejectedError().message;
    }
    // Generic fallback — do not echo raw message which may contain XDR.
    return "Something went wrong talking to the network. Please try again.";
  }
  return "Something went wrong. Please try again.";
}
