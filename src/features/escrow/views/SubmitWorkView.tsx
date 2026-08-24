'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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

type SubmitWorkViewProps = {
  escrowId: string
}

const PageShell = ({
  escrowId,
  children,
}: {
  escrowId: string
  children: React.ReactNode
}) => {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href={`/escrow/${escrowId}`}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Back to escrow
        </Link>
        <div className="mt-6 border-b border-border pb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Work submission
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Submit deliverable
          </h1>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  )
}

const LoadingState = () => {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export const SubmitWorkView = ({ escrowId }: SubmitWorkViewProps) => {
  const { address, isMock } = useWallet()
  const escrowQuery = useAgencyEscrow(escrowId)
  const submitMutation = useSubmitDeliverable(escrowId)
  const [submittedMode, setSubmittedMode] = useState<SubmissionMode | null>(null)

  if (escrowQuery.isPending) {
    return (
      <PageShell escrowId={escrowId}>
        <LoadingState />
      </PageShell>
    )
  }

  if (escrowQuery.isError) {
    return (
      <PageShell escrowId={escrowId}>
        <SubmissionBlockedNotice
          escrowId={escrowId}
          title="We could not load this engagement"
          description={
            escrowQuery.error instanceof Error
              ? escrowQuery.error.message
              : 'Something went wrong while loading the escrow. Try again in a moment.'
          }
        />
      </PageShell>
    )
  }

  const escrow = escrowQuery.data

  if (!escrow) {
    return (
      <PageShell escrowId={escrowId}>
        <SubmissionBlockedNotice
          escrowId={escrowId}
          title="Engagement not found"
          description={`No escrow matches the id ${escrowId}. Check the link or pick an engagement from your dashboard.`}
        />
      </PageShell>
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
    <PageShell escrowId={escrowId}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
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
    </PageShell>
  )
}
