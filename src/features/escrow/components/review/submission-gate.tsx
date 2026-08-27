import { Inbox } from "lucide-react";
import { ReviewCard } from "./review-card";
import { BodyText, SectionHeading } from "./typography";

type ApproverEmptySubmissionsProps = {
  providerName: string;
};

export function ApproverEmptySubmissions({
  providerName,
}: ApproverEmptySubmissionsProps) {
  return (
    <ReviewCard bodyClassName="flex h-[370px] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-950/[0.04]">
          <Inbox aria-hidden className="h-6 w-6 text-neutral-700" />
        </span>
        <SectionHeading>No submissions yet</SectionHeading>
        <BodyText className="max-w-md">
          {providerName} has not submitted the deliverable yet. You will be able
          to review and decide as soon as a submission lands.
        </BodyText>
      </div>
    </ReviewCard>
  );
}
