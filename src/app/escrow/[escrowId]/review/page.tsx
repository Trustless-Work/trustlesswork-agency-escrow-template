import { ClientReviewView } from "@/features/escrow/views/ClientReviewView";

type ReviewEscrowPageProps = {
  params: Promise<{
    escrowId: string;
  }>;
};

export default async function ReviewEscrowPage({
  params,
}: ReviewEscrowPageProps) {
  const { escrowId } = await params;

  return <ClientReviewView escrowId={escrowId} />;
}
