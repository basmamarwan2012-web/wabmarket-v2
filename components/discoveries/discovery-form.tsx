'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Spinner } from '@/components/ui/spinner'
import { useLoading } from '@/hooks/use-loading'
import { useProgress } from '@/hooks/use-progress'
import { useToast } from '@/hooks/use-toast'
import {
  discoveryCreateSchema,
  type DiscoveryCreateInput,
} from '@/lib/discoveries/validation'
import { discoveryService } from '@/services/discovery.service'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700'

export function DiscoveryForm() {
  const router = useRouter()
  const { beginLoading } = useLoading()
  const { beginNavigation } = useProgress()
  const { toast } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const form = useForm<DiscoveryCreateInput>({
    resolver: zodResolver(
      discoveryCreateSchema
    ) as Resolver<DiscoveryCreateInput>,
    defaultValues: {
      keyword: '',
      city: '',
      state: null,
      country: '',
      language: null,
      maxResults: 25,
    },
  })

  const submit = async (input: DiscoveryCreateInput) => {
    setServerError(null)
    const operation = beginLoading({ message: 'Starting domain search...' })
    try {
      await discoveryService.create(input)
      toast({
        variant: 'success',
        message: 'Domain search started.',
        dedupeKey: 'discovery-created',
      })
      beginNavigation('Loading Domain Discovery...')
      router.push('/admin/discovery')
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : 'The domain search could not be started.'
      setServerError(message)
      toast({
        variant: 'error',
        message: 'Domain search could not be started.',
      })
    } finally {
      operation.finish()
    }
  }

  const errors = form.formState.errors
  return (
    <form
      onSubmit={form.handleSubmit(submit, () =>
        toast({
          variant: 'warning',
          message: 'Please correct the validation errors.',
        })
      )}
      className="space-y-6 rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Keyword" error={errors.keyword?.message}>
          <input {...form.register('keyword')} className={inputClass} />
        </Field>
        <Field label="City" error={errors.city?.message}>
          <input {...form.register('city')} className={inputClass} />
        </Field>
        <Field label="State" error={errors.state?.message}>
          <input {...form.register('state')} className={inputClass} />
        </Field>
        <Field label="Country" error={errors.country?.message}>
          <input {...form.register('country')} className={inputClass} />
        </Field>
        <Field label="Language" error={errors.language?.message}>
          <input
            {...form.register('language')}
            className={inputClass}
            placeholder="Optional, for example en"
          />
        </Field>
        <Field label="Max results" error={errors.maxResults?.message}>
          <input
            {...form.register('maxResults')}
            type="number"
            min="1"
            max="100"
            className={inputClass}
          />
        </Field>
      </div>
      {serverError && (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"
        >
          {serverError}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          disabled={form.formState.isSubmitting}
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {form.formState.isSubmitting && <Spinner />}
          {form.formState.isSubmitting ? 'Starting...' : 'Start search'}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-500">{error}</span>}
    </label>
  )
}
