"use client";

import Link from "next/link";
import type { AgencyEscrow } from "@/types/agency-escrow";
import { Badge } from "@/components/ui/badge";
import { getPaymentParties } from "@/features/escrow/utils/roles";
import { EscrowCard } from "./EscrowCard";
import {
  STATUS_LABELS,
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

      <div className="hidden overflow-x-auto rounded-lg border border-neutral-200 bg-white md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Escrow</th>
              <th className="px-4 py-3">Direction</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Next action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {escrows.map((escrow) => {
              const { payer, payee } = getPaymentParties(
                escrow.paymentDirection,
                escrow.workspace,
                escrow.counterparty,
              );
              const isReceivable = escrow.paymentDirection === "receivable";

              return (
                <tr key={escrow.escrowId} className="align-top hover:bg-neutral-50">
                  <td className="px-4 py-4">
                    <Link
                      href={`/escrow/${escrow.escrowId}`}
                      className="font-medium text-neutral-950 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
                    >
                      {escrow.agreement.title}
                    </Link>
                    <p className="mt-1 text-xs text-neutral-500">
                      {payer.name} → {payee.name}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={isReceivable ? "secondary" : "default"}>
                      {isReceivable ? "Receivable" : "Payable"}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium tabular-nums text-neutral-950">
                    {formatAmount(escrow.payment.amount, escrow.payment.asset)}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline">{STATUS_LABELS[escrow.status]}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-neutral-600">
                    {formatDate(escrow.agreement.dueDate) || "—"}
                  </td>
                  <td className="px-4 py-4 text-neutral-600">
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
