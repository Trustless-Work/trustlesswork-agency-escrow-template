"use client";

import {
  TrustlessWorkConfig,
  development,
  mainNet,
} from "@trustless-work/escrow";
import { createContext, useContext, type ReactNode } from "react";
import type { EscrowRuntimeMode } from "@/types/agency-escrow";

export type TrustlessWorkRuntimeContext = {
  mode: EscrowRuntimeMode;
  isMainnet: boolean;
  apiKeyConfigured: boolean;
};

const RuntimeContext = createContext<TrustlessWorkRuntimeContext | null>(null);

export function TrustlessWorkProvider({ children }: { children: ReactNode }) {
  const mode: EscrowRuntimeMode =
    process.env.NEXT_PUBLIC_ESCROW_MODE === "testnet" ? "testnet" : "mock";
  const isMainnet = process.env.NEXT_PUBLIC_USE_MAINNET === "true";
  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? "";

  return (
    <RuntimeContext.Provider
      value={{ mode, isMainnet, apiKeyConfigured: Boolean(apiKey) }}
    >
      <TrustlessWorkConfig
        baseURL={isMainnet ? mainNet : development}
        apiKey={apiKey}
      >
        {children}
      </TrustlessWorkConfig>
    </RuntimeContext.Provider>
  );
}

export function useTrustlessWorkRuntime() {
  const context = useContext(RuntimeContext);
  if (!context) {
    throw new Error(
      "useTrustlessWorkRuntime must be used within TrustlessWorkProvider",
    );
  }
  return context;
}
