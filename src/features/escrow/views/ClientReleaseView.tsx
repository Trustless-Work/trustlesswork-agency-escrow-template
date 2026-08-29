"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAgencyEscrow, useReleaseProtectedPayment } from "@/features/escrow/hooks";
import { calculateFeeBreakdown } from "@/features/escrow/utils/fees";
import { canActorPerformAction, getPaymentParties } from "@/features/escrow/utils/roles";
import { useWallet } from "@/lib/wallet-provider";
import { ReleaseBlockedCard } from "@/features/escrow/components/release/release-blocked-card";
import { ReleaseCompletedCard } from "@/features/escrow/components/release/release-completed-card";
import { ReleaseConfirmPanel } from "@/features/escrow/components/release/release-confirm-panel";
import { ReleaseFeeBreakdown } from "@/features/escrow/components/release/release-fee-breakdown";
import { ReleaseSummaryCard } from "@/features/escrow/components/release/release-summary-card";
import { MockActorSwitcher } from "@/features/escrow/components/release/mock-actor-switcher";
import { formatAmount } from "@/features/escrow/components/release/format";
import { LifecycleShell, LifecyclePageHeader, LifecycleSkeleton, mutedClass } from "@/features/escrow/components/shared";

type ClientReleaseViewProps = {
  escrowId: string;
};

export const ClientReleaseView = ({ escrowId }: ClientReleaseViewProps) => {
  const { data: escrow, isLoading, isError } = useAgencyEscrow(escrowId);
  const releaseMutation = useReleaseProtectedPayment(escrowId);
  const { address, isMock, setMockAddress } = useWallet();
  const [confirming, setConfirming] = useState(false);

  if (isLoading) {
    return (
      <LifecycleShell backHref={`/escrow/${escrowId}`} backLabel="Back to escrow">
        <LifecyclePageHeader context="Release" title="Release funds" />
        <LifecycleSkeleton />
      </LifecycleShell>
    );
  }

  if (isError) {
    return (
      <LifecycleShell backHref={`/escrow/${escrowId}`} backLabel="Back to escrow">
        <LifecyclePageHeader context="Release" title="Release funds" />
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>We could not load this escrow</CardTitle>
              <CardDescription>
                Something went wrong while loading the payment details. Try again before assuming the escrow no longer exists.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={`/escrow/${escrowId}/release`}
                className={buttonVariants({ variant: "outline" })}
              >
                Try again
              </Link>
            </CardContent>
          </Card>
        </div>
      </LifecycleShell>
    );
  }

  if (!escrow) {
    return (
      <LifecycleShell backHref={`/escrow/${escrowId}`} backLabel="Back to escrow">
        <LifecyclePageHeader context="Release" title="Release funds" />
        <div className="mt-8">
          <ReleaseBlockedCard escrowId={escrowId} reason="not-found" />
        </div>
      </LifecycleShell>
    );
  }

  const { payee } = getPaymentParties(
    escrow.paymentDirection,
    escrow.workspace,
    escrow.counterparty,
  );
  const breakdown = calculateFeeBreakdown(
    escrow.payment.amount,
    escrow.fee.platformFeeBps,
  );
  const isApproved = escrow.status === "approved";
  const isCompleted = escrow.status === "released" || escrow.status === "closed";
  const isAuthorized = canActorPerformAction(escrow, "release", address);
  const signerName =
    escrow.roles.releaseSigner === escrow.workspace.walletAddress
      ? escrow.workspace.name
      : escrow.counterparty.name;

  const handleRelease = async () => {
    try {
      await releaseMutation.mutateAsync();
      setConfirming(false);
      toast.success("Payment released", {
        description: `The protected payment of ${formatAmount(breakdown.netAmount)} ${escrow.payment.asset} is complete.`,
      });
    } catch (error) {
      toast.error("Release failed", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    }
  };

  return (
    <LifecycleShell backHref={`/escrow/${escrowId}`} backLabel="Back to escrow">
      <LifecyclePageHeader context="Release" title="Release funds" />
      <p className={`mt-6 max-w-xl text-base leading-7 ${mutedClass}`}>
        Review the payment breakdown and confirm to complete the protected
        payment.
      </p>

      {isMock ? (
        <div className="mt-6">
          <MockActorSwitcher
            workspaceName={escrow.workspace.name}
            workspaceAddress={escrow.workspace.walletAddress}
            counterpartyName={escrow.counterparty.name}
            counterpartyAddress={escrow.counterparty.walletAddress}
            currentAddress={address}
            onSelect={setMockAddress}
          />
        </div>
      ) : null}

      <div className="mt-6 space-y-6">
        <ReleaseSummaryCard escrow={escrow} />
        <ReleaseFeeBreakdown
          breakdown={breakdown}
          asset={escrow.payment.asset}
        />

        {isCompleted || releaseMutation.isSuccess ? (
          <ReleaseCompletedCard
            escrowId={escrowId}
            payeeName={payee.name}
            netAmount={breakdown.netAmount}
            asset={escrow.payment.asset}
            alreadyReleased={isCompleted && !releaseMutation.isSuccess}
          />
        ) : !isApproved ? (
          <ReleaseBlockedCard escrowId={escrowId} reason="not-approved" />
        ) : !isAuthorized ? (
          <ReleaseBlockedCard
            escrowId={escrowId}
            reason="not-authorized"
            signerName={signerName}
          />
        ) : confirming ? (
          <ReleaseConfirmPanel
            payeeName={payee.name}
            netAmount={breakdown.netAmount}
            asset={escrow.payment.asset}
            isPending={releaseMutation.isPending}
            onConfirm={() => void handleRelease()}
            onCancel={() => setConfirming(false)}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Release funds</CardTitle>
              <CardDescription>
                Complete the protected payment to {payee.name}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Releasing sends{" "}
                <span className="font-medium text-foreground">
                  {formatAmount(breakdown.netAmount)} {escrow.payment.asset}
                </span>{" "}
                to {payee.name} and routes the platform fee automatically.
                This completes the protected payment and cannot be undone.
              </p>
              <Button
                type="button"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => setConfirming(true)}
              >
                Release funds
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </LifecycleShell>
  );
};