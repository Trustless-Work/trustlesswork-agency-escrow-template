import Link from "next/link";

type EscrowDetailViewProps = {
  escrowId: string;
};

export const EscrowDetailView = ({ escrowId }: EscrowDetailViewProps) => {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-950 sm:px-10">
      <section className="mx-auto w-full max-w-5xl">
        <div className="border-b border-neutral-200 pb-8">
          <p className="text-sm font-medium uppercase text-neutral-500">
            Escrow Viewer
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">
            Escrow {escrowId}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600">
            Placeholder for the shared escrow status page with milestone terms,
            roles, fee, timestamps, and transaction references.
          </p>
        </div>

        <nav className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/escrow/${escrowId}/fund`}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium transition-colors hover:border-neutral-950"
          >
            Funding
          </Link>
          <Link
            href={`/escrow/${escrowId}/review`}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium transition-colors hover:border-neutral-950"
          >
            Review
          </Link>
          <Link
            href={`/escrow/${escrowId}/release`}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium transition-colors hover:border-neutral-950"
          >
            Release
          </Link>
        </nav>
      </section>
    </main>
  );
};
