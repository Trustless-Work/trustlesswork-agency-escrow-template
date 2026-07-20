import { AppShell } from "@/components/app-shell";

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center space-y-4 py-32 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Trustless Work Escrow
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          A milestone-based escrow workflow for agencies, consultants, and product studios. Secure client funds upfront, deliver work in clear increments, and release payment only after approval.
        </p>
        <div className="flex gap-4">
          <a
            href="/agency"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Agency Dashboard
          </a>
        </div>
      </div>
    </AppShell>
  );
}
