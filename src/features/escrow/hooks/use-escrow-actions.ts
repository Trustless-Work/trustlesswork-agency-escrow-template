"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AgencyEscrowRoles,
  CreateAgencyEscrowInput,
  RequestChangesInput,
  SubmitDeliverableInput,
} from "@/types/agency-escrow";
import { getAgencyEscrowService } from "@/features/escrow/services/escrow-service";
import { isTestnetMode } from "@/features/escrow/config/escrow-config";
import { useTestnetEscrowRuntime } from "./testnet/use-testnet-escrow-runtime";
import { escrowQueryKeys } from "./query-keys";

function useRefreshEscrow() {
  const queryClient = useQueryClient();

  return async (escrowId?: string) => {
    await queryClient.invalidateQueries({ queryKey: escrowQueryKeys.lists() });
    if (escrowId) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: escrowQueryKeys.detail(escrowId) }),
        queryClient.invalidateQueries({ queryKey: escrowQueryKeys.activity(escrowId) }),
      ]);
    }
  };
}

type ActionRole = keyof Pick<
  AgencyEscrowRoles,
  "funder" | "serviceProvider" | "approver" | "releaseSigner"
>;

/**
 * Resolve the acting address for the MOCK service. In mock mode there is no real
 * wallet, so the actor is read from the seeded escrow's role map. (Testnet uses
 * the connected wallet as the actor inside the testnet runtime instead.)
 */
function useMockActor() {
  return async (escrowId: string, role: ActionRole) => {
    const escrow = await getAgencyEscrowService().getEscrow(escrowId);
    if (!escrow) throw new Error(`Escrow not found: ${escrowId}`);
    return escrow.roles[role];
  };
}

export function useCreateProtectedPayment() {
  const refresh = useRefreshEscrow();
  const testnet = useTestnetEscrowRuntime();

  return useMutation({
    mutationFn: (input: CreateAgencyEscrowInput) =>
      isTestnetMode()
        ? testnet.createEscrow(input)
        : getAgencyEscrowService().createEscrow(input),
    onSuccess: (escrow) => refresh(escrow.escrowId),
  });
}

export function useFundProtectedPayment(escrowId: string) {
  const refresh = useRefreshEscrow();
  const resolveActor = useMockActor();
  const testnet = useTestnetEscrowRuntime();

  return useMutation({
    mutationFn: async () => {
      if (isTestnetMode()) return testnet.fundEscrow(escrowId);
      const actorAddress = await resolveActor(escrowId, "funder");
      return getAgencyEscrowService().fundEscrow({ escrowId, actorAddress });
    },
    onSuccess: () => refresh(escrowId),
  });
}

export function useSubmitDeliverable(escrowId: string) {
  const refresh = useRefreshEscrow();
  const resolveActor = useMockActor();
  const testnet = useTestnetEscrowRuntime();

  return useMutation({
    mutationFn: async (data: SubmitDeliverableInput) => {
      if (isTestnetMode()) return testnet.submitDeliverable(escrowId, data);
      const actorAddress = await resolveActor(escrowId, "serviceProvider");
      return getAgencyEscrowService().submitDeliverable({
        escrowId,
        actorAddress,
        data,
      });
    },
    onSuccess: () => refresh(escrowId),
  });
}

export function useReviewDeliverable(escrowId: string) {
  const refresh = useRefreshEscrow();
  const resolveActor = useMockActor();
  const testnet = useTestnetEscrowRuntime();

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (isTestnetMode()) return testnet.approveDeliverable(escrowId);
      const actorAddress = await resolveActor(escrowId, "approver");
      return getAgencyEscrowService().approveDeliverable({
        escrowId,
        actorAddress,
      });
    },
    onSuccess: () => refresh(escrowId),
  });

  const requestChangesMutation = useMutation({
    mutationFn: async (data: RequestChangesInput) => {
      if (isTestnetMode()) return testnet.requestChanges(escrowId, data);
      const actorAddress = await resolveActor(escrowId, "approver");
      return getAgencyEscrowService().requestChanges({
        escrowId,
        actorAddress,
        data,
      });
    },
    onSuccess: () => refresh(escrowId),
  });

  return {
    approve: approveMutation.mutateAsync,
    requestChanges: requestChangesMutation.mutateAsync,
    approveMutation,
    requestChangesMutation,
    isPending: approveMutation.isPending || requestChangesMutation.isPending,
  };
}

export function useReleaseProtectedPayment(escrowId: string) {
  const refresh = useRefreshEscrow();
  const resolveActor = useMockActor();
  const testnet = useTestnetEscrowRuntime();

  return useMutation({
    mutationFn: async () => {
      if (isTestnetMode()) return testnet.releaseProtectedPayment(escrowId);
      const actorAddress = await resolveActor(escrowId, "releaseSigner");
      return getAgencyEscrowService().releaseProtectedPayment({
        escrowId,
        actorAddress,
      });
    },
    onSuccess: () => refresh(escrowId),
  });
}
