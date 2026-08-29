import Link from "next/link";
import { Clock, Loader2, SearchX, ShieldAlert } from "lucide-react";
import type { AgencyEscrow } from "@/types/agency-escrow";
import { shortenAddress } from "./format";
import { ReviewCard } from "./review-card";
import { StatusChip } from "@/features/escrow/components/shared";
import { BodyText, MutedText, SectionHeading, Subheading } from "./typography";

function LoadingPanel() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <div className="h-3 w-16 animate-pulse rounded-full bg-neutral-200" />
        <div className="h-8 w-3/4 animate-pulse rounded-lg bg-neutral-200 sm:h-10" />
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-6 w-32 animate-pulse rounded-full bg-neutral-100" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        <span className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="h-9 w-24 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-neutral-100" />
        </div>
        <div className="ml-auto h-7 w-24 animate-pulse rounded-full bg-neutral-200" />
      </div>

      <div className="flex h-[370px] flex-col items-center justify-center gap-3 rounded-[24px] border border-zinc-500/[0.10] bg-white p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="h-14 w-14 animate-pulse rounded-full bg-neutral-200" />
        <div className="h-7 w-52 animate-pulse rounded bg-neutral-200" />
        <div className="mx-auto h-4 w-full max-w-md animate-pulse rounded bg-neutral-200" />
        <div className="mx-auto h-4 w-3/4 max-w-md animate-pulse rounded bg-neutral-100" />
      </div>
      <span className="sr-only">Loading review…</span>
    </div>
  );
}

function NotFoundPanel() {
  return (
    <ReviewCard
      bodyClassName="flex flex-col items-center gap-3 p-10 text-center"
    >
      <SearchX aria-hidden className="h-8 w-8 text-neutral-400" />
      <SectionHeading>Escrow not found</SectionHeading>
      <MutedText className="max-w-md">
        This escrow does not exist, failed to load, or has not been seeded in
        mock mode.
      </MutedText>
      <Link
        href="/agency"
        className="text-sm font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
      >
        Back to dashboard
      </Link>
    </ReviewCard>
  );
}

function ErrorPanel() {
  return (
    <ReviewCard
      bodyClassName="flex flex-col items-center gap-3 p-10 text-center"
    >
      <ShieldAlert aria-hidden className="h-8 w-8 text-red-500" />
      <SectionHeading>Couldn’t load this escrow</SectionHeading>
      <MutedText className="max-w-md">
        Something went wrong while fetching this escrow. This is usually
        transient — please try again.
      </MutedText>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="text-sm font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
      >
        Try again
      </button>
    </ReviewCard>
  );
}

const WRONG_STATUS_COPY: Record<string, { title: string; body: string }> = {
  created: {
    title: "Awaiting funding",
    body: "This escrow cannot be reviewed until the payer funds it.",
  },
  funded: {
    title: "Awaiting submission",
    body: "The service provider has not submitted the deliverable yet. Review unlocks once work is submitted.",
  },
  revision_requested: {
    title: "Revision in progress",
    body: "Changes were requested. The decision panel returns as soon as the service provider resubmits.",
  },
  released: {
    title: "Funds released",
    body: "This escrow is complete and no longer reviewable.",
  },
  closed: {
    title: "Closed",
    body: "This escrow is closed and archived.",
  },
};

function WrongStatusPanel({ escrow }: { escrow: AgencyEscrow }) {
  const copy = WRONG_STATUS_COPY[escrow.status];
  const notes = escrow.milestone.revisionNotes;

  return (
    <ReviewCard>
      <div className="flex flex-wrap items-center gap-3">
        <SectionHeading>{copy.title}</SectionHeading>
        <StatusChip status={escrow.status} />
      </div>
      <BodyText>{copy.body}</BodyText>
      {escrow.status === "revision_requested" && notes && (
        <blockquote className="whitespace-pre-line rounded-lg border-l-4 border-orange-300 bg-orange-50/60 px-4 py-3">
          <Subheading>Persisted revision notes</Subheading>
          <BodyText className="mt-1">{notes}</BodyText>
        </blockquote>
      )}
    </ReviewCard>
  );
}

