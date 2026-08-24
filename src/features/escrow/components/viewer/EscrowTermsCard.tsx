import { ExternalLinkIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AgencyEscrow } from "@/types/agency-escrow";
import { formatDueDate } from "./format";
import {
  viewerCardClass,
  viewerLabelClass,
  viewerLinkClass,
  viewerMutedClass,
  viewerTitleClass,
} from "./viewer-styles";

type EscrowTermsCardProps = {
  escrow: AgencyEscrow;
};

export const EscrowTermsCard = ({ escrow }: EscrowTermsCardProps) => {
  const { agreement, milestone } = escrow;

  return (
    <Card className={viewerCardClass}>
      <CardHeader>
        <CardTitle className={viewerTitleClass}>
          Agreement and deliverable
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 text-sm leading-6">
        <section>
          <p className={viewerLabelClass}>Description</p>
          <p className={`mt-1 ${viewerMutedClass}`}>{agreement.description}</p>
        </section>

        <section>
          <p className={viewerLabelClass}>Deliverable</p>
          <p className="mt-1 font-medium text-white">{milestone.title}</p>
          <p className={`mt-1 ${viewerMutedClass}`}>{milestone.description}</p>
        </section>

        <section>
          <p className={viewerLabelClass}>Acceptance criteria</p>
          <p className={`mt-1 ${viewerMutedClass}`}>
            {milestone.acceptanceCriteria}
          </p>
        </section>

        {agreement.dueDate ? (
          <section>
            <p className={viewerLabelClass}>Due date</p>
            <p className={`mt-1 ${viewerMutedClass}`}>
              {formatDueDate(agreement.dueDate)}
            </p>
          </section>
        ) : null}

        {agreement.agreementUrl ? (
          <section>
            <p className={viewerLabelClass}>Agreement</p>
            <a
              href={agreement.agreementUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-1 ${viewerLinkClass}`}
            >
              View proposal
              <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </a>
          </section>
        ) : null}

        {milestone.deliverySummary || milestone.deliverableLinks?.length ? (
          <section>
            <p className={viewerLabelClass}>Latest delivery</p>
            {milestone.deliverySummary ? (
              <p className={`mt-1 ${viewerMutedClass}`}>
                {milestone.deliverySummary}
              </p>
            ) : null}
            {milestone.deliverableLinks?.map((href) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-1 ${viewerLinkClass}`}
              >
                View deliverable
                <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
              </a>
            ))}
          </section>
        ) : null}

        {milestone.revisionNotes ? (
          <section>
            <p className={viewerLabelClass}>Requested changes</p>
            <p className={`mt-1 ${viewerMutedClass}`}>
              {milestone.revisionNotes}
            </p>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
};
