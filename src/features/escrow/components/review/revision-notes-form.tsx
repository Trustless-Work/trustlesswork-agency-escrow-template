"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { requestChangesSchema } from "@/features/escrow/schemas/agency-escrow";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TEXTAREA_CLASS_NAME =
  "block w-full min-h-[110px] resize-y rounded-2xl border border-zinc-200 bg-[#F9F9F9] px-3 py-2 text-sm font-medium leading-6 text-neutral-900 placeholder:text-neutral-400 placeholder:font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-300 focus-visible:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-50";

type RevisionNotesFormProps = {
  disabled?: boolean;
  pending?: boolean;
  variant?: "soft" | "default";
  hideButton?: boolean;
  id?: string;
  onSubmit: (values: z.infer<typeof requestChangesSchema>) => void;
};

export function RevisionNotesForm({
  disabled = false,
  pending = false,
  variant,
  hideButton = false,
  id,
  onSubmit,
}: RevisionNotesFormProps) {
  const form = useForm<z.infer<typeof requestChangesSchema>>({
    resolver: zodResolver(requestChangesSchema),
    defaultValues: { revisionNotes: "" },
  });

  return (
    <Form {...form}>
      <form
        id={id}
        onSubmit={form.handleSubmit((values) => onSubmit(values))}
        className="space-y-3"
      >
        <FormField
          control={form.control}
          name="revisionNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Revision notes</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  disabled={disabled || pending}
                  placeholder="Describe exactly what needs to change before you can approve…"
                  className={TEXTAREA_CLASS_NAME}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!hideButton && (
          <Button
            type="submit"
            disabled={disabled || pending}
            className={cn(
              "h-11 w-full rounded-full px-6 text-[15px] font-semibold tracking-tight",
              variant === "soft"
                ? "cursor-pointer bg-neutral-50 text-orange-600 transition-colors hover:bg-orange-50"
                : "cursor-pointer bg-neutral-950 text-white transition-colors hover:bg-neutral-800",
            )}
          >
            {pending ? "Sending…" : "Request changes"}
          </Button>
        )}
      </form>
    </Form>
  );
}
