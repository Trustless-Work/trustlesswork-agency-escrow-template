"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAgencyEscrows } from "@/features/escrow/hooks";
import { EscrowList } from "@/features/escrow/components/dashboard/EscrowList";
import { EscrowEmptyState } from "@/features/escrow/components/dashboard/EscrowEmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  STATUS_SORT_ORDER,
  type SortOption,
} from "@/features/escrow/components/dashboard/escrow-dashboard-utils";

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
        <div key={index} className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
    <div className="mt-8 hidden overflow-hidden rounded-lg border border-neutral-200 bg-white md:block">
      <div className="grid grid-cols-6 gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-20" />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, row) => (
        <div key={row} className="grid grid-cols-6 gap-4 border-b border-neutral-100 px-4 py-4 last:border-b-0">
          {Array.from({ length: 6 }).map((_, column) => (
            <Skeleton key={column} className="h-5 w-full max-w-28" />
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
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-950 sm:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-6 border-b border-neutral-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">Escrows</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600">
              Track protected payments and what needs your attention next.
            </p>
          </div>
          <Link
            href="/agency/create"
            className="inline-flex w-fit rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Create Escrow
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-600">
            {escrows ? `${escrows.length} escrow${escrows.length === 1 ? "" : "s"}` : ""}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">Sort by</span>
            <Button
              variant={sort === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSort("newest")}
            >
              Newest
            </Button>
            <Button
              variant={sort === "status" ? "default" : "outline"}
              size="sm"
              onClick={() => setSort("status")}
            >
              Status
            </Button>
          </div>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : isError ? (
          <div className="mt-10 rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            <p className="font-medium">Unable to load escrows</p>
            <p className="mt-2 text-red-600">
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
      </section>
    </main>
  );
};
