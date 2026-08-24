"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPaymentParties } from "@/features/escrow/utils/roles";
import { cn } from "@/lib/utils";
import { EscrowSummarySections } from "@/features/escrow/components/review/escrow-summary-card";
import { GuardPanel } from "@/features/escrow/components/review/guard-panel";
import { MockActorSwitcher } from "@/features/escrow/components/review/mock-actor-switcher";
import { ResultBanner } from "@/features/escrow/components/review/result-banner";
import { ReviewHeader } from "@/features/escrow/components/review/review-header";
import {
  ApproverEmptySubmissions,
  ProviderSubmissionGate,
} from "@/features/escrow/components/review/submission-gate";
import { useReviewFlow } from "@/features/escrow/components/review/use-review-flow";

type ClientReviewViewProps = {
  escrowId: string;
};

const REVIEW_MOTION_CSS = `
@keyframes rv-fade-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes rv-pop-in{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
@keyframes rv-overlay-in{from{opacity:0}to{opacity:1}}
@keyframes rv-overlay-out{from{opacity:1}to{opacity:0}}
@keyframes rv-modal-in{from{opacity:0;transform:translate(-50%,-46%) scale(.96)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes rv-modal-out{from{opacity:1;transform:translate(-50%,-50%) scale(1)}to{opacity:0;transform:translate(-50%,-46%) scale(.96)}}
.rv-fade-up{animation:rv-fade-up .45s ease-out both}
.rv-delay-1{animation-delay:.07s}
.rv-delay-2{animation-delay:.14s}
.rv-pop{animation:rv-pop-in .18s ease-out both}
.rv-overlay[data-state="open"]{animation:rv-overlay-in .2s ease-out both}
.rv-overlay[data-state="closed"]{animation:rv-overlay-out .15s ease-in both}
.rv-modal[data-state="open"]{animation:rv-modal-in .25s cubic-bezier(.16,1,.3,1) both}
.rv-modal[data-state="closed"]{animation:rv-modal-out .2s ease-in both}
.rv-modal{scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.18) transparent}
.rv-modal::-webkit-scrollbar{width:6px;height:6px}
.rv-modal::-webkit-scrollbar-track{background:transparent}
.rv-modal::-webkit-scrollbar-thumb{background:rgba(0,0,0,.18);border-radius:9999px}
.rv-modal::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.28)}
@media (prefers-reduced-motion:reduce){.rv-fade-up,.rv-pop,.rv-stamp,.rv-overlay,.rv-modal{animation:none!important}}
`;

export const ClientReviewView = ({ escrowId }: ClientReviewViewProps) => {
  const {
    escrow,
    isLoading,
    isError,
    isMock,
    viewerRole,
    canReview,
    canRequestChanges,
    approvePending,
    requestChangesPending,
    handleApprove,
    handleRequestChanges,
    handleSubmitDeliverable,
    showWrongStatus,
    showFundedGate,
    showResubmitGate,
    showProviderWaiting,
    showApproverWaiting,
    showUnauthorized,
    hasBanner,
  } = useReviewFlow(escrowId);

  const guardVariant: "loading" | "error" | "not_found" =
    isLoading && !isError
      ? "loading"
      : isError
        ? "error"
        : "not_found";

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-950 sm:px-6 lg:px-8">
      <style>{REVIEW_MOTION_CSS}</style>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {!escrow ? (
          <>
            <Link
              href={`/escrow/${escrowId}`}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-zinc-500/[0.25] px-3 py-1 text-xs font-semibold text-neutral-500 transition-colors hover:border-red-300 hover:text-red-600"
            >
              <ArrowLeft aria-hidden className="h-3 w-3" />
              Back
            </Link>
            <GuardPanel variant={guardVariant} />
          </>
        ) : (
          <div className="rv-fade-up space-y-6">
            <Link
              href={`/escrow/${escrowId}`}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-zinc-500/[0.25] px-3 py-1 text-xs font-semibold text-neutral-500 transition-colors hover:border-red-300 hover:text-red-600"
            >
              <ArrowLeft aria-hidden className="h-3 w-3" />
              Back
            </Link>
            <ReviewHeader escrow={escrow} />

              {(isMock || hasBanner) && (
                <div className="space-y-5 pt-6">
                  {isMock && <MockActorSwitcher escrow={escrow} />}
                  {(escrow.status === "approved" ||
                    escrow.status === "revision_requested") && (
                    <div className={cn(isMock && "pt-5")}>
                    <ResultBanner
                      status={escrow.status}
                      escrowId={escrowId}
                      revisionNotes={escrow.milestone.revisionNotes}
                      viewerRole={viewerRole}
                    />
                  </div>
                )}
              </div>
            )}

              {(showFundedGate && viewerRole === "provider" || showResubmitGate) && (
                <div className="pt-6">
                  <ProviderSubmissionGate onSubmit={handleSubmitDeliverable} />
                </div>
              )}

              {showFundedGate && viewerRole !== "provider" && (
                <div className="pt-6">
                  <ApproverEmptySubmissions
                    providerName={
                      getPaymentParties(
                        escrow.paymentDirection,
                        escrow.workspace,
                        escrow.counterparty,
                      ).payee.name
                    }
                  />
                </div>
              )}

            {showWrongStatus && (
              <div className="border-t border-zinc-500/[0.08] pt-6">
                <GuardPanel variant="wrong_status" escrow={escrow} />
              </div>
            )}

            {showProviderWaiting && (
                <div className="pt-6">
                  <GuardPanel variant="provider_waiting" escrow={escrow} />
                </div>
              )}

              {showApproverWaiting && (
                <div className="pt-6">
                  <GuardPanel variant="approver_waiting" escrow={escrow} />
                </div>
              )}

              {showUnauthorized && (
                <div className="border-t border-zinc-500/[0.08] pt-6">
                  <GuardPanel variant="unauthorized" escrow={escrow} />
                </div>
              )}

            <EscrowSummarySections
              escrow={escrow}
              onApprove={handleApprove}
              onRequestChanges={handleRequestChanges}
              canReview={canReview}
              canRequestChanges={canRequestChanges}
              approvePending={approvePending}
              requestChangesPending={requestChangesPending}
            />
          </div>
        )}
      </div>
    </main>
  );
};
