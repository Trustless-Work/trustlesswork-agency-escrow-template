import type {
  AgencyEscrowEventType,
  AgencyEscrowParty,
  AgencyEscrowStatus,
} from "@/types/agency-escrow";

export function formatAmount(amount: number, asset: string): string {
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)} ${asset}`;
}

export function formatFeePercent(platformFeeBps: number): string {
  return `${platformFeeBps / 100}%`;
}

export function formatDueDate(value: string): string {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    const date = new Date(year, month - 1, day);

    const isValidCalendarDate =
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;

    if (!isValidCalendarDate) return value;

    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
      date,
    );
  }

  return formatTimestamp(value);
}

export function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatWalletAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatEscrowStatus(status: AgencyEscrowStatus): string {
  return {
    created: "Created",
    funded: "Funded",
    in_review: "In review",
    revision_requested: "Revision requested",
    approved: "Approved",
    released: "Released",
    closed: "Closed",
  }[status];
}

export function formatEventType(type: AgencyEscrowEventType): string {
  return {
    created: "Escrow created",
    funded: "Funded",
    submitted: "Work submitted",
    changes_requested: "Changes requested",
    resubmitted: "Work resubmitted",
    approved: "Approved",
    released: "Funds released",
    closed: "Closed",
  }[type];
}

export function resolvePartyName(
  address: string | undefined,
  parties: AgencyEscrowParty[],
): string | undefined {
  if (!address) return undefined;
  return parties.find((party) => party.walletAddress === address)?.name;
}
