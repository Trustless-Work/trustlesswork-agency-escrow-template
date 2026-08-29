"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { AgencyEscrow, CreateAgencyEscrowInput } from "@/types/agency-escrow";
import { useCreateProtectedPayment } from "@/features/escrow/hooks";
import { CreateEscrowForm } from "@/features/escrow/components/create/CreateEscrowForm";
import { CreateSuccess } from "@/features/escrow/components/create/CreateSuccess";
import { LifecycleShell, LifecyclePageHeader, mutedClass } from "@/features/escrow/components/shared";

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
    <LifecycleShell backHref="/agency" backLabel="Back to dashboard">
      {created ? (
        <div className="mt-2">
          <CreateSuccess
            escrow={created}
            onCreateAnother={handleCreateAnother}
          />
        </div>
      ) : (
        <>
          <LifecyclePageHeader
            context="Create escrow"
            title="Turn an agreement into a protected payment"
          />
          <p className={`mt-6 max-w-2xl ${mutedClass}`}>
            Set the terms, preview who pays whom, and create a single-release
            escrow. Roles are derived automatically from your choices.
          </p>

          <div className="mt-8">
            <CreateEscrowForm
              key={formKey}
              onCreate={handleCreate}
              isSubmitting={createEscrow.isPending}
            />
          </div>
        </>
      )}
    </LifecycleShell>
  );
};
