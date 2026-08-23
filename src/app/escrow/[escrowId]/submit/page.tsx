import { SubmitWorkView } from "@/features/escrow/views/SubmitWorkView";

type SubmitWorkPageProps = {
  params: Promise<{
    escrowId: string;
  }>;
};

const SubmitWorkPage = async ({ params }: SubmitWorkPageProps) => {
  const { escrowId } = await params;

  return <SubmitWorkView escrowId={escrowId} />;
};

export default SubmitWorkPage;
