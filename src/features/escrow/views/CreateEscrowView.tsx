"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import type { AgencyEscrow, CreateAgencyEscrowInput } from "@/types/agency-escrow";
import { useCreateProtectedPayment } from "@/features/escrow/hooks";
import { CreateEscrowForm } from "@/features/escrow/components/create/CreateEscrowForm";
import { CreateSuccess } from "@/features/escrow/components/create/CreateSuccess";

export const CreateEscrowView = () => {
  const createEscrow = useCreateProtectedPayment();
  const [created, setCreated] = useState<AgencyEscrow | null>(null);
  // Bumped to remount the form with fresh defaults on "create another".
  const [formKey, setFormKey] = useState(0);

  const handleCreate = async (input: CreateAgencyEscrowInput) => {
    const escrow = await createEscrow.mutateAsync(input);
    setCreated(escrow);
    toast.success("Escrow created");
  };

  const handleCreateAnother = () => {
    setCreated(null);
    createEscrow.reset();
    setFormKey((key) => key + 1);
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-950 sm:px-8 sm:py-10 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/agency"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to dashboard
        </Link>

        {created ? (
          <div className="mt-10">
            <CreateSuccess
              escrow={created}
              onCreateAnother={handleCreateAnother}
            />
          </div>
        ) : (
          <>
            <header className="mt-6 border-b border-neutral-200 pb-6 dark:border-neutral-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Create escrow
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Turn an agreement into a protected payment
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                Set the terms, preview who pays whom, and create a single-release
                escrow. Roles are derived automatically from your choices.
              </p>
            </header>

            <div className="mt-8">
              <CreateEscrowForm
                key={formKey}
                onCreate={handleCreate}
                isSubmitting={createEscrow.isPending}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
};
