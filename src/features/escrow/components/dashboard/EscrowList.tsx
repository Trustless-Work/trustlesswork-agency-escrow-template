"use client";

import Link from "next/link";
import type { AgencyEscrow } from "@/types/agency-escrow";
import { Badge } from "@/components/ui/badge";
import { getPaymentParties } from "@/features/escrow/utils/roles";
import { StatusChip } from "@/features/escrow/components/shared";
import { EscrowCard } from "./EscrowCard";
import {
  formatAmount,
  formatDate,
  getEscrowNextStep,
} from "./escrow-dashboard-utils";

type EscrowListProps = {
  escrows: AgencyEscrow[];
};

export const EscrowList = ({ escrows }: EscrowListProps) => {
  if (!escrows.length) {
    return null;
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 md:hidden">
        {escrows.map((escrow) => (
          <EscrowCard key={escrow.escrowId} escrow={escrow} />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border bg-card text-card-foreground md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Escrow</th>
              <th className="px-4 py-3">Direction</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Next action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {escrows.map((escrow) => {
              const { payer, payee } = getPaymentParties(
                escrow.paymentDirection,
                escrow.workspace,
                escrow.counterparty,
              );
              const isReceivable = escrow.paymentDirection === "receivable";

              return (
                <tr key={escrow.escrowId} className="align-top transition-colors hover:bg-muted/30">
                  <td className="px-4 py-4">
                    <Link
                      href={`/escrow/${escrow.escrowId}`}
                      className="font-medium text-card-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {escrow.agreement.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {payer.name} → {payee.name}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={isReceivable ? "secondary" : "default"}>
                      {isReceivable ? "Getting paid" : "Paying"}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium tabular-nums text-card-foreground">
                    {formatAmount(escrow.payment.amount, escrow.payment.asset)}
                  </td>
                  <td className="px-4 py-4">
                    <StatusChip status={escrow.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                    {formatDate(escrow.agreement.dueDate) || "—"}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {getEscrowNextStep(escrow)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};
