"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { AgencyEscrow, AgencyEscrowParty } from "@/types/agency-escrow";
import { getPaymentParties } from "@/features/escrow/utils/roles";
import { cn } from "@/lib/utils";
import { DeliverableLinks } from "./deliverable-links";
import { formatAmount, formatDate, shortenAddress } from "./format";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "./review-card";
import { ApproveConfirm } from "./approve-confirm";
import { RevisionNotesForm } from "./revision-notes-form";
import {
  BodyText,
  MicroLabel,
  MutedText,
  SectionHeading,
} from "./typography";

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <MicroLabel className="shrink-0">{label}</MicroLabel>
      <div className="min-w-0 sm:text-right">{children}</div>
    </div>
  );
}

function CopyAddressPill({
  address,
  copied,
  onCopy,
  disabled,
}: {
  address: string;
  copied: boolean;
  onCopy: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative inline-flex max-w-full flex-wrap items-center gap-1 overflow-hidden rounded-full bg-muted p-1",
        copied && "justify-center",
      )}
      style={{ borderRadius: 56 }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-secondary transition-all duration-500 ease-out"
        style={{ width: copied ? "100%" : "0%", borderRadius: 56 }}
      />
      <span className="relative grid place-items-center justify-center px-2" style={{ minWidth: 110 }}>
        <span
          className="col-start-1 row-start-1 whitespace-nowrap font-mono text-sm font-semibold tracking-tight text-muted-foreground transition-all duration-300"
          style={{
            opacity: copied ? 0 : 1,
            transform: copied ? "translateX(-8px)" : "translateX(0)",
            willChange: "transform",
          }}
        >
          {shortenAddress(address)}
        </span>
        <span
          className="col-start-1 row-start-1 inline-flex translate-x-8 items-center gap-1.5 whitespace-nowrap font-mono text-base font-semibold tracking-tight text-foreground transition-all duration-300"
          style={{
            opacity: copied ? 1 : 0,
            transform: copied ? "translateX(0)" : "translateX(8px)",
            willChange: "transform",
          }}
          aria-hidden
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#2f7bff] text-white">
            <svg
              viewBox="0 0 12 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-2.5 w-2.5"
              aria-hidden
            >
              <path d="M1 4.5 4.5 8 11 1" />
            </svg>
          </span>
          Copied!
        </span>
      </span>
      <button
        type="button"
        onClick={onCopy}
        disabled={disabled}
        aria-label={`Copy wallet address ${address}`}
        className="relative flex h-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-background px-3 text-xs font-medium text-foreground transition-all duration-300 ease-out hover:bg-accent disabled:opacity-50"
        style={{
          opacity: copied ? 0 : 1,
          transform: copied ? "scale(0.9)" : "scale(1)",
          pointerEvents: copied ? "none" : "auto",
        }}
      >
        Copy
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Wallet address copied to clipboard." : ""}
      </span>
    </div>
  );
}

function PartyMeta({ party }: { party: AgencyEscrowParty }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(party.walletAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-x-2 gap-y-1.5 sm:flex-col sm:items-start sm:justify-start sm:gap-x-0 sm:gap-y-1.5">
      <p className="shrink-0 text-sm font-medium text-foreground">{party.name}</p>
      <CopyAddressPill
        address={party.walletAddress}
        copied={copied}
        onCopy={handleCopy}
      />
    </div>
  );
}

function SummarySection({
  title,
  description,
  divided = false,
  children,
}: {
  title: string;
  description?: string;
  divided?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "space-y-2",
        divided && "border-t border-border pt-6",
      )}
    >
      <SectionHeading>{title}</SectionHeading>
      {description ? <MutedText>{description}</MutedText> : null}
      <div className="pt-1">{children}</div>
    </section>
  );
}

type EscrowSummaryCardProps = {
  escrow: AgencyEscrow;
};

type EscrowSummarySectionsProps = EscrowSummaryCardProps & {
  onApprove?: () => Promise<boolean>;
  onRequestChanges?: (values: { revisionNotes: string }) => Promise<boolean>;
  canReview?: boolean;
  canRequestChanges?: boolean;
  approvePending?: boolean;
  requestChangesPending?: boolean;
};

export function EscrowSummaryCard({ escrow }: EscrowSummaryCardProps) {
  return (
    <ReviewCard
      className="transition-shadow hover:shadow-md"
      bodyClassName="space-y-6"
    >
      <EscrowSummarySections escrow={escrow} />
    </ReviewCard>
  );
}

