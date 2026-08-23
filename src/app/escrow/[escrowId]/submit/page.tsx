import { SubmitWorkView } from "@/features/escrow/views/SubmitWorkView";

type SubmitWorkPageProps = {
  params: Promise<{
    escrowId: string;
  }>;
};

export default async function SubmitWorkPage({ params }: SubmitWorkPageProps) {
  const { escrowId } = await params;

  return <SubmitWorkView escrowId={escrowId} />;
}
