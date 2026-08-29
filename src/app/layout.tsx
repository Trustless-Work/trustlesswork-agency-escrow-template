import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { WalletProvider } from "@/lib/wallet-provider";
import { TrustlessWorkProvider } from "@/lib/trustlesswork-provider";
import { WalletActorBar } from "@/features/escrow/components/wallet/WalletActorBar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Agency Escrow Template",
  description:
    "A bidirectional protected-payment workflow for service agreements built with Trustless Work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <ReactQueryProvider>
            <TrustlessWorkProvider>
              <WalletProvider>
                <WalletActorBar />
                {children}
                <Toaster />
              </WalletProvider>
            </TrustlessWorkProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
