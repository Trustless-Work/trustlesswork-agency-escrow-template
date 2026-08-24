import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatAmount } from "./format";

type ReleaseConfirmPanelProps = {
  payeeName: string;
  netAmount: number;
  asset: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ReleaseConfirmPanel = ({
  payeeName,
  netAmount,
  asset,
  isPending,
  onConfirm,
  onCancel,
}: ReleaseConfirmPanelProps) => {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="space-y-2">
          <p className="text-sm font-semibold">
            Confirm release of {formatAmount(netAmount)} {asset} to {payeeName}?
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Releasing completes the protected payment. The net amount is sent to
            the payee and the platform fee is routed automatically. This action
            is final and cannot be undone.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Releasing…" : "Confirm release"}
        </Button>
      </div>
    </div>
  );
};
