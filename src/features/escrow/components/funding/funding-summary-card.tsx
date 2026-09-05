import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateFeeBreakdown } from "@/features/escrow/utils/fees";
import { getPaymentParties } from "@/features/escrow/utils/roles";
import type { AgencyEscrow } from "@/types/agency-escrow";

const formatAmount = (amount: number, asset: string) =>
  `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount)} ${asset}`;

export function FundingSummaryCard({ escrow }: { escrow: AgencyEscrow }) {
  const { payer, payee } = getPaymentParties(
    escrow.paymentDirection,
    escrow.workspace,
    escrow.counterparty,
  );
  const breakdown = calculateFeeBreakdown(
    escrow.payment.amount,
    escrow.fee.platformFeeBps,
    escrow.fee.protocolFeeBps,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{escrow.agreement.title}</CardTitle>
        <CardDescription>Review the protected payment before funding it.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Protected amount</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">
            {formatAmount(escrow.payment.amount, escrow.payment.asset)}
          </p>
        </div>

        <dl className="divide-y divide-border text-sm">
          <div className="flex items-start justify-between gap-6 py-3 first:pt-0">
            <dt className="text-muted-foreground">Payer</dt>
            <dd className="text-right font-medium">{payer.name}</dd>
          </div>
          <div className="flex items-start justify-between gap-6 py-3">
            <dt className="text-muted-foreground">Recipient</dt>
            <dd className="text-right font-medium">{payee.name}</dd>
          </div>
          <div className="flex items-start justify-between gap-6 py-3">
            <dt className="text-muted-foreground">Platform fee</dt>
            <dd className="text-right">
              <span className="font-medium">{(escrow.fee.platformFeeBps / 100).toFixed(2)}%</span>
              <span className="block text-xs text-muted-foreground">
                {formatAmount(breakdown.platformFeeAmount, escrow.payment.asset)} at release
              </span>
            </dd>
          </div>
          <div className="flex items-start justify-between gap-6 py-3 last:pb-0">
            <dt className="text-muted-foreground">Recipient receives</dt>
            <dd className="text-right font-medium">
              {formatAmount(breakdown.netAmount, escrow.payment.asset)}
            </dd>
          </div>
        </dl>

        <div className="space-y-2 border-t border-border pt-5">
          <p className="text-sm font-medium">Acceptance criteria</p>
          <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {escrow.milestone.acceptanceCriteria}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