function resolvePartyName(escrow: AgencyEscrow, walletAddress: string) {
  if (escrow.workspace.walletAddress === walletAddress) {
    return escrow.workspace.name;
  }
  if (escrow.counterparty.walletAddress === walletAddress) {
    return escrow.counterparty.name;
  }
  return null;
}

function UnauthorizedPanel({ escrow }: { escrow: AgencyEscrow }) {
  const approverName = resolvePartyName(escrow, escrow.roles.approver);

  return (
    <ReviewCard className="border-amber-500/30 bg-amber-50/60">
      <div className="flex flex-wrap items-center gap-3">
        <ShieldAlert aria-hidden className="h-5 w-5 text-amber-600" />
        <SectionHeading>Action available to the approver only</SectionHeading>
      </div>
      <BodyText>
        You are viewing in read-only mode. Only the derived approver can approve
        or request changes.
      </BodyText>
      <MutedText>
        Approver:{" "}
        <span className="font-semibold text-neutral-700">
          {approverName ?? "Unknown party"}
        </span>{" "}
        <span className="font-mono text-xs text-neutral-500">
          ({shortenAddress(escrow.roles.approver)})
        </span>
      </MutedText>
    </ReviewCard>
  );
}

function ProviderWaitingPanel({ escrow }: { escrow: AgencyEscrow }) {
  const approverName = resolvePartyName(escrow, escrow.roles.approver);

  return (
    <ReviewCard>
      <div className="flex flex-wrap items-center gap-3">
        <Clock aria-hidden className="h-5 w-5 text-amber-500" />
        <SectionHeading>Your work is under review</SectionHeading>
      </div>
      <BodyText>
        {approverName ?? "The approver"} is inspecting your submission against
        the agreed acceptance criteria. The result will appear here as soon as a
        decision is made.
      </BodyText>
    </ReviewCard>
  );
}

function ApproverWorkSubmittedPanel({ escrow }: { escrow: AgencyEscrow }) {
  const providerName = resolvePartyName(escrow, escrow.roles.serviceProvider);

  return (
    <ReviewCard bodyClassName="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Clock aria-hidden className="h-5 w-5 text-[#2f7bff] dark:text-[#7eb6ff]" />
        <SectionHeading>Work is Submitted</SectionHeading>
      </div>
      <BodyText>
        {providerName ?? "The provider"} is waiting for your review. Please inspect the submission against all acceptance criteria, verify that the requirements have been met, and either approve it or request the necessary changes.
      </BodyText>
    </ReviewCard>
  );
}

export type GuardPanelProps =
  | { variant: "loading" }
  | { variant: "error" }
  | { variant: "not_found" }
  | { variant: "wrong_status"; escrow: AgencyEscrow }
  | { variant: "unauthorized"; escrow: AgencyEscrow }
  | { variant: "provider_waiting"; escrow: AgencyEscrow }
  | { variant: "approver_waiting"; escrow: AgencyEscrow };

export function GuardPanel(props: GuardPanelProps) {
  switch (props.variant) {
    case "loading":
      return <LoadingPanel />;
    case "error":
      return <ErrorPanel />;
    case "not_found":
      return <NotFoundPanel />;
    case "wrong_status":
      return <WrongStatusPanel escrow={props.escrow} />;
    case "unauthorized":
      return <UnauthorizedPanel escrow={props.escrow} />;
    case "provider_waiting":
      return <ProviderWaitingPanel escrow={props.escrow} />;
    case "approver_waiting":
      return <ApproverWorkSubmittedPanel escrow={props.escrow} />;
    default:
      return (
        <ReviewCard bodyClassName="flex items-center gap-2">
          <Loader2 aria-hidden className="h-4 w-4 animate-spin text-neutral-400" />
          <MutedText>Loading…</MutedText>
        </ReviewCard>
      );
  }
}
