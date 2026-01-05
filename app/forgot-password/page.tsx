'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) throw error

            setSuccess(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-[#0b0d11] text-white">
            <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo */}
                    <div className="text-center">
                        <Link href="/" className="inline-flex items-center gap-3 mb-8">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#135bec] text-white">
                                <span className="material-symbols-outlined text-[22px]">hub</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight">EngineerHub</span>
                        </Link>

                        {success ? (
                            <>
                                <div className="flex justify-center mb-4">
                                    <div className="size-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight text-white">
                                    Check your email
                                </h2>
                                <p className="mt-2 text-[#9da6b9]">
                                    We've sent a password reset link to <span className="text-white font-medium">{email}</span>
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold tracking-tight text-white">
                                    Forgot password?
                                </h2>
                                <p className="mt-2 text-[#9da6b9]">
                                    No worries, we'll send you reset instructions.
                                </p>
                            </>
                        )}
                    </div>

                    {success ? (
                        <div className="space-y-4">
                            <Link
                                href="/login"
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#135bec] hover:bg-[#1d66f0] px-4 py-3 text-base font-semibold text-white shadow-lg shadow-[#135bec]/20 transition-all"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Back to Sign in
                            </Link>
                            <p className="text-center text-sm text-[#9da6b9]">
                                Didn't receive the email?{' '}
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="text-[#135bec] hover:underline font-medium"
                                >
                                    Click to resend
                                </button>
                            </p>
                        </div>
                    ) : (
                        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                            <div>
                                <label htmlFor="email-address" className="block text-sm font-medium text-[#9da6b9] mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-[#9da6b9]" />
                                    </div>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        required
                                        className="block w-full rounded-lg bg-[#1a1d24] border border-[#282e39] pl-10 pr-4 py-3 text-white placeholder:text-[#9da6b9] focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] outline-none transition-all"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">error</span>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#135bec] hover:bg-[#1d66f0] px-4 py-3 text-base font-semibold text-white shadow-lg shadow-[#135bec]/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Reset password'
                                )}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-sm text-[#9da6b9] hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Sign in
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#135bec]/10 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]"></div>
            </div>
        </div>
    )
}
