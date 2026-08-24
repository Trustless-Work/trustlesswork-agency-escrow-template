import type { AgencyEscrowStatus } from "@/types/agency-escrow";

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatFeeRate(platformFeeBps: number): string {
  return `${(platformFeeBps / 100).toFixed(2)}%`;
}

export function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

const STATUS_LABELS: Record<AgencyEscrowStatus, string> = {
  created: "Created",
  funded: "Funded",
  in_review: "In review",
  revision_requested: "Changes requested",
  approved: "Approved",
  released: "Released",
  closed: "Closed",
};

export function humanizeStatus(status: AgencyEscrowStatus): string {
  return STATUS_LABELS[status];
}
