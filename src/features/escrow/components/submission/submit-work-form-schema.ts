import { z } from 'zod'
import { submitDeliverableSchema } from '@/features/escrow/schemas/agency-escrow'
import type { SubmitDeliverableInput } from '@/types/agency-escrow'

const urlSchema = z.string().trim().url()

const optionalUrlSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || urlSchema.safeParse(value).success, {
    message: 'Enter a valid URL, including https://',
  })

/**
 * Form-shaped mirror of the frozen `submitDeliverableSchema`. Empty rows and
 * empty optional fields are allowed here and stripped before submission so the
 * frozen contract still validates the final payload.
 */
export const submitWorkFormSchema = z.object({
  deliverySummary: z.string().trim().min(1, 'Delivery summary is required'),
  deliverableLinks: z.array(z.object({ url: optionalUrlSchema })),
  evidence: optionalUrlSchema,
  notes: z.string().trim(),
})

export type SubmitWorkFormValues = z.infer<typeof submitWorkFormSchema>

export const emptySubmitWorkFormValues: SubmitWorkFormValues = {
  deliverySummary: '',
  deliverableLinks: [{ url: '' }],
  evidence: '',
  notes: '',
}

/**
 * `SubmitDeliverableInput` has no free-text notes field, so optional notes are
 * appended to the delivery summary under a clear heading. Documented as a gap
 * against the frozen domain contract rather than changing it.
 */
export function toSubmitDeliverableInput(
  values: SubmitWorkFormValues,
): SubmitDeliverableInput {
  const notes = values.notes.trim()
  const summary = values.deliverySummary.trim()
  const links = values.deliverableLinks
    .map((link) => link.url.trim())
    .filter((url) => url.length > 0)
  const evidence = values.evidence.trim()

  return submitDeliverableSchema.parse({
    deliverySummary: notes ? `${summary}\n\nAdditional notes: ${notes}` : summary,
    ...(links.length > 0 ? { deliverableLinks: links } : {}),
    ...(evidence.length > 0 ? { evidence } : {}),
  }) as SubmitDeliverableInput
}
