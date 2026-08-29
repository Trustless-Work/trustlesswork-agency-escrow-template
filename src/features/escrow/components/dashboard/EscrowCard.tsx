"use client";

import Link from "next/link";
import type { AgencyEscrow } from "@/types/agency-escrow";
import { getEscrowNextStep, formatAmount, formatDate } from "./escrow-dashboard-utils";
import { getPaymentParties } from "@/features/escrow/utils/roles";
import { StatusChip } from "@/features/escrow/components/shared";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type EscrowCardProps = {
  escrow: AgencyEscrow;
};

export const EscrowCard = ({ escrow }: EscrowCardProps) => {
  const { payer, payee } = getPaymentParties(
    escrow.paymentDirection,
    escrow.workspace,
    escrow.counterparty,
  );
  const isReceivable = escrow.paymentDirection === "receivable";
  const nextStep = getEscrowNextStep(escrow);

  return (
    <Link
      href={`/escrow/${escrow.escrowId}`}
      className="block transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="h-full">
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-card-foreground">
                {escrow.agreement.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {payer.name} → {payee.name}
              </p>
            </div>
            <Badge
              variant={isReceivable ? "secondary" : "default"}
              className="w-fit shrink-0"
            >
              {isReceivable ? "YOU ARE GETTING PAID" : "YOU ARE PAYING"}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="font-medium tabular-nums text-card-foreground">
              {formatAmount(escrow.payment.amount, escrow.payment.asset)}
            </span>
            <StatusChip status={escrow.status} />
            {escrow.agreement.dueDate ? (
              <span className="text-muted-foreground">
                Due {formatDate(escrow.agreement.dueDate)}
              </span>
            ) : null}
          </div>

          <p className="text-sm text-muted-foreground">{nextStep}</p>
        </div>
      </Card>
    </Link>
  );
};
