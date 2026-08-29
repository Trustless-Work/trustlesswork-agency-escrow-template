import { Skeleton } from "@/components/ui/skeleton";

export function LifecycleSkeleton() {
  return (
    <div className="mt-8 space-y-6">
      <Skeleton className="h-5 w-40 bg-white/10" />
      <Skeleton className="h-44 w-full rounded-xl bg-white/10" />
      <Skeleton className="h-32 w-full rounded-xl bg-white/10" />
    </div>
  );
}