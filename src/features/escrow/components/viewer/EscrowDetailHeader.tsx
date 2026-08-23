import { ArrowRightIcon } from "lucide-react";
import { getPaymentParties } from "@/features/escrow/utils/roles";
import type { AgencyEscrow } from "@/types/agency-escrow";
import { formatEscrowStatus } from "./format";
import { viewerChipClass, viewerLabelClass } from "./viewer-styles";

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
    <div className="border-b border-white/10 pb-8">
      <p className={viewerLabelClass}>Escrow viewer</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {escrow.agreement.title}
        </h1>
        <span className={viewerChipClass}>
          {formatEscrowStatus(escrow.status)}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-400">{escrow.engagementId}</p>
      <p className={`${viewerLabelClass} mt-4`}>{workspaceContext}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <div>
          <p className={viewerLabelClass}>Payer</p>
          <p className="mt-1 font-medium text-white">{payer.name}</p>
        </div>
        <ArrowRightIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-[#2f7bff]"
        />
        <div>
          <p className={viewerLabelClass}>Payee</p>
          <p className="mt-1 font-medium text-white">{payee.name}</p>
        </div>
      </div>
    </div>
  );
};
