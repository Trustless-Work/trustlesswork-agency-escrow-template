import { ArrowRightIcon } from "lucide-react";
import { getPaymentParties } from "@/features/escrow/utils/roles";
import { cn } from "@/lib/utils";
import type { AgencyEscrow } from "@/types/agency-escrow";
import { formatEscrowStatus } from "./format";
import { viewerCardClass, viewerLabelClass, viewerPillClass, viewerTitleClass } from "./viewer-styles";

type EscrowDetailHeaderProps = {
  escrow: AgencyEscrow;
};

export const EscrowDetailHeader = ({ escrow }: EscrowDetailHeaderProps) => {
  const { payer, payee } = getPaymentParties(
    escrow.paymentDirection,
    escrow.workspace,
    escrow.counterparty,
  );
  const workspaceContext =
    escrow.paymentDirection === "payable"
      ? "YOU ARE PAYING"
      : "YOU ARE GETTING PAID";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-gray-500">Escrow viewer</p>
          <span className={viewerPillClass}>
            {formatEscrowStatus(escrow.status)}
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          <span className={viewerTitleClass}>
            {escrow.agreement.title}
          </span>
        </h1>
        <p className="mt-2 text-sm text-gray-500">{escrow.engagementId}</p>
        <p className={cn(viewerPillClass, "mt-4")}>{workspaceContext}</p>
      </div>

      <div className={cn(viewerCardClass, "flex flex-wrap items-center gap-4 p-5")}>
        <div>
          <p className={viewerLabelClass}>Payer</p>
          <p className="mt-1 font-semibold">{payer.name}</p>
        </div>
        <ArrowRightIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-[#006ee6]"
        />
        <div>
          <p className={viewerLabelClass}>Payee</p>
          <p className="mt-1 font-semibold">{payee.name}</p>
        </div>
      </div>
    </div>
  );
};
