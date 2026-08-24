"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitDeliverableSchema } from "@/features/escrow/schemas/agency-escrow";
import { MutedText } from "./typography";

const INPUT_CLASS =
  "h-10 w-full rounded-full border border-zinc-200 bg-[#F9F9F9] px-4 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none";

const TEXTAREA_CLASS =
  "block w-full min-h-[110px] resize-y rounded-[20px] border border-zinc-200 bg-[#F9F9F9] px-4 py-3 text-sm font-medium leading-6 text-neutral-900 placeholder:text-neutral-400 focus:border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-300";

type SubmissionValues = {
  deliverySummary: string;
  deliverableLinks: string[];
};

type SubmissionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SubmissionValues) => Promise<boolean>;
};

export function SubmissionModal({
  open,
  onOpenChange,
  onSubmit,
}: SubmissionModalProps) {
  const [summary, setSummary] = useState("");
  const [links, setLinks] = useState<string[]>(["", ""]);
  const [errors, setErrors] = useState<{ summary?: string; links?: string }>(
    {},
  );
  const [sending, setSending] = useState(false);

  const reset = () => {
    setSummary("");
    setLinks(["", ""]);
    setErrors({});
  };

  const handleSubmit = async () => {
    const nextErrors: { summary?: string; links?: string } = {};
    const cleaned = links.map((link) => link.trim()).filter(Boolean);
    const parsed = submitDeliverableSchema.safeParse({
      deliverySummary: summary,
      deliverableLinks: cleaned.length > 0 ? cleaned : undefined,
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "deliverySummary" && !nextErrors.summary) {
          nextErrors.summary = issue.message;
        }
        if (issue.path[0] === "deliverableLinks" && !nextErrors.links) {
          nextErrors.links = "Enter valid URLs (starting with http:// or https://).";
        }
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSending(true);
    try {
      const ok = await onSubmit({
        deliverySummary: parsed.data!.deliverySummary,
        deliverableLinks: cleaned,
      });
      if (ok) {
        reset();
        onOpenChange(false);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="rv-overlay fixed inset-0 z-40 bg-black/45" />
        <Dialog.Content className="rv-modal fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(92vw,640px)] overflow-y-auto rounded-[20px] border border-zinc-500/[0.12] bg-white p-4 shadow-2xl focus:outline-none sm:rounded-[28px] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Dialog.Title className="text-xl font-medium tracking-[-0.5px] text-neutral-950">
                Add submission
              </Dialog.Title>
              <MutedText>
                Summarize your delivery and attach evidence links.
              </MutedText>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <p className="text-lg font-medium tracking-[-0.5px] text-neutral-950">Delivery summary</p>
              <textarea
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="What did you deliver? Anything the approver should check first…"
                className={TEXTAREA_CLASS}
              />
              {errors.summary ? (
                <p className="text-xs font-semibold text-red-600">
                  {errors.summary}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium tracking-[-0.5px] text-neutral-950">
                Deliverable links{" "}
                <span className="text-sm font-medium text-neutral-400">
                  (optional)
                </span>
              </p>
              <div className="space-y-2">
                {links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={link}
                      onChange={(event) => {
                        const next = [...links];
                        next[index] = event.target.value;
                        setLinks(next);
                      }}
                      placeholder={`https://…`}
                      className={INPUT_CLASS}
                    />
                    {links.length > 2 ? (
                      <button
                        type="button"
                        aria-label={`Remove link ${index + 1}`}
                        onClick={() =>
                          setLinks(links.filter((_, i) => i !== index))
                        }
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-zinc-500/[0.15] text-neutral-400 transition-colors hover:border-red-300 hover:text-red-600"
                      >
                        <X aria-hidden className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              {errors.links ? (
                <p className="text-xs font-semibold text-red-600">
                  {errors.links}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setLinks([...links, ""])}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-zinc-500/[0.25] px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-all hover:-translate-y-px hover:border-neutral-950 hover:text-neutral-950"
              >
                <Plus aria-hidden className="h-3 w-3" />
                Add another link
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <Button
                onClick={handleSubmit}
                disabled={sending}
                className="h-11 w-full flex-1 cursor-pointer rounded-full bg-neutral-950 text-sm font-semibold text-white transition-all hover:bg-neutral-800 sm:w-auto"
              >
                {sending ? (
                  <>
                    <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit for review"
                )}
              </Button>
              <Dialog.Close asChild>
                <Button
                  disabled={sending}
                  className="h-11 w-full cursor-pointer rounded-full border-0 bg-neutral-50 px-6 text-[15px] font-semibold tracking-tight text-orange-600 transition-colors hover:bg-orange-50 sm:w-auto"
                >
                  Cancel
                </Button>
              </Dialog.Close>
            </div>

            <MutedText>
              Your submission goes straight to the approver. You will see their
              decision right here.
            </MutedText>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
