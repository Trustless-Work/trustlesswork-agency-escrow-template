import { ArrowRight, ShieldCheck, Target } from "lucide-react";
import type { PaymentDirection } from "@/types/agency-escrow";
import type { FeeBreakdown } from "@/features/escrow/utils/fees";
import { formatAsset, formatFeePercent, getDirectionCopy } from "./create-flow";

export type EscrowPreviewData = {
  direction: PaymentDirection;
  payerName: string;
  payeeName: string;
  amount: number;
  asset: string;
  deliverableTitle: string;
  acceptanceCriteria: string;
  dueDate?: string;
  fee: FeeBreakdown;
  engagementReference: string;
};

const PartyCard = ({
  role,
  name,
  tag,
  accent,
}: {
  role: string;
  name: string;
  tag: string;
  accent: "payer" | "payee";
}) => {
  return (
    <div className="flex-1 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
        {role}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-neutral-950 dark:text-neutral-50">
        {name}
      </p>
      <span
        className={
          accent === "payee"
            ? "mt-2 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
            : "mt-2 inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
        }
      >
        {tag}
      </span>
    </div>
  );
};

const Row = ({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <span
        className={
          strong
            ? "text-sm font-semibold text-neutral-950 dark:text-neutral-50"
            : "text-sm text-neutral-800 dark:text-neutral-200"
        }
      >
        {value}
      </span>
    </div>
  );
};

export const EscrowPreview = ({ data }: { data: EscrowPreviewData }) => {
  const copy = getDirectionCopy(data.direction);
  const amountLabel = formatAsset(data.amount, data.asset);

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">
          Preview
        </h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white dark:bg-neutral-100 dark:text-neutral-900">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Single-release escrow
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        {copy.summary({
          payer: data.payerName || "The payer",
          payee: data.payeeName || "the payee",
          amount: amountLabel,
        })}
      </p>

      <div className="mt-4 flex items-stretch gap-2">
        <PartyCard
          role="Payer"
          name={data.payerName || "—"}
          tag={copy.payerRoleTag}
          accent="payer"
        />
        <div className="flex items-center text-neutral-400">
          <ArrowRight className="h-4 w-4" aria-hidden />
        </div>
        <PartyCard
          role="Payee"
          name={data.payeeName || "—"}
          tag={copy.payeeRoleTag}
          accent="payee"
        />
      </div>

      <div className="mt-5 space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            <Target className="h-3.5 w-3.5" aria-hidden />
            Deliverable
          </div>
          <p className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">
            {data.deliverableTitle || "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            Acceptance criteria
          </p>
          <p className="mt-1 text-sm leading-6 text-neutral-800 dark:text-neutral-200">
            {data.acceptanceCriteria || "—"}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <Row label="Amount" value={amountLabel} strong />
        <Row
          label={`Platform fee (${formatFeePercent(data.fee.platformFeeBps)})`}
          value={formatAsset(data.fee.platformFeeAmount, data.asset)}
        />
        <Row
          label={`${data.payeeName || "Payee"} receives`}
          value={formatAsset(data.fee.netAmount, data.asset)}
          strong
        />
        {data.dueDate && <Row label="Due date" value={data.dueDate} />}
        <Row label="Reference" value={data.engagementReference || "—"} />
      </div>
    </div>
  );
};
