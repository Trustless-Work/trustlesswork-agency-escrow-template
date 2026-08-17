import Link from "next/link";
import { Card } from "@/components/ui/card";

export function EscrowEmptyState() {
  return (
    <Card className="p-6">
      <p className="text-sm font-medium text-neutral-950">
        No escrows yet
      </p>
      <p className="mt-2 text-sm leading-6 text-neutral-600">
        Create your first escrow to start tracking milestone-based payments.
      </p>
      <Link
        href="/agency/create"
        className="mt-4 inline-flex rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
      >
        Create Escrow
      </Link>
    </Card>
  );
}
