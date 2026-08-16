"use client";

import { useQuery } from "@tanstack/react-query";
import { getAgencyEscrowService } from "@/features/escrow/services/escrow-service";
import { escrowQueryKeys } from "./query-keys";

export function useAgencyEscrows() {
  return useQuery({
    queryKey: escrowQueryKeys.lists(),
    queryFn: () => getAgencyEscrowService().listEscrows(),
  });
}

export function useAgencyEscrow(escrowId: string) {
  return useQuery({
    queryKey: escrowQueryKeys.detail(escrowId),
    queryFn: () => getAgencyEscrowService().getEscrow(escrowId),
    enabled: Boolean(escrowId),
  });
}

export function useEscrowActivity(escrowId: string) {
  return useQuery({
    queryKey: escrowQueryKeys.activity(escrowId),
    queryFn: () => getAgencyEscrowService().getEscrowEvents(escrowId),
    enabled: Boolean(escrowId),
  });
}
