import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatAmount, formatFeeRate } from "./format";
import type { FeeBreakdown } from "@/features/escrow/utils/fees";

type ReleaseFeeBreakdownProps = {
  breakdown: FeeBreakdown;
  asset: string;
};

export const ReleaseFeeBreakdown = ({
  breakdown,
  asset,
}: ReleaseFeeBreakdownProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Payment breakdown</CardTitle>
        <CardDescription>
          How the released amount is distributed before confirmation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Gross amount</span>
          <span className="font-medium">
            {formatAmount(breakdown.grossAmount)} {asset}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">
            Platform fee ({formatFeeRate(breakdown.platformFeeBps)})
          </span>
          <span className="font-medium">
            −{formatAmount(breakdown.platformFeeAmount)} {asset}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t pt-3">
          <span className="font-semibold">Net to payee</span>
          <span className="text-lg font-semibold">
            {formatAmount(breakdown.netAmount)} {asset}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
