'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { SubmitDeliverableInput } from '@/types/agency-escrow'
import { DeliverableLinksField } from './DeliverableLinksField'
import { Textarea } from './Textarea'
import type { SubmissionMode } from './submission-access'
import { useSubmitWorkForm } from './use-submit-work-form'

type SubmitWorkFormProps = {
  mode: SubmissionMode
  isPending: boolean
  errorMessage: string | null
  onSubmit: (input: SubmitDeliverableInput) => void
}

const COPY: Record<
  SubmissionMode,
  { title: string; description: string; cta: string; pendingCta: string }
> = {
  submit: {
    title: 'Submit your delivery',
    description:
      'Describe what you delivered and link to the evidence. Submitting moves this engagement into review by the approver.',
    cta: 'Submit delivery',
    pendingCta: 'Submitting…',
  },
  resubmit: {
    title: 'Resubmit your delivery',
    description:
      'Explain how you addressed the requested changes and update your links. Resubmitting sends the engagement back into review.',
    cta: 'Resubmit delivery',
    pendingCta: 'Resubmitting…',
  },
}

export const SubmitWorkForm = ({
  mode,
  isPending,
  errorMessage,
  onSubmit,
}: SubmitWorkFormProps) => {
  const copy = COPY[mode]
  const { form, handleSubmit } = useSubmitWorkForm({ onSubmit })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <FormField
              control={form.control}
              name="deliverySummary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery summary</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isPending}
                      placeholder={
                        mode === 'resubmit'
                          ? 'Summarize what changed since the last submission…'
                          : 'Summarize what you delivered and how it meets the acceptance criteria…'
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Required. This is what the approver reads first.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DeliverableLinksField
              control={form.control}
              disabled={isPending}
            />

            <FormField
              control={form.control}
              name="evidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supporting evidence link (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      inputMode="url"
                      placeholder="https://example.com/demo-recording"
                    />
                  </FormControl>
                  <FormDescription>
                    A recording, test report, or anything else that proves the
                    acceptance criteria are met.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isPending}
                      className="min-h-[72px]"
                      placeholder="Anything the approver should know — known limitations, follow-ups, context…"
                    />
                  </FormControl>
                  <FormDescription>
                    Appended to the delivery summary when submitted.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMessage ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {errorMessage}
              </p>
            ) : null}

            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {copy.pendingCta}
                </>
              ) : (
                copy.cta
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
