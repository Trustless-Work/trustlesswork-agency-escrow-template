import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateFeeBreakdown } from "@/features/escrow/utils/fees";
import type { AgencyEscrow } from "@/types/agency-escrow";
import { formatAmount, formatFeePercent } from "./format";
import { WalletAddress } from "./WalletAddress";
import {
  viewerCardClass,
  viewerLabelClass,
  viewerMutedClass,
  viewerTitleClass,
} from "./viewer-styles";

type EscrowPaymentCardProps = {
  escrow: AgencyEscrow;
};

export const EscrowPaymentCard = ({ escrow }: EscrowPaymentCardProps) => {
  const breakdown = calculateFeeBreakdown(
    escrow.payment.amount,
    escrow.fee.platformFeeBps,
  );

  return (
    <Card className={viewerCardClass}>
      <CardHeader>
        <CardTitle className={viewerTitleClass}>Payment</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <div>
          <p className={viewerLabelClass}>Amount</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-[#7eb6ff]">
            {formatAmount(escrow.payment.amount, escrow.payment.asset)}
          </p>
        </div>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className={viewerLabelClass}>
              Platform fee ({formatFeePercent(escrow.fee.platformFeeBps)})
            </dt>
            <dd className={`mt-1 ${viewerMutedClass}`}>
              {formatAmount(breakdown.platformFeeAmount, escrow.payment.asset)}
            </dd>
          </div>
          <div>
            <dt className={viewerLabelClass}>Payee receives</dt>
            <dd className="mt-1 font-medium text-white">
              {formatAmount(breakdown.netAmount, escrow.payment.asset)}
            </dd>
          </div>
        </dl>
        <p className="text-xs text-slate-500">
          Fee address <WalletAddress address={escrow.fee.platformAddress} />
        </p>
      </CardContent>
    </Card>
  );
};
