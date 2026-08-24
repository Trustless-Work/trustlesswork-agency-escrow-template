import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ReleaseBlockedReason = "not-approved" | "not-authorized" | "not-found";

type ReleaseBlockedCardProps = {
  escrowId?: string;
  reason: ReleaseBlockedReason;
  signerName?: string;
};

const MESSAGES: Record<
  ReleaseBlockedReason,
  { title: string; description: string }
> = {
  "not-approved": {
    title: "Release is not available yet",
    description:
      "This escrow must be approved before funds can be released. Release becomes available once the approver confirms the delivered work.",
  },
  "not-authorized": {
    title: "You are not authorized to release",
    description:
      "Only the release signer can release this payment. Switch to the wallet holding the release signer role to continue.",
  },
  "not-found": {
    title: "Escrow not found",
    description:
      "We could not find an escrow with this id. It may have been removed or the link may be incorrect.",
  },
};

export const ReleaseBlockedCard = ({
  escrowId,
  reason,
  signerName,
}: ReleaseBlockedCardProps) => {
  const message = MESSAGES[reason];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-1 h-6 w-6 shrink-0 text-destructive" />
          <div>
            <CardTitle>{message.title}</CardTitle>
            <CardDescription className="mt-1.5">
              {message.description}
              {reason === "not-authorized" && signerName
                ? ` The release signer for this escrow is ${signerName}.`
                : ""}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      {escrowId ? (
        <CardContent>
          <Link
            href={`/escrow/${escrowId}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Back to escrow detail
          </Link>
        </CardContent>
      ) : null}
    </Card>
  );
};
