import { Space_Grotesk } from "next/font/google";
import { EscrowDetailView } from "@/features/escrow/views/EscrowDetailView";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
});

type EscrowPageProps = {
  params: Promise<{
    escrowId: string;
  }>;
};

export default async function EscrowPage({ params }: EscrowPageProps) {
  const { escrowId } = await params;

  return (
    <div className={spaceGrotesk.className}>
      <EscrowDetailView escrowId={escrowId} />
    </div>
  );
}
