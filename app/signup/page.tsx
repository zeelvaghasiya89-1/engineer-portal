'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 1. Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            })

            if (authError) throw authError

            if (authData.user) {
                // 2. Create Profile (Optional: Trigger usually handles this, but we can be safe)
                // If you have a Trigger in Supabase to create a profile on auth.users insert, you can skip this.
                // Assuming we might need to verify or handle manual insertion if trigger fails or doesn't exist.
                // For now, let's assume the Trigger exists as per standard Supabase patterns, 
                // but if not, we would insert into 'profiles' here.

                // Let's redirect to login with a success message or directly to dashboard if email confirmation isn't required.
                // If email confirmation is off:
                router.push('/dashboard')
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Create an Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join the Engineering Portal
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="full-name" className="sr-only">
                                Full Name
                            </label>
                            <input
                                id="full-name"
                                name="full-name"
                                type="text"
                                required
                                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70"
                        >
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                {loading && <Loader2 className="h-5 w-5 animate-spin text-indigo-300" />}
                            </span>
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-gray-500">Already have an account? </span>
                        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
