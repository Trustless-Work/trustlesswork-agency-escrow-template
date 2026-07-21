import { ClientReleaseView } from "@/features/escrow/views/ClientReleaseView";

type ReleaseEscrowPageProps = {
  params: Promise<{
    escrowId: string;
  }>;
};

export default async function ReleaseEscrowPage({
  params,
}: ReleaseEscrowPageProps) {
  const { escrowId } = await params;

  return <ClientReleaseView escrowId={escrowId} />;
}
