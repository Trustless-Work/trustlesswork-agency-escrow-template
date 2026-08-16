import { AppShell } from "@/components/app-shell";
import Link from "next/link";

const flowSteps = [
  "Create the escrow from the terms you already agreed on",
  "The payer secures the agreed amount",
  "The service provider delivers the work",
  "The approver confirms the deliverable",
  "Funds are released to the payee",
];

export default function Home() {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 py-10 sm:py-16">
        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
              TechRebel use-case demo
            </div>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Put escrow around work you already agreed on.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              You already have the proposal, contract, SOW, or agreed terms. This
              demo shows how an agency can turn one payment obligation into a
              simple escrow workflow without turning escrow into another project
              management tool.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/agency/create"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Create an escrow
              </Link>
              <a
                href="#flows"
                className="inline-flex h-11 items-center justify-center rounded-md border bg-background px-6 text-sm font-medium transition-colors hover:bg-muted"
              >
                See the two flows
              </a>
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/30 p-6 sm:p-8">
            <p className="text-sm font-medium text-muted-foreground">
              The mental model
            </p>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border bg-background p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  1. Existing agreement
                </p>
                <p className="mt-2 font-medium">
                  Website redesign · $5,000 USDC · delivery by September 30
                </p>
              </div>
              <div className="flex justify-center text-muted-foreground">↓</div>
              <div className="rounded-xl border bg-background p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  2. Escrow protects the payment
                </p>
                <p className="mt-2 font-medium">
                  Fund → deliver → approve → release
                </p>
              </div>
              <div className="flex justify-center text-muted-foreground">↓</div>
              <div className="rounded-xl border bg-background p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  3. Payment completes
                </p>
                <p className="mt-2 font-medium">
                  The payee receives funds after the agreed work is approved.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="flows" className="scroll-mt-24">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-muted-foreground">
              Two directions, one workflow
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              TechRebel can be the payer or the payee.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              The workspace stays the same. We only change who funds the escrow,
              who delivers the work, and who receives the payment.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border bg-background p-6 sm:p-8">
              <div className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                We&apos;re getting paid
              </div>
              <h3 className="mt-5 text-2xl font-semibold">Acme → TechRebel</h3>
              <p className="mt-3 text-muted-foreground">
                We already agreed to deliver a product strategy sprint for
                5,000 USDC. TechRebel creates the escrow and sends Acme the
                funding link.
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-y py-5 text-sm">
                <div>
                  <dt className="text-muted-foreground">Payer</dt>
                  <dd className="mt-1 font-medium">Acme</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Payee</dt>
                  <dd className="mt-1 font-medium">TechRebel</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Delivers</dt>
                  <dd className="mt-1 font-medium">TechRebel</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Approves</dt>
                  <dd className="mt-1 font-medium">Acme</dd>
                </div>
              </dl>

              <p className="mt-5 text-sm font-medium">
                Acme funds → TechRebel delivers → Acme approves → TechRebel gets paid
              </p>
            </article>

            <article className="rounded-2xl border bg-background p-6 sm:p-8">
              <div className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                We&apos;re paying someone
              </div>
              <h3 className="mt-5 text-2xl font-semibold">TechRebel → Maria</h3>
              <p className="mt-3 text-muted-foreground">
                We already agreed to hire Maria for a 2,000 USDC landing page.
                TechRebel creates and funds the escrow so Maria knows the payment
                is secured before starting.
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-y py-5 text-sm">
                <div>
                  <dt className="text-muted-foreground">Payer</dt>
                  <dd className="mt-1 font-medium">TechRebel</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Payee</dt>
                  <dd className="mt-1 font-medium">Maria</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Delivers</dt>
                  <dd className="mt-1 font-medium">Maria</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Approves</dt>
                  <dd className="mt-1 font-medium">TechRebel</dd>
                </div>
              </dl>

              <p className="mt-5 text-sm font-medium">
                TechRebel funds → Maria delivers → TechRebel approves → Maria gets paid
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-2xl border bg-muted/30 p-6 sm:p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                What the escrow needs
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Only the payment terms that matter.
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                The legal agreement stays where it already lives. The escrow only
                needs enough information to secure and release one payment.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Who is paying?", "Identify the payer and funding wallet."],
                ["Who is getting paid?", "Identify the service provider and receiving wallet."],
                ["What payment is protected?", "Amount, asset, deliverable, and optional due date."],
                ["What counts as done?", "Clear acceptance criteria for approving the release."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-xl border bg-background p-5">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-muted-foreground">
              Shared lifecycle
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              One escrow protects one payment.
            </h2>
          </div>

          <ol className="mt-8 grid gap-4 md:grid-cols-5">
            {flowSteps.map((step, index) => (
              <li key={step} className="rounded-xl border p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </div>
                <p className="mt-4 text-sm font-medium leading-6">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border bg-primary px-6 py-10 text-primary-foreground sm:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                The contract defines the relationship. Escrow protects the payment.
              </h2>
              <p className="mt-3 text-sm leading-6 opacity-80 sm:text-base">
                Start with the terms you already agreed on, then choose who is
                getting paid. The application can derive the escrow roles from there.
              </p>
            </div>
            <Link
              href="/agency/create"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Start an escrow
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
