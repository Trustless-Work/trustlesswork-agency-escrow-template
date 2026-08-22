import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ViewerNextAction } from "./next-actions";
import {
  viewerButtonClass,
  viewerCardClass,
  viewerMutedClass,
  viewerOutlineButtonClass,
} from "./viewer-styles";

type EscrowNextActionsProps = {
  action: ViewerNextAction | null;
};

export const EscrowNextActions = ({ action }: EscrowNextActionsProps) => {
  if (!action) {
    return (
      <Card className={viewerCardClass}>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Next step</CardTitle>
          <CardDescription className={viewerMutedClass}>
            This payment is complete. No further action is required.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={viewerCardClass}>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Next step</CardTitle>
        <CardDescription className={viewerMutedClass}>
          {action.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={action.href}
          className={cn(
            action.availableToViewer
              ? viewerButtonClass
              : viewerOutlineButtonClass,
          )}
        >
          {action.label}
          <span aria-hidden="true">→</span>
        </Link>
      </CardContent>
    </Card>
  );
};
