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
  viewerCardClass,
  viewerMutedClass,
  viewerOutlineButtonClass,
  viewerPrimaryButtonClass,
  viewerTitleClass,
} from "./viewer-styles";

type EscrowNextActionsProps = {
  action: ViewerNextAction | null;
};

export const EscrowNextActions = ({ action }: EscrowNextActionsProps) => {
  if (!action) {
    return (
      <Card className={viewerCardClass}>
        <CardHeader>
          <CardTitle className={viewerTitleClass}>Next step</CardTitle>
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
        <CardTitle className={viewerTitleClass}>Next step</CardTitle>
        <CardDescription className={viewerMutedClass}>
          {action.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={action.href}
          className={cn(
            action.availableToViewer
              ? viewerPrimaryButtonClass
              : viewerOutlineButtonClass,
          )}
        >
          {action.label}
        </Link>
      </CardContent>
    </Card>
  );
};
