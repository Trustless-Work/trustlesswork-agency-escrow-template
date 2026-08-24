"use client";

import { toast } from "sonner";
import {
  useAgencyEscrow,
  useReviewDeliverable,
} from "@/features/escrow/hooks";
import { canActorPerformAction } from "@/features/escrow/utils/roles";
import { useWallet } from "@/lib/wallet-provider";

export type ReviewViewerRole = "approver" | "provider" | "other";

export function useReviewFlow(escrowId: string) {
  const { data: escrow, isLoading, isError } = useAgencyEscrow(escrowId);
  const { address, isMock } = useWallet();
  const { approve, requestChanges, approveMutation, requestChangesMutation } =
    useReviewDeliverable(escrowId);

  const viewerRole: ReviewViewerRole = !escrow || !address
    ? ("other" as const)
    : address === escrow.roles.approver
      ? ("approver" as const)
      : address === escrow.roles.serviceProvider
        ? ("provider" as const)
        : ("other" as const);

  const canReview = Boolean(
    escrow && canActorPerformAction(escrow, "approve", address),
  );
  const canRequestChanges = Boolean(
    escrow && canActorPerformAction(escrow, "request_changes", address),
  );

  const handleApprove = async () => {
    try {
      await approve();
      toast.success("Deliverable approved", {
        description: "Approval recorded. This decision is permanent.",
      });
      return true;
    } catch (error) {
      toast.error("Could not approve deliverable", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
      return false;
    }
  };

  const handleRequestChanges = async (values: { revisionNotes: string }) => {
    try {
      await requestChanges({ revisionNotes: values.revisionNotes });
      toast.success("Revision requested", {
        description: "Your notes were saved for the service provider.",
      });
      return true;
    } catch (error) {
      toast.error("Could not request changes", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
      return false;
    }
  };

  const status = escrow?.status;
  const statusFlags = {
    showWrongStatus:
      status === "created" || status === "released" || status === "closed",
    showFundedGate: status === "funded",
    showProviderWaiting: status === "in_review" && viewerRole === "provider",
    showApproverWaiting:
      status === "in_review" && viewerRole === "approver" && canReview,
    showUnauthorized:
      status === "in_review" && !canReview && viewerRole === "other",
    hasBanner: status === "approved" || status === "revision_requested",
  };

  return {
    escrow,
    isLoading,
    isError,
    isMock,
    viewerRole,
    canReview,
    canRequestChanges,
    approvePending: approveMutation.isPending,
    requestChangesPending: requestChangesMutation.isPending,
    handleApprove,
    handleRequestChanges,
    ...statusFlags,
  };
}
