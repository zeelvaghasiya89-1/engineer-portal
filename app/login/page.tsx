'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                throw error
            }

            router.refresh()
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-[#0b0d11] text-white">
            {/* Left Side - Form */}
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
                        <h2 className="text-3xl font-bold tracking-tight text-white">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-[#9da6b9]">
                            Sign in to access your engineering resources
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            {/* Email Field */}
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

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-[#9da6b9] mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-[#9da6b9]" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="block w-full rounded-lg bg-[#1a1d24] border border-[#282e39] pl-10 pr-12 py-3 text-white placeholder:text-[#9da6b9] focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] outline-none transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9da6b9] hover:text-white transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="flex items-center justify-end">
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-[#135bec] hover:text-blue-400 transition-colors"
                            >
                                Forgot your password?
                            </Link>
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
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#282e39]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-[#0b0d11] text-[#9da6b9]">or</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <span className="text-[#9da6b9]">Don't have an account? </span>
                            <Link href="/signup" className="font-semibold text-[#135bec] hover:text-blue-400 transition-colors">
                                Sign up for free
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Side - Decorative */}
            <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-[#111318]">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#135bec]/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[80px]"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-lg text-center px-8">
                    <div className="mb-6">
                        <span className="material-symbols-outlined text-[80px] text-[#135bec]">school</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                        Access 500+ Engineering Resources
                    </h3>
                    <p className="text-[#9da6b9] leading-relaxed">
                        Notes, past papers, lab manuals, and more. Everything you need to excel in your engineering studies.
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <div className="flex -space-x-3">
                            <div className="size-10 rounded-full bg-blue-500 border-2 border-[#111318] flex items-center justify-center text-white text-sm font-bold">A</div>
                            <div className="size-10 rounded-full bg-purple-500 border-2 border-[#111318] flex items-center justify-center text-white text-sm font-bold">B</div>
                            <div className="size-10 rounded-full bg-emerald-500 border-2 border-[#111318] flex items-center justify-center text-white text-sm font-bold">C</div>
                        </div>
                        <span className="text-sm text-[#9da6b9]">Join 1000+ students</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
