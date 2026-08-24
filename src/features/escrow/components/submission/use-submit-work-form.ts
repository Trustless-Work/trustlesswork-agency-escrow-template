'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import type { SubmitDeliverableInput } from '@/types/agency-escrow'
import {
  emptySubmitWorkFormValues,
  submitWorkFormSchema,
  toSubmitDeliverableInput,
  type SubmitWorkFormValues,
} from './submit-work-form-schema'

type UseSubmitWorkFormOptions = {
  onSubmit: (input: SubmitDeliverableInput) => void
}

type UseSubmitWorkFormResult = {
  form: UseFormReturn<SubmitWorkFormValues>
  handleSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>
}

/**
 * Owns form configuration, validation and payload mapping so `SubmitWorkForm`
 * only renders fields and forwards the prepared input.
 *
 * Lives beside the submission components rather than in
 * `src/features/escrow/hooks` because issue #17 scopes this work to
 * `components/submission/**`. Move it into the feature hooks folder if the
 * maintainers prefer it there.
 */
export function useSubmitWorkForm({
  onSubmit,
}: UseSubmitWorkFormOptions): UseSubmitWorkFormResult {
  const form = useForm<SubmitWorkFormValues>({
    resolver: zodResolver(submitWorkFormSchema),
    defaultValues: emptySubmitWorkFormValues,
    mode: 'onSubmit',
  })

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(toSubmitDeliverableInput(values))
  })

  return { form, handleSubmit }
}
