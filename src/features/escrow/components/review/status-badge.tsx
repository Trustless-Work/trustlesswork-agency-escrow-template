import { cn } from "@/lib/utils";
import type { AgencyEscrowStatus } from "@/types/agency-escrow";

type BadgeTone = "pending" | "approved" | "rejected";

const TONE_BY_STATUS: Record<AgencyEscrowStatus, BadgeTone> = {
  created: "pending",
  funded: "pending",
  in_review: "pending",
  revision_requested: "pending",
  approved: "approved",
  released: "approved",
  closed: "rejected",
};

const LABEL_BY_STATUS: Record<AgencyEscrowStatus, string> = {
  created: "created",
  funded: "funded",
  in_review: "in review",
  revision_requested: "revision requested",
  approved: "approved",
  released: "released",
  closed: "closed",
};

const TONE_CLASS: Record<BadgeTone, string> = {
  pending: "text-amber-600",
  approved: "text-[#2f7bff] dark:text-[#7eb6ff]",
  rejected: "text-red-600",
};

type ReviewStatusBadgeProps = {
  status: AgencyEscrowStatus;
  className?: string;
};

export function ReviewStatusBadge({
  status,
  className,
}: ReviewStatusBadgeProps) {
  const tone = TONE_BY_STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-zinc-500/[0.12] bg-white px-3 py-1 text-xs font-semibold text-neutral-700",
        TONE_CLASS[tone],
        className,
      )}
    >
      {LABEL_BY_STATUS[status]}
    </span>
  );
}
