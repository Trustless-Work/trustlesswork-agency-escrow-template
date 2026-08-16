"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AgencyEscrowRoles,
  CreateAgencyEscrowInput,
  RequestChangesInput,
  SubmitDeliverableInput,
} from "@/types/agency-escrow";
import { getAgencyEscrowService } from "@/features/escrow/services/escrow-service";
import { useWallet } from "@/lib/wallet-provider";
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

function useActionActor() {
  const { address, isMock } = useWallet();

  return async (escrowId: string, role: ActionRole) => {
    if (!isMock) {
      if (!address) {
        throw new Error("Connect the required Stellar wallet before continuing.");
      }
      return address;
    }

    const escrow = await getAgencyEscrowService().getEscrow(escrowId);
    if (!escrow) throw new Error(`Escrow not found: ${escrowId}`);
    return escrow.roles[role];
  };
}

export function useCreateProtectedPayment() {
  const refresh = useRefreshEscrow();

  return useMutation({
    mutationFn: (input: CreateAgencyEscrowInput) =>
      getAgencyEscrowService().createEscrow(input),
    onSuccess: (escrow) => refresh(escrow.escrowId),
  });
}

export function useFundProtectedPayment(escrowId: string) {
  const refresh = useRefreshEscrow();
  const resolveActor = useActionActor();

  return useMutation({
    mutationFn: async () => {
      const actorAddress = await resolveActor(escrowId, "funder");
      return getAgencyEscrowService().fundEscrow({ escrowId, actorAddress });
    },
    onSuccess: () => refresh(escrowId),
  });
}

export function useSubmitDeliverable(escrowId: string) {
  const refresh = useRefreshEscrow();
  const resolveActor = useActionActor();

  return useMutation({
    mutationFn: async (data: SubmitDeliverableInput) => {
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
  const resolveActor = useActionActor();

  const approveMutation = useMutation({
    mutationFn: async () => {
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
  const resolveActor = useActionActor();

  return useMutation({
    mutationFn: async () => {
      const actorAddress = await resolveActor(escrowId, "releaseSigner");
      return getAgencyEscrowService().releaseProtectedPayment({
        escrowId,
        actorAddress,
      });
    },
    onSuccess: () => refresh(escrowId),
  });
}
