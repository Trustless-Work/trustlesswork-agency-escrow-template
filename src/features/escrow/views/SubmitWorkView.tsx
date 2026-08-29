'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  AcceptanceCriteriaCard,
  RevisionRequestNotice,
  SubmissionBlockedNotice,
  SubmissionSuccessCard,
  SubmissionSummaryCard,
  SubmitWorkForm,
  resolveSubmissionAccess,
  type SubmissionMode,
} from '@/features/escrow/components/submission'
import { useAgencyEscrow, useSubmitDeliverable } from '@/features/escrow/hooks'
import { getPaymentParties } from '@/features/escrow/utils/roles'
import { useWallet } from '@/lib/wallet-provider'
import type { SubmitDeliverableInput } from '@/types/agency-escrow'
import { LifecycleShell, LifecyclePageHeader, LifecycleSkeleton } from '@/features/escrow/components/shared'

type SubmitWorkViewProps = {
  escrowId: string
}

export const SubmitWorkView = ({ escrowId }: SubmitWorkViewProps) => {
  const { address, isMock } = useWallet()
  const escrowQuery = useAgencyEscrow(escrowId)
  const submitMutation = useSubmitDeliverable(escrowId)
  const [submittedMode, setSubmittedMode] = useState<SubmissionMode | null>(null)

  if (escrowQuery.isPending) {
    return (
      <LifecycleShell backHref={`/escrow/${escrowId}`} backLabel="Back to escrow">
        <LifecyclePageHeader
          context="Work submission"
          title="Submit deliverable"
        />
        <LifecycleSkeleton />
      </LifecycleShell>
    )
  }

  if (escrowQuery.isError) {
    return (
      <LifecycleShell backHref={`/escrow/${escrowId}`} backLabel="Back to escrow">
        <LifecyclePageHeader
          context="Work submission"
          title="Submit deliverable"
        />
        <SubmissionBlockedNotice
          escrowId={escrowId}
          title="We could not load this engagement"
          description={
            escrowQuery.error instanceof Error
              ? escrowQuery.error.message
              : 'Something went wrong while loading the escrow. Try again in a moment.'
          }
        />
      </LifecycleShell>
    )
  }

  const escrow = escrowQuery.data

  if (!escrow) {
    return (
      <LifecycleShell backHref={`/escrow/${escrowId}`} backLabel="Back to escrow">
        <LifecyclePageHeader
          context="Work submission"
          title="Submit deliverable"
        />
        <SubmissionBlockedNotice
          escrowId={escrowId}
          title="Engagement not found"
          description={`No escrow matches the id ${escrowId}. Check the link or pick an engagement from your dashboard.`}
        />
      </LifecycleShell>
    )
  }

  const { payer } = getPaymentParties(
    escrow.paymentDirection,
    escrow.workspace,
    escrow.counterparty,
  )
  const access = resolveSubmissionAccess({ escrow, walletAddress: address, isMock })

  const handleSubmit = (input: SubmitDeliverableInput) => {
    if (access.state !== 'allowed') return
    const mode = access.mode

    submitMutation.mutate(input, {
      onSuccess: () => {
        setSubmittedMode(mode)
        toast.success(
          mode === 'resubmit' ? 'Delivery resubmitted' : 'Delivery submitted',
          { description: 'The engagement is now in review.' },
        )
      },
    })
  }

  return (
    <LifecycleShell backHref={`/escrow/${escrowId}`} backLabel="Back to escrow">
      <LifecyclePageHeader
        context="Work submission"
        title="Submit deliverable"
        status={escrow.status}
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-2 space-y-6 lg:order-1">
          {submittedMode ? (
            <SubmissionSuccessCard
              escrowId={escrowId}
              mode={submittedMode}
              approverName={payer.name}
            />
          ) : access.state === 'blocked' ? (
            <SubmissionBlockedNotice
              escrowId={escrowId}
              title={access.title}
              description={access.description}
            />
          ) : (
            <>
              {escrow.status === 'revision_requested' &&
              escrow.milestone.revisionNotes ? (
                <RevisionRequestNotice
                  revisionNotes={escrow.milestone.revisionNotes}
                  requestedAt={escrow.timestamps.revisionRequestedAt}
                />
              ) : null}
              <SubmitWorkForm
                mode={access.mode}
                isPending={submitMutation.isPending}
                errorMessage={
                  submitMutation.error instanceof Error
                    ? submitMutation.error.message
                    : null
                }
                onSubmit={handleSubmit}
              />
            </>
          )}
        </div>

        <aside className="order-1 space-y-6 lg:order-2">
          <SubmissionSummaryCard escrow={escrow} />
          <AcceptanceCriteriaCard milestone={escrow.milestone} />
        </aside>
      </div>
    </LifecycleShell>
  )
}
