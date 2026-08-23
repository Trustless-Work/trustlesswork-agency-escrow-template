'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, type Control } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { SubmitWorkFormValues } from './submit-work-form-schema'

type DeliverableLinksFieldProps = {
  control: Control<SubmitWorkFormValues>
  disabled?: boolean
}

export function DeliverableLinksField({
  control,
  disabled,
}: DeliverableLinksFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'deliverableLinks',
  })

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium leading-none">Deliverable links</p>
        <p className="mt-2 text-[0.8rem] text-muted-foreground">
          Link to the work itself &mdash; a repository, staging URL, document, or
          design file. Empty rows are ignored.
        </p>
      </div>

      {fields.map((field, index) => (
        <FormField
          key={field.id}
          control={control}
          name={`deliverableLinks.${index}.url`}
          render={({ field: linkField }) => (
            <FormItem>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <FormControl>
                    <Input
                      {...linkField}
                      disabled={disabled}
                      inputMode="url"
                      placeholder="https://github.com/acme/landing-page"
                      aria-label={`Deliverable link ${index + 1}`}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled || fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">
                    Remove deliverable link {index + 1}
                  </span>
                </Button>
              </div>
            </FormItem>
          )}
        />
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => append({ url: '' })}
      >
        <Plus className="h-4 w-4" />
        Add another link
      </Button>
    </div>
  )
}
