"use client";

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
import { FundingSummaryCard } from "@/features/escrow/components/funding/funding-summary-card";
import { useAgencyEscrow, useFundProtectedPayment } from "@/features/escrow/hooks";
import { getPaymentParties } from "@/features/escrow/utils/roles";
import { useTrustlessWorkRuntime } from "@/lib/trustlesswork-provider";
import { LifecycleShell, LifecyclePageHeader, LifecycleSkeleton, mutedClass } from "@/features/escrow/components/shared";

type ClientFundingViewProps = {
  escrowId: string;
};

export const ClientFundingView = ({ escrowId }: ClientFundingViewProps) => {
  const { data: escrow, isLoading, isError } = useAgencyEscrow(escrowId);
  const fundMutation = useFundProtectedPayment(escrowId);
  const { mode } = useTrustlessWorkRuntime();

  if (isLoading) {
    return (
      <LifecycleShell backHref={`/escrow/${escrowId}`} backLabel="Back to escrow">
        <LifecyclePageHeader
          context="Fund protected payment"
          title="Secure the payment before work starts"
        />
        <LifecycleSkeleton />
      </LifecycleShell>
    );
  }

  if (isError) {
    return (
      <LifecycleShell backHref={`/escrow/${escrowId}`} backLabel="Back to escrow">
        <LifecyclePageHeader
          context="Fund protected payment"
          title="Secure the payment before work starts"
        />
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>We could not load this payment</CardTitle>
              <CardDescription>
                Something went wrong while loading the escrow. Try again before
                assuming it no longer exists.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={`/escrow/${escrowId}/fund`}
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
        <LifecyclePageHeader
          context="Fund protected payment"
          title="Secure the payment before work starts"
        />
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Escrow not found</CardTitle>
              <CardDescription>
                We could not find a protected payment with this ID.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/agency" className={buttonVariants({ variant: "outline" })}>
                Back to dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </LifecycleShell>
    );
  }

  const { payer, payee } = getPaymentParties(
    escrow.paymentDirection,
    escrow.workspace,
    escrow.counterparty,
  );
  const canFund = escrow.status === "created";
  const isFunded = escrow.status === "funded" || fundMutation.isSuccess;

  const handleFund = async () => {
    try {
      await fundMutation.mutateAsync();
      toast.success(mode === "mock" ? "Demo payment funded" : "Payment funded", {
        description:
          mode === "mock"
            ? "The mock escrow is now funded and ready for delivery."
            : "The protected payment is funded and ready for delivery.",
      });
    } catch (error) {
      toast.error("Funding failed", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    }
  };

  return (
    <LifecycleShell backHref={`/escrow/${escrowId}`} backLabel="Back to escrow">
      <LifecyclePageHeader
        context="Fund protected payment"
        title="Secure the payment before work starts"
        status={escrow.status}
      />
      <p className={`mt-6 max-w-xl text-base leading-7 ${mutedClass}`}>
        {payer.name} secures the payment now. {payee.name} receives it only
        after the deliverable is approved and the payment is released.
      </p>

      <div className="mt-8 space-y-6">
        {mode === "mock" ? (
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Demo mode</CardTitle>
              <CardDescription>
                This simulates funding the escrow. No wallet transaction or
                real funds will be used.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <FundingSummaryCard escrow={escrow} />

        {isFunded ? (
          <Card>
            <CardHeader>
              <CardTitle>Payment secured</CardTitle>
              <CardDescription>
                The protected payment is funded. {payee.name} can now submit
                the agreed deliverable for review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/escrow/${escrowId}`} className={buttonVariants()}>
                View escrow
              </Link>
            </CardContent>
          </Card>
        ) : !canFund ? (
          <Card>
            <CardHeader>
              <CardTitle>This payment cannot be funded again</CardTitle>
              <CardDescription>
                Funding is only available while an escrow is in the created
                state. This escrow is currently {escrow.status.replaceAll("_", " ")}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={`/escrow/${escrowId}`}
                className={buttonVariants({ variant: "outline" })}
              >
                View escrow
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Confirm funding</CardTitle>
              <CardDescription>
                Secure {escrow.payment.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })} {escrow.payment.asset} for this payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                The funds stay protected while the work is delivered and
                reviewed. Approval does not send payment automatically;
                release is a separate final step.
              </p>
              <Button
                type="button"
                size="lg"
                className="w-full sm:w-auto"
                disabled={fundMutation.isPending}
                onClick={() => void handleFund()}
              >
                {fundMutation.isPending
                  ? "Funding…"
                  : mode === "mock"
                    ? "Simulate funding"
                    : "Fund protected payment"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </LifecycleShell>
  );
};