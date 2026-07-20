import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
