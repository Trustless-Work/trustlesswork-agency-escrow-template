import { Inter } from "next/font/google";
import { ClientReviewView } from "@/features/escrow/views/ClientReviewView";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-review",
  display: "swap",
});

type ReviewEscrowPageProps = {
  params: Promise<{
    escrowId: string;
  }>;
};

export default async function ReviewEscrowPage({
  params,
}: ReviewEscrowPageProps) {
  const { escrowId } = await params;

  return (
    <div
      className={`${inter.variable} font-[family-name:var(--font-review)]`}
    >
      <ClientReviewView escrowId={escrowId} />
    </div>
  );
}
