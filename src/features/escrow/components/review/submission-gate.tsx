"use client";

import { useState } from "react";
import { FileUp, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "./review-card";
import { SubmissionModal } from "./submission-modal";
import { BodyText, SectionHeading } from "./typography";

type ProviderSubmissionGateProps = {
  onSubmit: (values: {
    deliverySummary: string;
    deliverableLinks: string[];
  }) => Promise<boolean>;
};

export function ProviderSubmissionGate({
  onSubmit,
}: ProviderSubmissionGateProps) {
  const [open, setOpen] = useState(false);

  return (
    <ReviewCard bodyClassName="flex h-[370px] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-950/[0.04]">
          <FileUp aria-hidden className="h-6 w-6 text-neutral-700" />
        </span>
        <SectionHeading>Your deliverable is ready to submit</SectionHeading>
        <BodyText className="max-w-md">
          Work is done? Add your delivery summary and evidence links. The
          approver reviews everything right here.
        </BodyText>
        <Button
          onClick={() => setOpen(true)}
          className="mt-2 h-11 cursor-pointer rounded-full bg-neutral-950 px-8 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:bg-neutral-800 hover:shadow-md"
        >
          Add Submission
        </Button>
      </div>
      <SubmissionModal open={open} onOpenChange={setOpen} onSubmit={onSubmit} />
    </ReviewCard>
  );
}

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
