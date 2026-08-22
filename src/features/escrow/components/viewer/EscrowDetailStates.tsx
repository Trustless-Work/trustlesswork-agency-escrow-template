import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ViewerShell } from "./ViewerShell";
import { viewerMutedClass, viewerOutlineButtonClass, viewerTitleClass } from "./viewer-styles";

type EscrowNotFoundProps = {
  escrowId: string;
};

export const EscrowDetailSkeleton = () => {
  return (
    <ViewerShell>
      <div className="flex flex-col gap-8">
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <div className="flex flex-col gap-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-56 w-full rounded-2xl" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </ViewerShell>
  );
};

export const EscrowNotFound = ({ escrowId }: EscrowNotFoundProps) => {
  return (
    <ViewerShell>
      <p className="text-sm font-medium text-gray-500">Escrow viewer</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        <span className={viewerTitleClass}>
          Escrow not found
        </span>
      </h1>
      <p className={cn("mt-3 max-w-2xl leading-7", viewerMutedClass)}>
        No protected payment matches{" "}
        <span className="font-semibold text-slate-950">{escrowId}</span>. It may
        have been removed, or the link may be incorrect.
      </p>
      <Link href="/agency" className={cn(viewerOutlineButtonClass, "mt-8")}>
        Back to dashboard
      </Link>
    </ViewerShell>
  );
};

export const EscrowLoadError = () => {
  return (
    <ViewerShell>
      <p className="text-sm font-medium text-gray-500">Escrow viewer</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        <span className={viewerTitleClass}>
          Could not load escrow
        </span>
      </h1>
      <p className={cn("mt-3 max-w-2xl leading-7", viewerMutedClass)}>
        Something went wrong while loading this protected payment. Try again in
        a moment.
      </p>
      <Link href="/agency" className={cn(viewerOutlineButtonClass, "mt-8")}>
        Back to dashboard
      </Link>
    </ViewerShell>
  );
};
