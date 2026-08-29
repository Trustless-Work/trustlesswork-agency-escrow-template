import type { AgencyEscrowStatus } from "@/types/agency-escrow";
import { StatusChip } from "./StatusChip";
import { labelClass, pageTitleClass } from "./design-tokens";

export function LifecyclePageHeader({ context, title, status }: { context: string; title: string; status?: AgencyEscrowStatus }) {
  return (
    <header className="border-b border-white/10 pb-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className={labelClass}>{context}</p>
        {status ? <StatusChip status={status} /> : null}
      </div>
      <h1 className={`mt-3 ${pageTitleClass}`}>{title}</h1>
    </header>
  );
}