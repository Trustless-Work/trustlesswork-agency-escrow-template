import Link from "next/link";
import type { ReactNode } from "react";

type ViewerShellProps = {
  children: ReactNode;
};

export const ViewerShell = ({ children }: ViewerShellProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-[#f5faff] text-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px]">
        <div className="absolute top-1/4 left-1/4 size-64 rounded-full bg-[#006ee6]/10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 size-72 rounded-full bg-blue-400/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-10 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6 sm:px-10">
          <Link href="/" className="text-lg font-bold sm:text-xl">
            Trustless Work
          </Link>
          <Link href="/agency" className="text-sm font-medium hover:underline">
            Escrows
          </Link>
        </nav>
      </header>

      <main className="relative mx-auto w-full max-w-5xl px-6 py-10 sm:px-10">
        {children}
      </main>
    </div>
  );
};
