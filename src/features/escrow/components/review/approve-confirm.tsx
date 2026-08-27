"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ApproveConfirmProps = {
  disabled?: boolean;
  pending?: boolean;
  onConfirm: () => Promise<boolean>;
};

export function ApproveConfirm({
  disabled = false,
  pending = false,
  onConfirm,
}: ApproveConfirmProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const ok = await onConfirm();
      if (ok) {
        setOpen(false);
      }
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          disabled={disabled || pending}
          className="h-11 w-full cursor-pointer rounded-full bg-neutral-950 text-[15px] font-semibold tracking-tight text-white shadow-sm transition-colors hover:bg-neutral-800"
        >
          {pending ? (
            <>
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              Approving…
            </>
          ) : (
            "Approve deliverable"
          )}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="rv-overlay fixed inset-0 z-40 bg-black/45" />
        <Dialog.Content className="rv-modal fixed left-1/2 top-1/2 z-50 w-[min(92vw,420px)] rounded-[28px] border border-zinc-500/[0.12] bg-white p-6 shadow-2xl focus:outline-none">
          <Dialog.Title className="text-xl font-medium tracking-[-0.5px] text-neutral-950">
            Approve this deliverable?
          </Dialog.Title>
          <Dialog.Description asChild>
            <p className="mt-2 text-sm font-medium leading-5 text-neutral-500">
              Approval is final and cannot be undone. The escrow moves to
              approved and funds become ready for release.
            </p>
          </Dialog.Description>
          <div className="mt-6 flex gap-2">
            <Button
              onClick={handleConfirm}
              disabled={confirming}
              className="h-10 flex-1 cursor-pointer rounded-full bg-neutral-950 text-[15px] font-semibold tracking-tight text-white shadow-sm hover:bg-neutral-800"
            >
              {confirming ? (
                <>
                  <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                  Approving…
                </>
              ) : (
                "Yes, approve"
              )}
            </Button>
            <Dialog.Close asChild>
              <Button
                disabled={confirming}
                className="h-10 cursor-pointer rounded-full border-0 bg-neutral-50 px-6 text-[15px] font-semibold tracking-tight text-orange-600 transition-colors hover:bg-orange-50"
              >
                Cancel
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
