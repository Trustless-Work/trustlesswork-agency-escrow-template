"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAgencyEscrows } from "@/features/escrow/hooks";
import { EscrowList } from "@/features/escrow/components/dashboard/EscrowList";
import { EscrowEmptyState } from "@/features/escrow/components/dashboard/EscrowEmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  STATUS_SORT_ORDER,
  type SortOption,
} from "@/features/escrow/components/dashboard/escrow-dashboard-utils";
import { LifecycleShell, pageTitleClass, mutedClass, primaryButtonClass, outlineButtonClass } from "@/features/escrow/components/shared";

const useAgencyDashboard = () => {
  const { data: escrows, isLoading, isError, error } = useAgencyEscrows();
  const [sort, setSort] = useState<SortOption>("newest");

  const sorted = useMemo(() => {
    if (!escrows) return [];
    const items = [...escrows];

    if (sort === "newest") {
      items.sort((a, b) => b.timestamps.createdAt.localeCompare(a.timestamps.createdAt));
      return items;
    }

    items.sort((a, b) => STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status]);
    return items;
  }, [escrows, sort]);

  return { escrows, isLoading, isError, error, sort, setSort, sorted };
};

const DashboardSkeleton = () => (
  <>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 md:hidden">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-lg border border-white/10 bg-[#0b1220] p-5">
          <Skeleton className="h-5 w-2/3 bg-white/10" />
          <Skeleton className="h-4 w-1/2 bg-white/10" />
          <Skeleton className="h-4 w-1/3 bg-white/10" />
        </div>
      ))}
    </div>
    <div className="mt-8 hidden overflow-hidden rounded-lg border border-white/10 bg-[#0b1220] md:block">
      <div className="grid grid-cols-6 gap-4 border-b border-white/10 bg-[#05070d]/50 px-4 py-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-20 bg-white/10" />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, row) => (
        <div key={row} className="grid grid-cols-6 gap-4 border-b border-white/10 px-4 py-4 last:border-b-0">
          {Array.from({ length: 6 }).map((_, column) => (
            <Skeleton key={column} className="h-5 w-full max-w-28 bg-white/10" />
          ))}
        </div>
      ))}
    </div>
  </>
);

export const AgencyDashboardView = () => {
  const { escrows, isLoading, isError, error, sort, setSort, sorted } =
    useAgencyDashboard();

  return (
    <LifecycleShell>
      <div className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:items-center sm:justify-between">
        <div>
          <h1 className={pageTitleClass}>Escrows</h1>
          <p className={`mt-3 max-w-2xl text-base leading-7 ${mutedClass}`}>
            Track protected payments and what needs your attention next.
          </p>
        </div>
        <Link href="/agency/create" className={primaryButtonClass}>
          Create Escrow
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className={`text-sm ${mutedClass}`}>
          {escrows ? `${escrows.length} escrow${escrows.length === 1 ? "" : "s"}` : ""}
        </p>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${mutedClass}`}>Sort by</span>
          <button
            className={sort === "newest" ? primaryButtonClass : outlineButtonClass}
            onClick={() => setSort("newest")}
          >
            Newest
          </button>
          <button
            className={sort === "status" ? primaryButtonClass : outlineButtonClass}
            onClick={() => setSort("status")}
          >
            Status
          </button>
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <div className="mt-10 rounded-md border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-400">
          <p className="font-medium">Unable to load escrows</p>
          <p className="mt-2 text-red-300">
            {error instanceof Error ? error.message : "Please try again later."}
          </p>
        </div>
      ) : sorted.length ? (
        <div className="mt-8">
          <EscrowList escrows={sorted} />
        </div>
      ) : (
        <div className="mt-10">
          <EscrowEmptyState />
        </div>
      )}
    </LifecycleShell>
  );
};
