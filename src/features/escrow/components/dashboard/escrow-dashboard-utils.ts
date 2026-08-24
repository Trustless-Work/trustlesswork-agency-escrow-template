import type { AgencyEscrow, AgencyEscrowStatus } from "@/types/agency-escrow";

export type SortOption = "newest" | "status";

export const STATUS_LABELS: Record<AgencyEscrowStatus, string> = {
  created: "Created",
  funded: "Funded",
  in_review: "In Review",
  revision_requested: "Revision Requested",
  approved: "Approved",
  released: "Released",
  closed: "Closed",
};

export const STATUS_SORT_ORDER: Record<AgencyEscrowStatus, number> = {
  revision_requested: 0,
  created: 1,
  funded: 2,
  in_review: 3,
  approved: 4,
  released: 5,
  closed: 6,
};

export function getEscrowNextStep(escrow: AgencyEscrow): string {
  if (escrow.paymentDirection === "receivable") {
    switch (escrow.status) {
      case "created":
        return "Awaiting funding";
      case "funded":
        return "Submit deliverable";
      case "in_review":
        return "Awaiting review";
      case "revision_requested":
        return "Revise and resubmit";
      case "approved":
        return "Awaiting release";
      case "released":
        return "Completed";
      case "closed":
        return "Completed";
      default:
        return "Unknown";
    }
  }

  switch (escrow.status) {
    case "created":
      return "Fund escrow";
    case "funded":
      return "Awaiting delivery";
    case "in_review":
      return "Review deliverable";
    case "revision_requested":
      return "Awaiting revision";
    case "approved":
      return "Release payment";
    case "released":
      return "Completed";
    case "closed":
      return "Completed";
    default:
      return "Unknown";
  }
}

export function formatAmount(amount: number, asset: string): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} ${asset}`;
}

export function formatDate(date?: string): string {
  if (!date) return "";
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const value = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
      )
    : new Date(date);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}
