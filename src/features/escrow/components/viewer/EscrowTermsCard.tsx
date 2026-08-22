import { ExternalLinkIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AgencyEscrow } from "@/types/agency-escrow";
import { formatDueDate } from "./format";
import {
  viewerCardClass,
  viewerLabelClass,
  viewerLinkClass,
  viewerMutedClass,
} from "./viewer-styles";

type EscrowTermsCardProps = {
  escrow: AgencyEscrow;
};

export const EscrowTermsCard = ({ escrow }: EscrowTermsCardProps) => {
  const { agreement, milestone } = escrow;

  return (
    <Card className={viewerCardClass}>
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          Agreement and deliverable
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 text-sm leading-6">
        <section>
          <h3 className={viewerLabelClass}>Description</h3>
          <p className={cn("mt-1", viewerMutedClass)}>{agreement.description}</p>
        </section>

        <section>
          <h3 className={viewerLabelClass}>Deliverable</h3>
          <p className="mt-1 font-semibold">
            {milestone.title}
          </p>
          <p className={cn("mt-1", viewerMutedClass)}>{milestone.description}</p>
        </section>

        <section>
          <h3 className={viewerLabelClass}>Acceptance criteria</h3>
          <p className={cn("mt-1", viewerMutedClass)}>
            {milestone.acceptanceCriteria}
          </p>
        </section>

        {agreement.dueDate ? (
          <section>
            <h3 className={viewerLabelClass}>Due date</h3>
            <p className={cn("mt-1", viewerMutedClass)}>
              {formatDueDate(agreement.dueDate)}
            </p>
          </section>
        ) : null}

        {agreement.agreementUrl ? (
          <section>
            <h3 className={viewerLabelClass}>Agreement</h3>
            <a
              href={agreement.agreementUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(viewerLinkClass, "mt-1")}
            >
              View proposal
              <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </a>
          </section>
        ) : null}

        {milestone.deliverySummary ? (
          <section>
            <h3 className={viewerLabelClass}>Latest delivery</h3>
            <p className={cn("mt-1", viewerMutedClass)}>
              {milestone.deliverySummary}
            </p>
          </section>
        ) : null}

        {milestone.revisionNotes ? (
          <section>
            <h3 className={viewerLabelClass}>Requested changes</h3>
            <p className={cn("mt-1", viewerMutedClass)}>
              {milestone.revisionNotes}
            </p>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
};
