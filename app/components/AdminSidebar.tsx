'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Upload, Layers, LogOut, GraduationCap, X, Settings, PieChart } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [adminName, setAdminName] = useState('')
    const [adminEmail, setAdminEmail] = useState('')

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setAdminEmail(user.email || '')
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single()
                if (profile) setAdminName(profile.full_name)
            }
        }
        fetchUser()
    }, [])

    const links = [
        { href: '/admin/dashboard', label: 'Dashboard Overview', icon: PieChart },
        { href: '/admin/manage', label: 'Manage Files', icon: FileText },
        { href: '/admin/upload', label: 'Upload Resource', icon: Upload },
        { href: '/admin/branches', label: 'Manage Branches', icon: Layers },
    ]

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

    return (
        <>
            {/* Mobile Header Toggle */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#111318] border-b border-[#282e39] p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-white">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 size-8 rounded-lg flex items-center justify-center">
                        <GraduationCap className="text-white size-5" />
                    </div>
                    <span>EngHub Admin</span>
                </div>
                <button onClick={toggleMobileMenu} className="text-white p-2">
                    {isMobileMenuOpen ? <X /> : <LayoutDashboard />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#111318] border-r border-[#282e39] flex flex-col transition-transform duration-300
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static'}
            `}>
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 size-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                            <GraduationCap className="text-white size-5" />
                        </div>
                        <h1 className="text-white text-lg font-bold tracking-tight">EngHub Admin</h1>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 px-4 mt-2 flex-1">
                    {links.map(link => {
                        const isActive = pathname === link.href
                        const bgClass = isActive
                            ? 'bg-[#135bec] text-white shadow-md shadow-blue-900/20'
                            : 'text-[#9da6b9] hover:bg-[#1a1d24] hover:text-white'

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium text-sm ${bgClass}`}
                            >
                                <link.icon size={20} />
                                {link.label}
                            </Link>
                        )
                    })}

                    <div className="pt-4 mt-2 border-t border-[#282e39]/50">
                        <p className="px-3 text-xs font-semibold text-[#9da6b9] uppercase tracking-wider mb-2">System</p>
                        <Link
                            href="#"
                            className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#9da6b9] hover:bg-[#1a1d24] hover:text-white transition-colors font-medium text-sm"
                        >
                            <Settings size={20} />
                            Settings
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-[#282e39]">
                    <div className="mb-4 px-3 py-3 bg-[#0B0E14] rounded-lg border border-[#282e39]">
                        <Link href="/dashboard" className="text-sm text-[#9da6b9] hover:text-white flex items-center gap-2 transition-colors">
                            &larr; Return to Student View
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 mb-4 px-1">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full size-10 flex items-center justify-center text-white text-sm font-semibold">
                            {adminName ? adminName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{adminName || 'Admin'}</p>
                            <p className="text-xs text-[#9da6b9] truncate">{adminEmail || 'admin@enghub.edu'}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                    >
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </aside>
        </>
    )
}
