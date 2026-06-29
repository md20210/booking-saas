'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy')
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Auto sign in after successful registration
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed, redirect to login
        router.push('/login?registered=true')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignUp() {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (err) {
      setError('Google sign-up failed')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-[400px]">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Link href="/" className="flex items-center gap-2">
          <Calendar className="w-10 h-10 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">CalendarPro</span>
        </Link>
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Create your account
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Start scheduling smarter today
      </p>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white"
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
              placeholder="Min. 8 characters"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Must be at least 8 characters long
          </p>
        </div>

        {/* Terms Acceptance */}
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 flex-shrink-0"
          />
          <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
            I agree to the{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* Sign Up Button */}
        <button
          type="submit"
          disabled={loading || !termsAccepted}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">or</span>
        </div>
      </div>

      {/* Google Sign Up */}
      <button
        onClick={handleGoogleSignUp}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg border-2 border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign up with Google
      </button>

      {/* Sign In Link */}
      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
          Sign in
        </Link>
      </p>

      {/* Trust Badge */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Free 14-day trial • No credit card required</span>
        </div>
      </div>
    </div>
  )
}
