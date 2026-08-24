"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
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
      <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6">
        <section className="mx-auto w-full max-w-2xl space-y-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-52 w-full" />
        </section>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6">
        <section className="mx-auto w-full max-w-2xl">
          <BackLink escrowId={escrowId} />
          <Card className="mt-8">
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
        </section>
      </main>
    );
  }

  if (!escrow) {
    return (
      <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6">
        <section className="mx-auto w-full max-w-2xl">
          <BackLink escrowId={escrowId} />
          <div className="mt-8">
            <ReleaseBlockedCard escrowId={escrowId} reason="not-found" />
          </div>
        </section>
      </main>
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
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-2xl">
        <BackLink escrowId={escrowId} />

        <div className="mt-8 border-b border-border pb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Release
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Release funds
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
            Review the payment breakdown and confirm to complete the protected
            payment.
          </p>
        </div>

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
      </section>
    </main>
  );
};

const BackLink = ({ escrowId }: { escrowId: string }) => (
  <Link
    href={`/escrow/${escrowId}`}
    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
  >
    Back to escrow
  </Link>
);
