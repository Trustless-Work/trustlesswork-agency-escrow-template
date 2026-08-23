import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from './format'

type RevisionRequestNoticeProps = {
  revisionNotes: string
  requestedAt?: string
}

export function RevisionRequestNotice({
  revisionNotes,
  requestedAt,
}: RevisionRequestNoticeProps) {
  const requestedOn = formatDate(requestedAt)

  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-base">Changes requested</CardTitle>
        {requestedOn ? (
          <p className="text-sm text-muted-foreground">
            The approver returned this delivery on {requestedOn}. Address the
            notes below before resubmitting.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            The approver returned this delivery. Address the notes below before
            resubmitting.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line text-sm leading-6">{revisionNotes}</p>
      </CardContent>
    </Card>
  )
}
