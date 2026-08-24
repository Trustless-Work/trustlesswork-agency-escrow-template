import type { AgencyEscrowStatus } from '@/types/agency-escrow'

export function formatAmount(amount: number, asset: string): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return `${formatted} ${asset}`
}

const STATUS_LABELS: Record<AgencyEscrowStatus, string> = {
  created: 'Created',
  funded: 'Funded',
  in_review: 'In review',
  revision_requested: 'Revision requested',
  approved: 'Approved',
  released: 'Released',
  closed: 'Closed',
}

export function formatStatus(status: AgencyEscrowStatus): string {
  return STATUS_LABELS[status]
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * Date-only values such as `dueDate` are calendar dates, not instants. Parsing
 * them with `new Date('2026-08-30')` yields UTC midnight, which renders as the
 * previous day in western time zones, so they are parsed as local midnight
 * instead. Full ISO timestamps stay instants.
 */
export function formatDate(value?: string): string | null {
  if (!value) return null
  const parsed = DATE_ONLY_PATTERN.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value)
  if (Number.isNaN(parsed.getTime())) return null

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsed)
}

export function shortenAddress(address: string): string {
  return address.length <= 12
    ? address
    : `${address.slice(0, 6)}…${address.slice(-4)}`
}
