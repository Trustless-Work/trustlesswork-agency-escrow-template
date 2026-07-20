import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { WalletProvider } from "@/lib/wallet-provider";
import { TrustlessWorkProvider } from "@/lib/trustlesswork-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agency Escrow Template",
  description: "Milestone-based escrow workflow for agencies",
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
