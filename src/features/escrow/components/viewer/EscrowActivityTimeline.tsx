import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AgencyEscrow, AgencyEscrowEvent } from "@/types/agency-escrow";
import { formatEventType, formatTimestamp, resolvePartyName } from "./format";
import { WalletAddress } from "./WalletAddress";
import { viewerCardClass, viewerMutedClass } from "./viewer-styles";

type EscrowActivityTimelineProps = {
  escrow: AgencyEscrow;
  events: AgencyEscrowEvent[] | undefined;
  isLoading: boolean;
};

export const EscrowActivityTimeline = ({
  escrow,
  events,
  isLoading,
}: EscrowActivityTimelineProps) => {
  const parties = [escrow.workspace, escrow.counterparty];
  const timeline = [...(events ?? [])].sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp),
  );

  return (
    <Card className={viewerCardClass}>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-5/6" />
            <Skeleton className="h-12 w-4/6" />
          </div>
        ) : timeline.length === 0 ? (
          <p className={viewerMutedClass}>No activity recorded yet.</p>
        ) : (
          <ol className="flex flex-col gap-6 border-l border-slate-200 pl-6">
            {timeline.map((event) => {
              const actorName = resolvePartyName(event.actor, parties);

              return (
                <li key={event.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 -left-[1.625rem] size-2.5 rounded-full bg-[#006ee6]"
                  />
                  <p className="font-semibold">
                    {formatEventType(event.type)}
                  </p>
                  <p className={cn("mt-1", viewerMutedClass)}>
                    {formatTimestamp(event.timestamp)}
                    {actorName ? ` · ${actorName}` : null}
                  </p>
                  {event.actor && !actorName ? (
                    <p className="mt-1">
                      <WalletAddress address={event.actor} />
                    </p>
                  ) : null}
                  {event.note ? (
                    <p className={cn("mt-2", viewerMutedClass)}>{event.note}</p>
                  ) : null}
                  {event.transactionHash ? (
                    <p className="mt-1">
                      <WalletAddress address={event.transactionHash} />
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
