import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPaymentParties } from "@/features/escrow/utils/roles";
import { formatAmount, humanizeStatus, truncateAddress } from "./format";
import type { AgencyEscrow } from "@/types/agency-escrow";

type ReleaseSummaryCardProps = {
  escrow: AgencyEscrow;
};

export const ReleaseSummaryCard = ({ escrow }: ReleaseSummaryCardProps) => {
  const { payer, payee } = getPaymentParties(
    escrow.paymentDirection,
    escrow.workspace,
    escrow.counterparty,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{escrow.agreement.title}</CardTitle>
            <CardDescription>
              Engagement {escrow.engagementId} ·{" "}
              {formatAmount(escrow.payment.amount)} {escrow.payment.asset}
            </CardDescription>
          </div>
          <Badge className="w-fit">{humanizeStatus(escrow.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Payer
            </p>
            <p className="mt-1 truncate text-sm font-medium">{payer.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {truncateAddress(payer.walletAddress)}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground max-sm:rotate-90" />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Payee
            </p>
            <p className="mt-1 truncate text-sm font-medium">{payee.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {truncateAddress(payee.walletAddress)}
            </p>
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          {escrow.milestone.description}
        </p>
      </CardContent>
    </Card>
  );
};