export function EscrowSummarySections({
  escrow,
  onApprove,
  onRequestChanges,
  canReview,
  canRequestChanges,
  approvePending,
  requestChangesPending,
}: EscrowSummarySectionsProps) {
  const { payer, payee } = getPaymentParties(
    escrow.paymentDirection,
    escrow.workspace,
    escrow.counterparty,
  );
  const dueDate = formatDate(escrow.agreement.dueDate);
  const submittedAt = formatDate(escrow.timestamps.submittedAt);
  const milestone = escrow.milestone;
  const hasSubmission = Boolean(
    milestone.deliverySummary ||
      milestone.deliverableLinks?.length ||
      milestone.evidence,
  );
  const criteriaLines = milestone.acceptanceCriteria
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <div className="space-y-6">
      <SummarySection title="Acceptance criteria">
        <div className="rounded-[20px] border border-border bg-card p-4">
          <div className="space-y-3">
            <MicroLabel>Requirements</MicroLabel>
            {criteriaLines.length > 1 ? (
              <div className="space-y-5">
                {criteriaLines.map((line, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
                      {index + 1}
                    </span>
                    <BodyText className="flex-1 leading-7">{line}</BodyText>
                  </div>
                ))}
              </div>
            ) : (
              <BodyText className="leading-7">
                {milestone.acceptanceCriteria}
              </BodyText>
            )}
            <div className="pt-4">
              <MicroLabel>Deliverable</MicroLabel>
            </div>
            <BodyText className="leading-7">{milestone.description}</BodyText>
          </div>
        </div>
      </SummarySection>

      <SummarySection divided title="Submitted work">
        {hasSubmission ? (
          <div className="rounded-[20px] border border-border bg-card p-4">
            <div className="py-4 first:pt-1 last:pb-1">
              <MicroLabel>Delivery summary</MicroLabel>
              <BodyText className="mt-2 whitespace-pre-line leading-7">
                {milestone.deliverySummary ?? "No summary provided."}
              </BodyText>
            </div>
            {milestone.deliverableLinks && milestone.deliverableLinks.length > 0 && (
              <div className="py-4">
                <MicroLabel>Deliverable links</MicroLabel>
                <div className="mt-2">
                  <DeliverableLinks links={milestone.deliverableLinks} />
                </div>
              </div>
            )}
            {milestone.evidence && (
              <div className="py-4">
                <MicroLabel>Evidence</MicroLabel>
                <div className="mt-2">
                  <DeliverableLinks links={[milestone.evidence]} />
                </div>
              </div>
            )}
            {milestone.revisionNotes && (
              <div className="py-4">
                <MicroLabel>Revision notes</MicroLabel>
                <BodyText className="mt-2 whitespace-pre-line leading-7">
                  {milestone.revisionNotes}
                </BodyText>
              </div>
            )}
          </div>
        ) : (
          <BodyText className="text-muted-foreground">Nothing submitted yet.</BodyText>
        )}
      </SummarySection>

      {canReview && (
        <div className="flex justify-end">
          <Button
            onClick={() => setReviewOpen(true)}
            className="flex h-11 cursor-pointer items-center justify-center rounded-full bg-[#2f7bff] px-6 text-[15px] font-semibold tracking-tight text-white shadow-sm transition-colors hover:bg-[#1f6aee]"
          >
            Review
          </Button>
        </div>
      )}

      <Dialog.Root open={reviewOpen} onOpenChange={setReviewOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="rv-overlay fixed inset-0 z-40 bg-black/60" />
          <Dialog.Content className="dark rv-modal fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(92vw,640px)] overflow-y-auto rounded-[20px] border border-border bg-card p-4 text-card-foreground shadow-2xl focus:outline-none sm:rounded-[28px] sm:p-6">
            <div className="space-y-1">
              <Dialog.Title className="text-xl font-medium tracking-tight text-foreground">
                Review deliverables
              </Dialog.Title>
              <p className="text-sm font-medium leading-5 text-muted-foreground">
                Inspect the submission against the agreed criteria — approve or request changes.
              </p>
            </div>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-muted p-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <MicroLabel>Delivery summary</MicroLabel>
                    <BodyText className="whitespace-pre-line">
                      {milestone.deliverySummary ?? "No summary provided."}
                    </BodyText>
                  </div>
                  {milestone.deliverableLinks && milestone.deliverableLinks.length > 0 && (
                    <div className="space-y-2">
                      <MicroLabel>Deliverable links</MicroLabel>
                      <DeliverableLinks links={milestone.deliverableLinks} />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <RevisionNotesForm
                  hideButton
                  id="review-revision-form"
                  pending={requestChangesPending}
                  disabled={approvePending || !canRequestChanges}
                  variant="soft"
                  onSubmit={async (values) => {
                    const ok = await onRequestChanges?.(values);
                    if (ok) setReviewOpen(false);
                    return !!ok;
                  }}
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    type="submit"
                    form="review-revision-form"
                    disabled={approvePending || !canRequestChanges || !!requestChangesPending}
                    className="h-11 w-full cursor-pointer rounded-full border border-amber-500/30 bg-amber-500/10 px-6 text-[15px] font-semibold tracking-tight text-amber-300 transition-colors hover:bg-amber-500/15 sm:w-auto"
                  >
                    Request changes
                  </Button>
                  <ApproveConfirm
                    pending={!!approvePending}
                    disabled={!!requestChangesPending}
                    onConfirm={async () => {
                      const ok = await onApprove?.();
                      if (ok) setReviewOpen(false);
                      return !!ok;
                    }}
                  />
                </div>
                <MutedText>Your decision will be shared with the provider immediately.</MutedText>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <SummarySection divided title="Engagement terms">
        <div className="rounded-[20px] border border-border bg-card p-4">
          <div className="divide-y divide-border">
            <MetaRow label="Payer">
              <PartyMeta party={payer} />
            </MetaRow>
            <MetaRow label="Payee">
              <PartyMeta party={payee} />
            </MetaRow>
            <MetaRow label="Payment">
              <p className="text-sm font-semibold text-foreground">
                {formatAmount(escrow.payment.amount, escrow.payment.asset)}
              </p>
            </MetaRow>
            <MetaRow label="Platform fee">
              <MutedText>{(escrow.fee.platformFeeBps / 100).toFixed(2)}%</MutedText>
            </MetaRow>
            <MetaRow label="Due date">
              <MutedText>{dueDate ?? "—"}</MutedText>
            </MetaRow>
            <MetaRow label="Submitted">
              <MutedText>{submittedAt ?? "—"}</MutedText>
            </MetaRow>
          </div>
        </div>
      </SummarySection>
    </div>
  );
}
