'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Upload, Layers, LogOut, GraduationCap, X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const links = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/manage', label: 'All Resources', icon: FileText },
        { href: '/admin/upload', label: 'Upload New', icon: Upload },
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
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#11161D] border-b border-gray-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-white">
                    <GraduationCap className="text-blue-500" />
                    <span>Admin Panel</span>
                </div>
                <button onClick={toggleMobileMenu} className="text-white">
                    {isMobileMenuOpen ? <X /> : <LayoutDashboard />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/80 z-40" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#11161D] border-r border-gray-800 flex flex-col transition-transform duration-300
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static'}
            `}>
                <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                    <div className="bg-blue-600 size-8 rounded-lg flex items-center justify-center">
                        <GraduationCap className="text-white size-5" />
                    </div>
                    <span className="font-bold text-white text-lg">Admin Panel</span>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {links.map(link => {
                        const bgClass = pathname === link.href
                            ? 'bg-blue-600/10 text-blue-400 border-blue-600/20'
                            : 'text-gray-400 border-transparent hover:bg-gray-800 hover:text-white';

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all font-medium text-sm ${bgClass}`}
                            >
                                <link.icon size={18} />
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div className="mb-4 px-4 py-3 bg-[#0B0E14] rounded-lg border border-gray-800">
                        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                            &larr; Return to Student View
                        </Link>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    )
}
