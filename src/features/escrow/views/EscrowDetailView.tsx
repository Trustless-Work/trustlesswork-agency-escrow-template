"use client";

import Link from "next/link";
import { EscrowActivityTimeline } from "@/features/escrow/components/viewer/EscrowActivityTimeline";
import { EscrowDetailHeader } from "@/features/escrow/components/viewer/EscrowDetailHeader";
import {
  EscrowDetailSkeleton,
  EscrowLoadError,
  EscrowNotFound,
} from "@/features/escrow/components/viewer/EscrowDetailStates";
import { EscrowNextActions } from "@/features/escrow/components/viewer/EscrowNextActions";
import { getViewerNextAction } from "@/features/escrow/components/viewer/next-actions";
import { EscrowPartiesCard } from "@/features/escrow/components/viewer/EscrowPartiesCard";
import { EscrowPaymentCard } from "@/features/escrow/components/viewer/EscrowPaymentCard";
import { EscrowTermsCard } from "@/features/escrow/components/viewer/EscrowTermsCard";
import { ViewerShell } from "@/features/escrow/components/viewer/ViewerShell";
import { viewerBackLinkClass } from "@/features/escrow/components/viewer/viewer-styles";
import { useAgencyEscrow, useEscrowActivity } from "@/features/escrow/hooks";

type EscrowDetailViewProps = {
  escrowId: string;
};

export const EscrowDetailView = ({ escrowId }: EscrowDetailViewProps) => {
  const escrowQuery = useAgencyEscrow(escrowId);
  const activityQuery = useEscrowActivity(escrowId);

  if (escrowQuery.isPending) {
    return <EscrowDetailSkeleton />;
  }

  if (escrowQuery.isError) {
    return <EscrowLoadError />;
  }

  const escrow = escrowQuery.data;
  if (!escrow) {
    return <EscrowNotFound escrowId={escrowId} />;
  }

  const nextAction = getViewerNextAction(escrow);

  return (
    <ViewerShell>
      <Link href="/agency" className={viewerBackLinkClass}>
        ← Back to dashboard
      </Link>

      <EscrowDetailHeader escrow={escrow} />
      <EscrowNextActions action={nextAction} />

      <div className="grid gap-6 lg:grid-cols-2">
        <EscrowTermsCard escrow={escrow} />
        <div className="flex flex-col gap-6">
          <EscrowPaymentCard escrow={escrow} />
          <EscrowPartiesCard escrow={escrow} />
        </div>
      </div>

      <EscrowActivityTimeline
        escrow={escrow}
        events={activityQuery.data}
        isLoading={activityQuery.isPending}
        isError={activityQuery.isError}
      />
    </ViewerShell>
  );
};
