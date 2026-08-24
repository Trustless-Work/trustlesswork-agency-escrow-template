import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ViewerShell } from "./ViewerShell";
import {
  viewerLabelClass,
  viewerMutedClass,
  viewerOutlineButtonClass,
} from "./viewer-styles";

type EscrowNotFoundProps = {
  escrowId: string;
};

export const EscrowDetailSkeleton = () => {
  return (
    <ViewerShell>
      <Skeleton className="h-4 w-32 bg-white/10" />
      <div className="flex flex-col gap-3 border-b border-white/10 pb-8">
        <Skeleton className="h-4 w-28 bg-white/10" />
        <Skeleton className="h-10 w-3/4 bg-white/10" />
        <Skeleton className="h-4 w-40 bg-white/10" />
      </div>
      <Skeleton className="h-28 w-full bg-white/10" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 w-full bg-white/10" />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-48 w-full bg-white/10" />
          <Skeleton className="h-56 w-full bg-white/10" />
        </div>
      </div>
      <Skeleton className="h-64 w-full bg-white/10" />
    </ViewerShell>
  );
};

export const EscrowNotFound = ({ escrowId }: EscrowNotFoundProps) => {
  return (
    <ViewerShell>
      <p className={viewerLabelClass}>Escrow viewer</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
        Escrow not found
      </h1>
      <p className={`mt-3 max-w-2xl text-base leading-7 ${viewerMutedClass}`}>
        No protected payment matches{" "}
        <span className="font-medium text-white">{escrowId}</span>. Check the
        link, or go back to the dashboard.
      </p>
      <Link href="/agency" className={`${viewerOutlineButtonClass} mt-8`}>
        Back to dashboard
      </Link>
    </ViewerShell>
  );
};

export const EscrowLoadError = () => {
  return (
    <ViewerShell>
      <p className={viewerLabelClass}>Escrow viewer</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
        Could not load escrow
      </h1>
      <p className={`mt-3 max-w-2xl text-base leading-7 ${viewerMutedClass}`}>
        Something went wrong while loading this protected payment. Try again in
        a moment.
      </p>
      <Link href="/agency" className={`${viewerOutlineButtonClass} mt-8`}>
        Back to dashboard
      </Link>
    </ViewerShell>
  );
};
