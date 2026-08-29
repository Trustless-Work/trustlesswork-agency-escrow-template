"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-provider";
import { useTrustlessWorkRuntime } from "@/lib/trustlesswork-provider";
import {
  shortenAddress,
  toSafeErrorMessage,
} from "@/features/escrow/services/testnet/errors";

/**
 * Minimal, functional wallet actor bar for the two-party testnet lifecycle.
 *
 * In testnet the connected Stellar wallet IS the current actor for role gating
 * and signing, so the operator needs to connect, see the active address, and
 * switch between the two wallet identities (A and B).
 *
 * It never imports Trustless Work SDK hooks; it only reads the wallet context.
 */
export const WalletActorBar = () => {
  const { mode } = useTrustlessWorkRuntime();
  const { connected, address, connect, disconnect } = useWallet();
  const [busy, setBusy] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  // Mock mode has no real wallet identity to select.
  if (mode !== "testnet") return null;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setOperationError(null);
    try {
      await fn();
    } catch (error) {
      setOperationError(toSafeErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const handleSwitch = () =>
    run(async () => {
      await disconnect();
      await connect();
    });

  return (
    <div className="dark flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
            Testnet
          </span>
          {connected && address ? (
            <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">
              Acting as {shortenAddress(address)}
            </span>
          ) : (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              No wallet connected
            </span>
          )}
        </div>
        {operationError ? (
          <span role="alert" className="text-xs text-red-600 dark:text-red-400">
            {operationError}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {connected ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={handleSwitch}
              className="rounded-md border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
            >
              Switch wallet
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(disconnect)}
              className="rounded-md border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(connect)}
            className="rounded-md bg-neutral-950 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          >
            Connect wallet
          </button>
        )}
      </div>
    </div>
  );
};
