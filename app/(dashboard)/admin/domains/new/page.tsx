'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useAuth } from '@/hooks/use-auth'
import { domainSchema, type DomainInput } from '@/lib/validations'
import { domainService } from '@/services/domain.service'

export default function NewDomainPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DomainInput>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      domainName: '',
      registrar: 'Dynadot',
      keyword: '',
      city: '',
      country: '',
      purchasePrice: 0,
      estimatedPrice: 0,
      askingPrice: 0,
      flipScore: 0,
      status: 'active',
    },
  })

  const onSubmit = async (data: DomainInput) => {
    if (!user) {
      setServerError('You must be logged in.')
      return
    }

    setServerError(null)

    try {
      const now = new Date()

      await domainService.createDomain(user.uid, {
        domainName: data.domainName,
        registrar: data.registrar || undefined,
        keyword: data.keyword || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        purchasePrice: data.purchasePrice,
        estimatedPrice: data.estimatedPrice,
        askingPrice: data.askingPrice,
        flipScore: data.flipScore,
        status: data.status,
        autoRenew: false,
        nameservers: [],
        createdAt: now,
        updatedAt: now,
      })

      router.push('/admin/domains')
      router.refresh()
    } catch (error) {
      console.error('Failed to create domain:', error)
      setServerError(
        'The domain could not be saved. Check Firestore rules and try again.'
      )
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add owned domain</h1>

        <p className="mt-1 text-sm text-gray-500">
          Add a domain manually to your Wabmarket portfolio.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Domain name" error={errors.domainName?.message}>
            <input
              {...register('domainName')}
              placeholder="example.com"
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700"
            />
          </FormField>

          <FormField label="Registrar" error={errors.registrar?.message}>
            <input
              {...register('registrar')}
              placeholder="Dynadot"
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700"
            />
          </FormField>

          <FormField label="Keyword" error={errors.keyword?.message}>
            <input
              {...register('keyword')}
              placeholder="roofing"
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700"
            />
          </FormField>

          <FormField label="City" error={errors.city?.message}>
            <input
              {...register('city')}
              placeholder="Miami"
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700"
            />
          </FormField>

          <FormField label="Country" error={errors.country?.message}>
            <input
              {...register('country')}
              placeholder="United States"
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700"
            />
          </FormField>

          <FormField label="Status" error={errors.status?.message}>
            <select
              {...register('status')}
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="opportunity">Opportunity</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="expired">Expired</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>

          <FormField
            label="Purchase price"
            error={errors.purchasePrice?.message}
          >
            <input
              {...register('purchasePrice')}
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700"
            />
          </FormField>

          <FormField
            label="Estimated price"
            error={errors.estimatedPrice?.message}
          >
            <input
              {...register('estimatedPrice')}
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700"
            />
          </FormField>

          <FormField label="Asking price" error={errors.askingPrice?.message}>
            <input
              {...register('askingPrice')}
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700"
            />
          </FormField>

          <FormField label="FlipScore" error={errors.flipScore?.message}>
            <input
              {...register('flipScore')}
              type="number"
              min="0"
              max="100"
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700"
            />
          </FormField>
        </div>

        {serverError && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
            {serverError}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {isSubmitting ? 'Saving...' : 'Save domain'}
          </button>
        </div>
      </form>
    </div>
  )
}

function FormField({
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
