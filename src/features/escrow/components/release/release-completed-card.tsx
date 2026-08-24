import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatAmount } from "./format";

type ReleaseCompletedCardProps = {
  escrowId: string;
  payeeName: string;
  netAmount: number;
  asset: string;
  alreadyReleased: boolean;
};

export const ReleaseCompletedCard = ({
  escrowId,
  payeeName,
  netAmount,
  asset,
  alreadyReleased,
}: ReleaseCompletedCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <CardTitle>
              {alreadyReleased ? "Payment already released" : "Payment released"}
            </CardTitle>
            <CardDescription className="mt-1.5">
              {alreadyReleased ? (
                <>This protected payment has been completed.</>
              ) : (
                <>
                  {formatAmount(netAmount)} {asset} has been released to{" "}
                  {payeeName}. The protected payment is complete.
                </>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Link
          href={`/escrow/${escrowId}`}
          className={buttonVariants({ variant: "default" })}
        >
          Back to escrow detail
        </Link>
      </CardContent>
    </Card>
  );
};
