"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateAgencyEscrowInput,
  RequestChangesInput,
  SubmitDeliverableInput,
} from "@/types/agency-escrow";
import { getAgencyEscrowService } from "@/features/escrow/services/escrow-service";
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

  return useMutation({
    mutationFn: (actorAddress: string) =>
      getAgencyEscrowService().fundEscrow({ escrowId, actorAddress }),
    onSuccess: () => refresh(escrowId),
  });
}

export function useSubmitDeliverable(escrowId: string) {
  const refresh = useRefreshEscrow();

  return useMutation({
    mutationFn: ({
      actorAddress,
      data,
    }: {
      actorAddress: string;
      data: SubmitDeliverableInput;
    }) =>
      getAgencyEscrowService().submitDeliverable({ escrowId, actorAddress, data }),
    onSuccess: () => refresh(escrowId),
  });
}

export function useReviewDeliverable(escrowId: string) {
  const refresh = useRefreshEscrow();

  const approveMutation = useMutation({
    mutationFn: (actorAddress: string) =>
      getAgencyEscrowService().approveDeliverable({ escrowId, actorAddress }),
    onSuccess: () => refresh(escrowId),
  });

  const requestChangesMutation = useMutation({
    mutationFn: ({
      actorAddress,
      data,
    }: {
      actorAddress: string;
      data: RequestChangesInput;
    }) =>
      getAgencyEscrowService().requestChanges({ escrowId, actorAddress, data }),
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

  return useMutation({
    mutationFn: (actorAddress: string) =>
      getAgencyEscrowService().releaseProtectedPayment({ escrowId, actorAddress }),
    onSuccess: () => refresh(escrowId),
  });
}
