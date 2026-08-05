'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { registerUser } from '@/services/auth.service'

// Validation schema using Zod, enforcing password policy[cite: 5, 12]
const registerSchema = z.object({
  email: z.string().email({ message: "L'email machi s7i7" }),
  password: z.string().min(12, {
    message: "L'password khasso ykoun fih 12 characters 3la l2a9al",
  }),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      await registerUser(data.email, data.password)
      router.push('/login')
    } catch (err: any) {
      console.error(err)
      setError('Registration failed. 7awel marra khra.')
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
              {...form.register('email')}
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
              className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
              placeholder="Password"
            />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">
                {form.formState.errors.password.message}
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
