'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { getAuthenticationErrorMessage } from '@/lib/auth/errors'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { registerUser } from '@/services/auth.service'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    setError(null)
    try {
      await registerUser(data)
      router.push('/login')
    } catch (error: unknown) {
      setError(getAuthenticationErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 transition-colors dark:bg-gray-900">
      <div className="w-full max-w-[400px] space-y-6 rounded-xl border bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Register</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Creer compte jdid f Wabmarket
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <input
              {...form.register('name')}
              autoComplete="name"
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              placeholder="Name"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <input
              {...form.register('email')}
              autoComplete="email"
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              placeholder="Email"
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <input
              {...form.register('password')}
              type="password"
              autoComplete="new-password"
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              placeholder="Password"
            />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <input
              {...form.register('confirmPassword')}
              type="password"
              autoComplete="new-password"
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              placeholder="Confirm password"
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && <p className="text-center text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-black p-3 text-sm text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {isLoading ? 'Kan Creew l compte...' : 'Register'}
          </button>
        </form>

        <div className="text-center text-sm">
          Deja 3andk compte?{' '}
          <Link
            href="/login"
            className="font-semibold underline hover:text-blue-500"
          >
            Dkhol hna
          </Link>
        </div>
      </div>
    </div>
  )
}
