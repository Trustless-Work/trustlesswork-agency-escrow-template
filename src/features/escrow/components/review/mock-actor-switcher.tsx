import { RotateCcw, UserRound } from "lucide-react";
import type { AgencyEscrow } from "@/types/agency-escrow";
import { useWallet } from "@/lib/wallet-provider";
import { cn } from "@/lib/utils";
import { MutedText } from "./typography";

type MockActorSwitcherProps = {
  escrow: AgencyEscrow;
};

export function MockActorSwitcher({ escrow }: MockActorSwitcherProps) {
  const { address, setMockAddress } = useWallet();

  const parties = [
    {
      label: escrow.workspace.name,
      walletAddress: escrow.workspace.walletAddress,
    },
    {
      label: escrow.counterparty.name,
      walletAddress: escrow.counterparty.walletAddress,
    },
  ];
  const uniqueParties = parties.filter(
    (party, index) =>
      parties.findIndex(
        (candidate) => candidate.walletAddress === party.walletAddress,
      ) === index,
  );

  return (
    <div data-dev="mock-actor-switcher" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
      <MutedText>Acting as</MutedText>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {uniqueParties.map((party) => {
          const active = address === party.walletAddress;
          const isMaria = party.label === "Maria";
          return (
            <button
              key={party.walletAddress}
              type="button"
              onClick={() => setMockAddress(party.walletAddress)}
              aria-pressed={active}
              className={cn(
                "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                isMaria
                  ? active
                    ? "border-amber-500/30 bg-amber-500/15 text-amber-300 shadow-sm"
                    : "border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/15"
                  : active
                    ? "border-[#2f7bff]/40 bg-[#2f7bff]/15 text-[#9cc8ff] shadow-sm"
                    : "border-border bg-card text-foreground hover:-translate-y-px hover:bg-muted hover:shadow-sm",
              )}
            >
              <UserRound aria-hidden className="h-3.5 w-3.5" />
              {party.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        data-dev="reset-demo-data"
        title="Reset mock seed data"
        onClick={() => {
          try {
            window.localStorage.removeItem("trustless-work-agency:escrows:v1");
            window.localStorage.removeItem("trustless-work-agency:events:v1");
          } finally {
            window.location.reload();
          }
        }}
        className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition-all hover:-translate-y-px hover:border-red-400/50 hover:text-red-400"
      >
        <RotateCcw aria-hidden className="h-3 w-3" />
        Reset demo
      </button>
    </div>
  );
}
