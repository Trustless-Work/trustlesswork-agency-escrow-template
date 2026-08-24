import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { SubmissionMode } from './submission-access'

type SubmissionSuccessCardProps = {
  escrowId: string
  mode: SubmissionMode
  approverName: string
}

export const SubmissionSuccessCard = ({
  escrowId,
  mode,
  approverName,
}: SubmissionSuccessCardProps) => {
  return (
    <Card role="status">
      <CardHeader>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <CardTitle>
              {mode === 'resubmit' ? 'Delivery resubmitted' : 'Delivery submitted'}
            </CardTitle>
            <CardDescription className="mt-1">
              This engagement is now in review. {approverName} will approve the
              delivery or request further changes.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Link
          href={`/escrow/${escrowId}`}
          className={buttonVariants({ variant: 'default' })}
        >
          Back to escrow
        </Link>
      </CardContent>
    </Card>
  )
}
