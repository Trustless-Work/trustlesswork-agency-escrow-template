"use client";

import { useQuery } from "@tanstack/react-query";
import { getAgencyEscrowService } from "@/features/escrow/services/escrow-service";
import { isTestnetMode } from "@/features/escrow/config/escrow-config";
import { useWallet } from "@/lib/wallet-provider";
import { useTestnetEscrowRuntime } from "./testnet/use-testnet-escrow-runtime";
import { escrowQueryKeys } from "./query-keys";

export function useAgencyEscrows() {
  const testnet = useTestnetEscrowRuntime();
  const { address } = useWallet();
  const testnetMode = isTestnetMode();

  return useQuery({
    // In testnet the visible set depends on the connected wallet, so it is part
    // of the cache key — switching wallet refetches for the new actor.
    queryKey: testnetMode
      ? [...escrowQueryKeys.lists(), address ?? "anon"]
      : escrowQueryKeys.lists(),
    queryFn: () =>
      testnetMode
        ? testnet.listEscrows()
        : getAgencyEscrowService().listEscrows(),
  });
}

export function useAgencyEscrow(escrowId: string) {
  const testnet = useTestnetEscrowRuntime();
  const testnetMode = isTestnetMode();

  return useQuery({
    queryKey: escrowQueryKeys.detail(escrowId),
    queryFn: () =>
      testnetMode
        ? testnet.getEscrow(escrowId)
        : getAgencyEscrowService().getEscrow(escrowId),
    enabled: Boolean(escrowId),
  });
}

export function useEscrowActivity(escrowId: string) {
  const testnet = useTestnetEscrowRuntime();
  const testnetMode = isTestnetMode();

  return useQuery({
    queryKey: escrowQueryKeys.activity(escrowId),
    queryFn: () =>
      testnetMode
        ? testnet.getEscrowActivity(escrowId)
        : getAgencyEscrowService().getEscrowEvents(escrowId),
    enabled: Boolean(escrowId),
  });
}
