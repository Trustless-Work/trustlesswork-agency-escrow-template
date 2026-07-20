import Link from "next/link";

type ClientReleaseViewProps = {
  escrowId: string;
};

export const ClientReleaseView = ({ escrowId }: ClientReleaseViewProps) => {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-950 sm:px-10">
      <section className="mx-auto w-full max-w-4xl">
        <Link
          href={`/escrow/${escrowId}`}
          className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950"
        >
          Back to escrow
        </Link>
        <div className="mt-8 border-b border-neutral-200 pb-8">
          <p className="text-sm font-medium uppercase text-neutral-500">
            Client Release
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">
            Release funds for escrow {escrowId}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600">
            Placeholder for the post-approval release screen with gross amount,
            platform fee, net payout, and receiver address.
          </p>
        </div>
      </section>
    </main>
  );
};
