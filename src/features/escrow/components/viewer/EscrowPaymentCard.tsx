import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateFeeBreakdown } from "@/features/escrow/utils/fees";
import { cn } from "@/lib/utils";
import type { AgencyEscrow } from "@/types/agency-escrow";
import { formatAmount, formatFeePercent } from "./format";
import { WalletAddress } from "./WalletAddress";
import { viewerCardClass, viewerLabelClass, viewerMutedClass } from "./viewer-styles";

type EscrowPaymentCardProps = {
  escrow: AgencyEscrow;
};

export const EscrowPaymentCard = ({ escrow }: EscrowPaymentCardProps) => {
  const breakdown = calculateFeeBreakdown(
    escrow.payment.amount,
    escrow.fee.platformFeeBps,
  );

  return (
    <Card className={cn(viewerCardClass, "border-0 shadow-lg")}>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Payment</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <div>
          <p className={viewerLabelClass}>Amount</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-[#006ee6]">
            {formatAmount(escrow.payment.amount, escrow.payment.asset)}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <dt className={viewerLabelClass}>
              Platform fee ({formatFeePercent(escrow.fee.platformFeeBps)})
            </dt>
            <dd className={cn("mt-1", viewerMutedClass)}>
              {formatAmount(breakdown.platformFeeAmount, escrow.payment.asset)}
            </dd>
          </div>
          <div>
            <dt className={viewerLabelClass}>Payee receives</dt>
            <dd className="mt-1 font-medium">
              {formatAmount(breakdown.netAmount, escrow.payment.asset)}
            </dd>
          </div>
        </dl>
        <p className="text-xs text-gray-500">
          Fee address <WalletAddress address={escrow.fee.platformAddress} />
        </p>
      </CardContent>
    </Card>
  );
};
