import { ArrowRight } from "lucide-react";
import type { AgencyEscrow } from "@/types/agency-escrow";
import { getPaymentParties } from "@/features/escrow/utils/roles";
import { StatusChip } from "@/features/escrow/components/shared";
import { PageHeading } from "./typography";

type ReviewHeaderProps = {
  escrow: AgencyEscrow;
};

export function ReviewHeader({ escrow }: ReviewHeaderProps) {
  const { payer, payee } = getPaymentParties(
    escrow.paymentDirection,
    escrow.workspace,
    escrow.counterparty,
  );

  return (
    <header>
      <PageHeading>{escrow.agreement.title}</PageHeading>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="inline-flex items-center rounded-full border border-zinc-500/[0.12] bg-white px-3 py-1 text-xs font-semibold text-neutral-700">
          {escrow.paymentDirection}
        </span>
        <span className="text-sm font-medium text-neutral-900">
          {payer.name}
        </span>
        <ArrowRight aria-hidden className="h-4 w-4 text-neutral-400" />
        <span className="text-sm font-medium text-neutral-900">
          {payee.name}
        </span>
        <StatusChip status={escrow.status} />
      </div>
    </header>
  );
}
