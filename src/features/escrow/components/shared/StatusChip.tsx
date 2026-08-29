import type { AgencyEscrowStatus } from "@/types/agency-escrow";
import { cn } from "@/lib/utils";

const LABELS: Record<AgencyEscrowStatus, string> = {
  created: "Created",
  funded: "Funded",
  in_review: "In review",
  revision_requested: "Revision requested",
  approved: "Approved",
  released: "Released",
  closed: "Closed",
};

const TONES: Record<AgencyEscrowStatus, string> = {
  created: "border-slate-600/50 bg-slate-500/10 text-slate-300",
  funded: "border-[#2f7bff]/40 bg-[#2f7bff]/10 text-[#9cc8ff]",
  in_review: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  revision_requested: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  approved: "border-[#2f7bff]/40 bg-[#2f7bff]/10 text-[#9cc8ff]",
  released: "border-[#2f7bff]/40 bg-[#2f7bff]/10 text-[#9cc8ff]",
  closed: "border-slate-600/50 bg-slate-500/10 text-slate-400",
};

export function StatusChip({ status, className }: { status: AgencyEscrowStatus; className?: string }) {
  return (
    <span className={cn("inline-flex w-fit rounded-md border px-2 py-0.5 text-xs font-medium", TONES[status], className)}>
      {LABELS[status]}
    </span>
  );
}