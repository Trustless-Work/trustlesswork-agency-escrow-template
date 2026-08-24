import { EscrowDetailView } from "@/features/escrow/views/EscrowDetailView";

type EscrowPageProps = {
  params: Promise<{
    escrowId: string;
  }>;
};

export default async function EscrowPage({ params }: EscrowPageProps) {
  const { escrowId } = await params;

  return <EscrowDetailView escrowId={escrowId} />;
}
