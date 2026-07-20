import { ClientFundingView } from "@/features/escrow/views/ClientFundingView";

type FundEscrowPageProps = {
  params: Promise<{
    escrowId: string;
  }>;
};

export default async function FundEscrowPage({ params }: FundEscrowPageProps) {
  const { escrowId } = await params;

  return <ClientFundingView escrowId={escrowId} />;
}
