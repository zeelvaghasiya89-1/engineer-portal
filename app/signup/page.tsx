'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
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
                // 2. Create Profile explicit to ensure it exists
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        full_name: fullName,
                        role: 'student',
                        email: email
                    })

                if (profileError) {
                    console.error('Profile creation error:', profileError)
                }

                router.push('/dashboard')
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Password strength indicator
    const getPasswordStrength = () => {
        if (password.length === 0) return { strength: 0, label: '', color: '' }
        if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' }
        if (password.length < 8) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' }
        if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
            return { strength: 4, label: 'Strong', color: 'bg-green-500' }
        }
        return { strength: 3, label: 'Good', color: 'bg-blue-500' }
    }

    const passwordStrength = getPasswordStrength()

    return (
        <div className="flex min-h-screen bg-[#0b0d11] text-white">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-[#111318]">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#135bec]/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-[80px]"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-lg px-8">
                    <h3 className="text-3xl font-bold text-white mb-6">
                        Join the community
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 size-6 rounded-full bg-[#135bec]/20 text-[#135bec] flex items-center justify-center mt-0.5">
                                <Check className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Access all resources</h4>
                                <p className="text-sm text-[#9da6b9]">Notes, papers, lab manuals, and books</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 size-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mt-0.5">
                                <Check className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Download anytime</h4>
                                <p className="text-sm text-[#9da6b9]">Save resources for offline study</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 size-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mt-0.5">
                                <Check className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Contribute to the community</h4>
                                <p className="text-sm text-[#9da6b9]">Upload your notes and help others</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
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
                            Create an account
                        </h2>
                        <p className="mt-2 text-[#9da6b9]">
                            Start your journey with EngineerHub
                        </p>
                    </div>

                    <form className="mt-8 space-y-5" onSubmit={handleSignUp}>
                        <div className="space-y-4">
                            {/* Full Name Field */}
                            <div>
                                <label htmlFor="full-name" className="block text-sm font-medium text-[#9da6b9] mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-[#9da6b9]" />
                                    </div>
                                    <input
                                        id="full-name"
                                        name="full-name"
                                        type="text"
                                        required
                                        className="block w-full rounded-lg bg-[#1a1d24] border border-[#282e39] pl-10 pr-4 py-3 text-white placeholder:text-[#9da6b9] focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] outline-none transition-all"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                            </div>

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
                                {/* Password Strength */}
                                {password.length > 0 && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 h-1">
                                            {[1, 2, 3, 4].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`flex-1 rounded-full ${level <= passwordStrength.strength ? passwordStrength.color : 'bg-[#282e39]'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-xs mt-1 ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                            {passwordStrength.label}
                                        </p>
                                    </div>
                                )}
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
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>

                        <p className="text-xs text-center text-[#9da6b9]">
                            By signing up, you agree to our{' '}
                            <Link href="#" className="text-[#135bec] hover:underline">Terms of Service</Link>
                            {' '}and{' '}
                            <Link href="#" className="text-[#135bec] hover:underline">Privacy Policy</Link>
                        </p>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#282e39]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-[#0b0d11] text-[#9da6b9]">or</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <span className="text-[#9da6b9]">Already have an account? </span>
                            <Link href="/login" className="font-semibold text-[#135bec] hover:text-blue-400 transition-colors">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
