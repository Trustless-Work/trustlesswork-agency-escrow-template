import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { AgencyEscrowMilestone } from '@/types/agency-escrow'

type AcceptanceCriteriaCardProps = {
  milestone: AgencyEscrowMilestone
}

export function AcceptanceCriteriaCard({
  milestone,
}: AcceptanceCriteriaCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acceptance criteria</CardTitle>
        <CardDescription>
          Your delivery is reviewed against these terms. Keep them in view while
          you prepare your evidence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">{milestone.title}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {milestone.description}
          </p>
        </div>
        <div className="rounded-md border border-border bg-muted/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Definition of done
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6">
            {milestone.acceptanceCriteria}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
