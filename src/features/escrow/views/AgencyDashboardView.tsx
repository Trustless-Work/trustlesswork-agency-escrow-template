import Link from "next/link";

export const AgencyDashboardView = () => {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-950 sm:px-10">
      <section className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-6 border-b border-neutral-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase text-neutral-500">
              Agency
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal">
              Escrow dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600">
              Placeholder for agency-created milestone escrows, status, amounts,
              and next actions.
            </p>
          </div>
          <Link
            href="/agency/create"
            className="inline-flex w-fit rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Create Escrow
          </Link>
        </div>

        <div className="mt-10 rounded-md border border-dashed border-neutral-300 bg-white p-6">
          <p className="text-sm font-medium text-neutral-950">
            Feature scaffold ready
          </p>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            The next build-plan issues will replace this placeholder with the
            mock escrow list and role-aware CTAs.
          </p>
        </div>
      </section>
    </main>
  );
};
