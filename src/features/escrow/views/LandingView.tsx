import Link from "next/link";

export const LandingView = () => {
  return (
    <main className="relative min-h-screen bg-[#05070d] text-neutral-50">
      {/* Radial glow matching LifecycleShell */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(47, 123, 255, 0.15), transparent)",
        }}
      />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-10 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between gap-6">
          <p className="text-sm font-semibold uppercase text-[#7eb6ff]">
            Trustless Work
          </p>
          <Link
            href="/agency"
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-100 transition-colors hover:border-[#7eb6ff] hover:text-[#7eb6ff]"
          >
            Agency Dashboard
          </Link>
        </header>

        <div className="grid gap-10 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-medium uppercase text-neutral-400">
              Agency Escrow Template
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Secure client funds upfront and release payment after approved
              delivery.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-300 sm:text-lg">
              A milestone-based escrow workflow for agencies, consultants, and
              product studios building with Trustless Work on Stellar.
            </p>
          </div>

          <div className="border-l border-neutral-800 pl-6 text-sm leading-7 text-neutral-300">
            <p className="font-medium text-neutral-50">MVP flow</p>
            <ol className="mt-4 space-y-3">
              <li>1. Agency creates a one-milestone escrow.</li>
              <li>2. Client reviews and funds the agreement.</li>
              <li>3. Delivery is submitted, approved, and released.</li>
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
};
