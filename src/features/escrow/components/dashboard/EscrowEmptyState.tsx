import Link from "next/link";
import { Card } from "@/components/ui/card";
import { primaryButtonClass } from "@/features/escrow/components/shared";

export const EscrowEmptyState = () => {
  return (
    <Card className="border-border bg-card p-6 text-card-foreground">
      <p className="text-sm font-medium text-card-foreground">
        No escrows yet
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Create your first escrow to start tracking milestone-based payments.
      </p>
      <Link
        href="/agency/create"
        className={`mt-4 ${primaryButtonClass}`}
      >
        Create Escrow
      </Link>
    </Card>
  );
};
