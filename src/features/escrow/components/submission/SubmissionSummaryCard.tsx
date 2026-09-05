import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { calculateFeeBreakdown } from '@/features/escrow/utils/fees'
import { getPaymentParties } from '@/features/escrow/utils/roles'
import { StatusChip } from '@/features/escrow/components/shared'
import type { AgencyEscrow } from '@/types/agency-escrow'
import { formatAmount, formatDate, shortenAddress } from './format'
import { getServiceProvider } from './submission-access'

type SubmissionSummaryCardProps = {
  escrow: AgencyEscrow
}

const Row = ({ label, value }: { label: string; value: ReactNode }) => {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-2 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}

export const SubmissionSummaryCard = ({ escrow }: SubmissionSummaryCardProps) => {
  const { payer } = getPaymentParties(
    escrow.paymentDirection,
    escrow.workspace,
    escrow.counterparty,
  )
  const serviceProvider = getServiceProvider(escrow)
  const fee = calculateFeeBreakdown(
    escrow.payment.amount,
    escrow.fee.platformFeeBps,
  )
  const dueDate = formatDate(escrow.agreement.dueDate)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{escrow.agreement.title}</CardTitle>
            <CardDescription className="mt-1">
              Engagement {escrow.engagementId}
            </CardDescription>
          </div>
          <StatusChip status={escrow.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          {escrow.agreement.description}
        </p>

        <dl className="mt-4">
          <Row
            label="Submitting as"
            value={
              <span>
                {serviceProvider.party.name}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  service provider
                </span>
              </span>
            }
          />
          <Row
            label="Paid by"
            value={
              <span>
                {payer.name}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {shortenAddress(payer.walletAddress)}
                </span>
              </span>
            }
          />
          <Row
            label="Protected amount"
            value={formatAmount(fee.grossAmount, escrow.payment.asset)}
          />
          <Row
            label={`Platform fee (${fee.platformFeeBps / 100}%)`}
            value={`- ${formatAmount(fee.platformFeeAmount, escrow.payment.asset)}`}
          />
          <Row
            label={`Trustless Work protocol fee (${fee.protocolFeeBps / 100}%)`}
            value={`- ${formatAmount(fee.protocolFeeAmount, escrow.payment.asset)}`}
          />
          <Row
            label="You receive when payment is released (est.)"
            value={formatAmount(fee.netAmount, escrow.payment.asset)}
          />
          {dueDate ? <Row label="Due date" value={dueDate} /> : null}
        </dl>
      </CardContent>
    </Card>
  )
}
