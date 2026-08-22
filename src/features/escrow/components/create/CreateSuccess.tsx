"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  CircleCheckBig,
  Copy,
  Plus,
} from "lucide-react";
import type { AgencyEscrow } from "@/types/agency-escrow";
import { getPaymentParties } from "@/features/escrow/utils/roles";
import { formatAsset, getDirectionCopy } from "./create-flow";

type CreateSuccessProps = {
  escrow: AgencyEscrow;
  onCreateAnother: () => void;
};

export function CreateSuccess({ escrow, onCreateAnother }: CreateSuccessProps) {
  const [copied, setCopied] = useState(false);
  const copy = getDirectionCopy(escrow.paymentDirection);
  const { payer, payee } = getPaymentParties(
    escrow.paymentDirection,
    escrow.workspace,
    escrow.counterparty,
  );
  const escrowPath = `/escrow/${escrow.escrowId}`;

  const shareLink = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${escrowPath}`
        : escrowPath;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Escrow link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link. Copy it from the address bar.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
          <CircleCheckBig className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
          Escrow created
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          {copy.summary({
            payer: payer.name,
            payee: payee.name,
            amount: formatAsset(escrow.payment.amount, escrow.payment.asset),
          })}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div>
            <dt className="text-xs text-neutral-500 dark:text-neutral-400">
              Reference
            </dt>
            <dd className="mt-0.5 font-medium text-neutral-950 dark:text-neutral-50">
              {escrow.engagementId}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500 dark:text-neutral-400">
              Amount
            </dt>
            <dd className="mt-0.5 font-medium text-neutral-950 dark:text-neutral-50">
              {formatAsset(escrow.payment.amount, escrow.payment.asset)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500 dark:text-neutral-400">
              Deliverable
            </dt>
            <dd className="mt-0.5 font-medium text-neutral-950 dark:text-neutral-50">
              {escrow.milestone.title}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500 dark:text-neutral-400">
              Status
            </dt>
            <dd className="mt-0.5 font-medium capitalize text-neutral-950 dark:text-neutral-50">
              {escrow.status}
            </dd>
          </div>
        </dl>

        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            Next: {copy.nextActionTitle}
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300/90">
            {copy.nextAction(escrow.counterparty.name)}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={escrowPath}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            View escrow
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={shareLink}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden />
            ) : (
              <Copy className="h-4 w-4" aria-hidden />
            )}
            {copied ? "Copied" : "Copy share link"}
          </button>
        </div>

        <button
          type="button"
          onClick={onCreateAnother}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Create another escrow
        </button>
      </div>
    </div>
  );
}
