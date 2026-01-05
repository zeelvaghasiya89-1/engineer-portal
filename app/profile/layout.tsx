'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { User, LogOut, Search, Bell, Home, FolderOpen, Shield, History, CloudUpload, Menu, X, Edit2 } from 'lucide-react'

type Profile = {
    id: string
    full_name: string
    branch: string
    role: string
    email?: string
}

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [uploadCount, setUploadCount] = useState(0)

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (data) {
                setProfile({ ...data, email: user.email })
            }

            // Fetch upload count
            const { count } = await supabase
                .from('resources')
                .select('*', { count: 'exact', head: true })
                .eq('uploaded_by', user.id)

            if (count) setUploadCount(count)
        }
        fetchProfile()
    }, [router])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const isActive = (path: string) => pathname === path

    return (
        <div className="bg-[#101622] text-white min-h-screen flex flex-col font-sans">
            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-[#282e39] bg-[#1C2333] px-4 sm:px-6 py-3 sticky top-0 z-50">
                <div className="flex items-center gap-4 sm:gap-8">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white"
                    >
                        <Menu size={24} />
                    </button>
                    <Link href="/dashboard" className="flex items-center gap-2 sm:gap-4 text-white">
                        <div className="size-8 text-[#135bec]">
                            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"></path>
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-tight hidden sm:block">EngineerHub</h2>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center ring-2 ring-[#282e39]">
                        <User className="w-5 h-5 text-white" />
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content Layout */}
            <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* LEFT COLUMN: Sidebar */}
                    <aside className={`
                        fixed lg:static inset-y-0 left-0 w-80 flex-shrink-0 flex flex-col gap-6 z-50
                        bg-[#101622] lg:bg-transparent p-4 lg:p-0 overflow-y-auto
                        transition-transform duration-300 ease-in-out
                        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}>
                        <div className="lg:hidden flex items-center justify-between mb-4">
                            <span className="font-bold text-white">Profile Menu</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        {/* Profile Identity Card */}
                        <div className="bg-[#1C2333] rounded-xl p-6 shadow-sm border border-[#282e39] flex flex-col items-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-[#135bec] opacity-30"></div>
                            <div className="relative mt-8 group cursor-pointer">
                                <div className="size-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center border-4 border-[#1C2333] shadow-md">
                                    <User className="w-12 h-12 text-white" />
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <h1 className="text-xl font-bold text-white">{profile?.full_name || 'Loading...'}</h1>
                                <p className="text-sm text-[#9da6b9]">{profile?.branch || 'Engineering'} Student</p>
                                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#135bec]/10 text-[#135bec] text-xs font-semibold">
                                    <span className="material-symbols-outlined text-[16px]">school</span>
                                    {profile?.role === 'admin' ? 'Administrator' : 'Student'}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full mt-6 pt-6 border-t border-[#282e39]">
                                <div className="flex flex-col items-center p-2 rounded-lg hover:bg-[#282e39]/50 transition-colors">
                                    <span className="text-lg font-bold text-white">{uploadCount}</span>
                                    <span className="text-xs text-[#9da6b9]">Uploads</span>
                                </div>
                                <div className="flex flex-col items-center p-2 rounded-lg hover:bg-[#282e39]/50 transition-colors">
                                    <span className="text-lg font-bold text-white">450</span>
                                    <span className="text-xs text-[#9da6b9]">Reputation</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="bg-[#1C2333] rounded-xl p-3 shadow-sm border border-[#282e39]">
                            <ul className="flex flex-col gap-1">
                                <li>
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/profile') ? 'bg-[#135bec] text-white' : 'text-[#9da6b9] hover:bg-[#282e39]'}`}
                                    >
                                        <Home className="w-5 h-5" />
                                        Overview
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/profile/activity"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/profile/activity') ? 'bg-[#135bec] text-white' : 'text-[#9da6b9] hover:bg-[#282e39]'}`}
                                    >
                                        <History className="w-5 h-5" />
                                        Activity Log
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        <div className="bg-gradient-to-br from-[#135bec] to-blue-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden hidden lg:block">
                            <CloudUpload className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
                            <h3 className="font-bold text-lg mb-1">Contribute More!</h3>
                            <p className="text-sm text-blue-100 mb-4">Upload verified notes to earn reputation badges.</p>
                            <Link href={profile?.role === 'admin' ? '/admin/upload' : '/dashboard'} className="block w-full py-2 bg-white text-[#135bec] text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm text-center">
                                Upload Resource
                            </Link>
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="flex-1 flex flex-col gap-6 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
