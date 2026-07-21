import { AppShell, ExampleCard } from "@/components/app-shell";

export default function AgencyPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agency Dashboard</h2>
          <p className="text-muted-foreground">Manage your escrow contracts and milestones.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ExampleCard />
        </div>
      </div>
    </AppShell>
  );
}
