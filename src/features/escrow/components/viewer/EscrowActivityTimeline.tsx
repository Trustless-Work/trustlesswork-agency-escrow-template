import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AgencyEscrow, AgencyEscrowEvent } from "@/types/agency-escrow";
import {
  formatEventType,
  formatTimestamp,
  formatWalletAddress,
  resolvePartyName,
} from "./format";
import { WalletAddress } from "./WalletAddress";
import {
  viewerCardClass,
  viewerMutedClass,
  viewerTitleClass,
} from "./viewer-styles";

type EscrowActivityTimelineProps = {
  escrow: AgencyEscrow;
  events: AgencyEscrowEvent[] | undefined;
  isLoading: boolean;
  isError: boolean;
};

export const EscrowActivityTimeline = ({
  escrow,
  events,
  isLoading,
  isError,
}: EscrowActivityTimelineProps) => {
  const parties = [escrow.workspace, escrow.counterparty];
  const timeline = [...(events ?? [])].sort(
    (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp),
  );

  return (
    <Card className={viewerCardClass}>
      <CardHeader>
        <CardTitle className={viewerTitleClass}>Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-12 w-full bg-white/10" />
            <Skeleton className="h-12 w-5/6 bg-white/10" />
            <Skeleton className="h-12 w-4/6 bg-white/10" />
          </div>
        ) : isError ? (
          <p className={viewerMutedClass}>
            Could not load activity for this escrow.
          </p>
        ) : timeline.length === 0 ? (
          <p className={viewerMutedClass}>No activity recorded yet.</p>
        ) : (
          <ol className="flex flex-col gap-6 border-l border-white/10 pl-6">
            {timeline.map((event) => {
              const actorName = resolvePartyName(event.actor, parties);

              return (
                <li key={event.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 -left-[1.625rem] size-2.5 rounded-full bg-[#2f7bff]"
                  />
                  <p className="font-medium text-white">
                    {formatEventType(event.type)}
                  </p>
                  <p className={`mt-1 ${viewerMutedClass}`}>
                    {formatTimestamp(event.timestamp)}
                    {actorName ? ` · ${actorName}` : null}
                  </p>
                  {event.actor && !actorName ? (
                    <p className="mt-1">
                      <WalletAddress address={event.actor} />
                    </p>
                  ) : null}
                  {event.note ? (
                    <p className={`mt-2 ${viewerMutedClass}`}>{event.note}</p>
                  ) : null}
                  {event.transactionHash ? (
                    <p
                      className="mt-1 font-mono text-xs text-slate-500"
                      title={event.transactionHash}
                    >
                      {formatWalletAddress(event.transactionHash)}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};
