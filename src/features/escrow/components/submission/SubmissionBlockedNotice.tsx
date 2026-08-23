import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type SubmissionBlockedNoticeProps = {
  escrowId: string
  title: string
  description: string
}

export const SubmissionBlockedNotice = ({
  escrowId,
  title,
  description,
}: SubmissionBlockedNoticeProps) => {
  return (
    <Card role="alert">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={`/escrow/${escrowId}`}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Back to escrow
        </Link>
      </CardContent>
    </Card>
  )
}
