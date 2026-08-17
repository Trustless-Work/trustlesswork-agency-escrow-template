"use client";

import type { AgencyEscrow } from "@/types/agency-escrow";
import { EscrowCard } from "./EscrowCard";

type EscrowListProps = {
  escrows: AgencyEscrow[];
};

export function EscrowList({ escrows }: EscrowListProps) {
  if (!escrows.length) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {escrows.map((escrow) => (
        <EscrowCard key={escrow.escrowId} escrow={escrow} />
      ))}
    </div>
  );
}
