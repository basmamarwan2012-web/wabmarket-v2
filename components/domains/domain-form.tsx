'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { getOperatorStatusTransitions } from '@/lib/domains/permissions'
import {
  domainCreateSchema,
  type DomainCreateInput,
  type DomainPatchInput,
} from '@/lib/domains/validation'
import { domainService } from '@/services/domain.service'
import type { Domain } from '@/types/domain'
import type { UserRole } from '@/lib/auth/roles'
import { Spinner } from '@/components/ui/spinner'
import { useLoading } from '@/hooks/use-loading'
import { useToast } from '@/hooks/use-toast'
import { useProgress } from '@/hooks/use-progress'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700'

function defaults(domain?: Domain): DomainCreateInput {
  return {
    domainName: domain?.domainName ?? '',
    registrar: domain?.registrar ?? '',
    keyword: domain?.keyword ?? '',
    city: domain?.city ?? '',
    state: domain?.state ?? '',
    country: domain?.country ?? '',
    purchasePrice: domain?.purchasePrice ?? 0,
    estimatedPrice: domain?.estimatedPrice ?? 0,
    askingPrice: domain?.askingPrice ?? 0,
    flipScore: domain?.flipScore ?? 0,
    status: domain?.status ?? 'active',
    purchaseDate: domain?.purchaseDate?.slice(0, 10) ?? '',
    expirationDate: domain?.expirationDate?.slice(0, 10) ?? '',
    renewalDate: domain?.renewalDate?.slice(0, 10) ?? '',
    autoRenew: domain?.autoRenew ?? false,
    nameservers: domain?.nameservers ?? [],
    afternicCheckoutLink: domain?.afternicCheckoutLink ?? '',
    landingPageUrl: domain?.landingPageUrl ?? '',
    description: domain?.description ?? '',
  }
}

function changedPatch(
  domain: Domain,
  values: DomainCreateInput
): DomainPatchInput {
  const comparable: Record<keyof DomainCreateInput, unknown> = {
    domainName: domain.domainName,
    registrar: domain.registrar,
    keyword: domain.keyword,
    city: domain.city,
    state: domain.state,
    country: domain.country,
    purchasePrice: domain.purchasePrice,
    estimatedPrice: domain.estimatedPrice,
    askingPrice: domain.askingPrice,
    flipScore: domain.flipScore,
    status: domain.status,
    purchaseDate: domain.purchaseDate,
    expirationDate: domain.expirationDate,
    renewalDate: domain.renewalDate,
    autoRenew: domain.autoRenew,
    nameservers: domain.nameservers,
    afternicCheckoutLink: domain.afternicCheckoutLink,
    landingPageUrl: domain.landingPageUrl,
    description: domain.description,
  }
  const patch: DomainPatchInput = {}
  for (const key of Object.keys(values) as (keyof DomainCreateInput)[]) {
    if (JSON.stringify(values[key]) !== JSON.stringify(comparable[key])) {
      Object.assign(patch, { [key]: values[key] })
    }
  }
  return patch
}

