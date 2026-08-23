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

export function formatDate(value?: string): string | null {
  if (!value) return null
  const parsed = new Date(value)
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
