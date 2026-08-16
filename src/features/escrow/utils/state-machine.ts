import type { AgencyEscrowStatus } from "@/types/agency-escrow";

const ALLOWED_TRANSITIONS: Record<AgencyEscrowStatus, AgencyEscrowStatus[]> = {
  created: ["funded"],
  funded: ["in_review"],
  in_review: ["revision_requested", "approved"],
  revision_requested: ["in_review"],
  approved: ["released"],
  released: ["closed"],
  closed: [],
};

export function canTransition(
  from: AgencyEscrowStatus,
  to: AgencyEscrowStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(
  from: AgencyEscrowStatus,
  to: AgencyEscrowStatus,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid escrow transition: ${from} → ${to}`);
  }
}

export function getNextStatuses(
  status: AgencyEscrowStatus,
): AgencyEscrowStatus[] {
  return [...ALLOWED_TRANSITIONS[status]];
}