export function DomainForm({
  mode,
  role,
  domain,
}: {
  mode: 'create' | 'edit'
  role: UserRole
  domain?: Domain
}) {
  const router = useRouter()
  const { beginLoading } = useLoading()
  const { toast } = useToast()
  const { beginNavigation } = useProgress()
  const [serverError, setServerError] = useState<string | null>(null)
  const operator = role === 'operator'
  const form = useForm<DomainCreateInput>({
    resolver: zodResolver(domainCreateSchema) as Resolver<DomainCreateInput>,
    defaultValues: defaults(domain),
  })

  const submit = async (values: DomainCreateInput) => {
    setServerError(null)
    const operation = beginLoading({
      message: mode === 'create' ? 'Creating domain...' : 'Updating domain...',
    })
    try {
      const saved =
        mode === 'create'
          ? await domainService.create(values)
          : await domainService.update(
              domain!.id,
              changedPatch(domain!, values)
            )
      toast({
        variant: 'success',
        message: mode === 'create' ? 'Domain created.' : 'Domain updated.',
        dedupeKey: `${mode}-domain-${saved.id}`,
      })
      beginNavigation('Loading domain...')
      router.push(`/admin/domains/${saved.id}`)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'The domain could not be saved.'
      setServerError(message)
      toast({ variant: 'error', message: 'The domain could not be saved.' })
    } finally {
      operation.finish()
    }
  }

  const errors = form.formState.errors
  const statuses =
    operator && domain
      ? [domain.status, ...getOperatorStatusTransitions(domain.status)]
      : (['opportunity', 'active', 'sold', 'expired', 'archived'] as const)

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
        {!operator && (
          <Field label="Domain name" error={errors.domainName?.message}>
            <input
              {...form.register('domainName')}
              className={inputClass}
              placeholder="example.com"
            />
          </Field>
        )}
        {!operator && (
          <Field label="Registrar" error={errors.registrar?.message}>
            <input {...form.register('registrar')} className={inputClass} />
          </Field>
        )}
        {!operator && (
          <Field label="Keyword" error={errors.keyword?.message}>
            <input {...form.register('keyword')} className={inputClass} />
          </Field>
        )}
        {!operator && (
          <Field label="City" error={errors.city?.message}>
            <input {...form.register('city')} className={inputClass} />
          </Field>
        )}
        {!operator && (
          <Field label="State" error={errors.state?.message}>
            <input {...form.register('state')} className={inputClass} />
          </Field>
        )}
        {!operator && (
          <Field label="Country" error={errors.country?.message}>
            <input {...form.register('country')} className={inputClass} />
          </Field>
        )}
        <Field label="Status" error={errors.status?.message}>
          <select
            {...form.register('status')}
            className={`${inputClass} dark:bg-gray-900`}
          >
            {Array.from(new Set(statuses)).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
        {!operator && (
          <Field label="Purchase price" error={errors.purchasePrice?.message}>
            <input
              {...form.register('purchasePrice')}
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
            />
          </Field>
        )}
        <Field label="Estimated price" error={errors.estimatedPrice?.message}>
          <input
            {...form.register('estimatedPrice')}
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
          />
        </Field>
        <Field label="Asking price" error={errors.askingPrice?.message}>
          <input
            {...form.register('askingPrice')}
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
          />
        </Field>
        {!operator && (
          <Field label="FlipScore" error={errors.flipScore?.message}>
            <input
              {...form.register('flipScore')}
              type="number"
              min="0"
              max="100"
              className={inputClass}
            />
          </Field>
        )}
        {!operator && (
          <Field label="Purchase date" error={errors.purchaseDate?.message}>
            <input
              {...form.register('purchaseDate')}
              type="date"
              className={inputClass}
            />
          </Field>
        )}
        {!operator && (
          <Field label="Expiration date" error={errors.expirationDate?.message}>
            <input
              {...form.register('expirationDate')}
              type="date"
              className={inputClass}
            />
          </Field>
        )}
        {!operator && (
          <Field label="Renewal date" error={errors.renewalDate?.message}>
            <input
              {...form.register('renewalDate')}
              type="date"
              className={inputClass}
            />
          </Field>
        )}
        {!operator && (
          <label className="flex items-center gap-2 self-end pb-2">
            <input {...form.register('autoRenew')} type="checkbox" /> Auto-renew
          </label>
        )}
        {!operator && (
          <Field
            label="Afternic checkout URL"
            error={errors.afternicCheckoutLink?.message}
          >
            <input
              {...form.register('afternicCheckoutLink')}
              type="url"
              className={inputClass}
            />
          </Field>
        )}
        {!operator && (
          <Field
            label="Landing page URL"
            error={errors.landingPageUrl?.message}
          >
            <input
              {...form.register('landingPageUrl')}
              type="url"
              className={inputClass}
            />
          </Field>
        )}
        {!operator && (
          <Field
            label="Nameservers"
            error={errors.nameservers?.message as string | undefined}
          >
            <Controller
              control={form.control}
              name="nameservers"
              render={({ field }) => (
                <textarea
                  value={(field.value ?? []).join('\n')}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value
                        .split(/[,\n]/)
                        .map((item) => item.trim())
                        .filter(Boolean)
                    )
                  }
                  className={inputClass}
                  rows={3}
                  placeholder="ns1.example.com"
                />
              )}
            />
          </Field>
        )}
        <Field label="Description" error={errors.description?.message}>
          <textarea
            {...form.register('description')}
            className={inputClass}
            rows={4}
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
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {form.formState.isSubmitting && <Spinner />}
          {form.formState.isSubmitting
            ? mode === 'create'
              ? 'Creating...'
              : 'Saving...'
            : mode === 'create'
              ? 'Create domain'
              : 'Save changes'}
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
