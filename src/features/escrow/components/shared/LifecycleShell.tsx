import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import trustlessWorkMark from "../viewer/trustless-work-mark.webp";
import { backLinkClass } from "./design-tokens";

export function LifecycleShell({ children, backHref, backLabel = "Back" }: { children: ReactNode; backHref?: string; backLabel?: string }) {
  return (
    <main className="dark relative min-h-screen overflow-hidden bg-[#05070d] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(47,123,255,0.18),_transparent_42%),radial-gradient(circle_at_80%_20%,_rgba(94,200,255,0.08),_transparent_28%)]" />
      <header className="relative border-b border-white/10">
        <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6 sm:px-10">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-tight">
            <Image src={trustlessWorkMark} alt="Trustless Work" className="size-8" />
            Trustless Work
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <a href="https://docs.trustlesswork.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 transition-colors hover:text-white">Docs</a>
            <Link href="/agency" className="text-slate-400 transition-colors hover:text-white">Escrows</Link>
          </div>
        </nav>
      </header>
      <section className="relative mx-auto w-full max-w-5xl px-6 py-10 sm:px-10">
        {backHref ? (
          <Link href={backHref} className={`mb-8 inline-flex items-center gap-1.5 ${backLinkClass}`}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {backLabel}
          </Link>
        ) : null}
        {children}
      </section>
    </main>
  );
}