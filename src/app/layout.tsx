import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { WalletProvider } from "@/lib/wallet-provider";
import { TrustlessWorkProvider } from "@/lib/trustlesswork-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Agency Escrow Template",
  description:
    "A milestone-based escrow workflow for agencies built with Trustless Work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <ReactQueryProvider>
            <WalletProvider>
              <TrustlessWorkProvider>
                {children}
                <Toaster />
              </TrustlessWorkProvider>
            </WalletProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
