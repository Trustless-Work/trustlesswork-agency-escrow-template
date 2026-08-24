import Link from "next/link";
import { RotateCcw } from "lucide-react";
import type { AgencyEscrowStatus } from "@/types/agency-escrow";
import { BodyText, MutedText, SectionHeading } from "./typography";
import { ReviewCard } from "./review-card";

function CongratulationConfetti() {
  const pieces = Array.from({ length: 28 });
  return (
    <div aria-hidden className="cf-layer pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <style>{`
        .cf-layer { animation: cf-fade 0.4s ease-in 2.7s forwards; }
        @keyframes cf-fade { to { opacity: 0; pointer-events: none; } }
        .confetti-piece {
          position: absolute;
          top: -20px;
          width: 10px;
          height: 16px;
          border-radius: 2px;
          background: #e62f2f;
          animation: confetti-fall 2.4s cubic-bezier(.22,.61,.36,1) forwards;
        }
        .confetti-piece--white { background: #c4c1c1; }
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((_, i) => {
        const onLeft = i % 2 === 0;
        const edgePos = `${5 + (i % 14) * 5}%`;
        return (
          <span
            key={i}
            className={`confetti-piece${i % 3 === 0 ? " confetti-piece--white" : ""}`}
            style={{
              left: onLeft ? edgePos : undefined,
              right: onLeft ? undefined : edgePos,
              animationDelay: `${(i % 12) * 0.14}s`,
              animationDuration: `3.4s`,
            }}
          />
        );
      })}
    </div>
  );
}

type ResultBannerProps = {
  status: Extract<AgencyEscrowStatus, "approved" | "revision_requested">;
  escrowId: string;
  revisionNotes?: string;
  viewerRole: "approver" | "provider" | "other";
};

export function ResultBanner({
  status,
  escrowId,
  revisionNotes,
  viewerRole,
}: ResultBannerProps) {
  if (status === "approved") {
    if (viewerRole === "provider") {
      return (
        <ReviewCard bodyClassName="p-4">
          <CongratulationConfetti />
          <div className="flex flex-wrap items-center gap-3">
            <SectionHeading>Congratulations!</SectionHeading>
          </div>
          <BodyText className="pt-1 leading-7">
            Your submission is approved. The payer can now release the funds,
            nothing more is required from you.
          </BodyText>
        </ReviewCard>
      );
    }

    return (
      <ReviewCard bodyClassName="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SectionHeading>Deliverable approved</SectionHeading>
        </div>
        <BodyText className="pt-1 leading-7">
          Approval cannot be undone. The funds are ready to be
          {" "}
          <Link
            href={`/escrow/${escrowId}/release`}
            className="font-semibold text-blue-600 underline underline-offset-2 transition-colors hover:text-blue-700"
          >
            released
          </Link>
          .
        </BodyText>
      </ReviewCard>
    );
  }

  const isProvider = viewerRole === "provider";

  return (
    <div role="status" className="space-y-3">
      <div className="flex items-start gap-3">
        <RotateCcw
          aria-hidden
          className={`mt-1 h-5 w-5 shrink-0 ${isProvider ? "text-orange-600" : "text-orange-500"}`}
        />
        <div className="space-y-1">
          <p className="text-[15px] font-semibold tracking-[-0.01em] text-neutral-900">
            {isProvider
              ? "Changes requested on your submission."
              : "Changes requested — waiting for resubmission."}
          </p>
          {isProvider && (
            <MutedText>Review the notes below and resubmit when ready.</MutedText>
          )}
        </div>
      </div>
      {revisionNotes && (
        <blockquote className="ml-8 whitespace-pre-line rounded-lg border-l-4 border-orange-300 bg-orange-50/60 px-4 py-3">
          <p className="text-xs font-semibold text-orange-600">
            Revision notes
          </p>
          <BodyText className="mt-1">{revisionNotes}</BodyText>
        </blockquote>
      )}
    </div>
  );
}
