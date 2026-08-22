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
import { viewerLinkClass } from "@/features/escrow/components/viewer/viewer-styles";
import { useAgencyEscrow, useEscrowActivity } from "@/features/escrow/hooks";
import { useWallet } from "@/lib/wallet-provider";

type EscrowDetailViewProps = {
  escrowId: string;
};

export const EscrowDetailView = ({ escrowId }: EscrowDetailViewProps) => {
  const { address } = useWallet();
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

  const nextAction = getViewerNextAction(escrow, address);

  return (
    <ViewerShell>
      <div className="flex flex-col gap-8">
        <Link href="/agency" className={viewerLinkClass}>
          ← Back to dashboard
        </Link>

        <EscrowDetailHeader escrow={escrow} />
        <EscrowNextActions action={nextAction} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
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
        />
      </div>
    </ViewerShell>
  );
};
