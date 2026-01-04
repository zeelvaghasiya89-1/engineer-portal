'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    return (
        <div className="flex h-screen w-full flex-row bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
            {/* Sidebar */}
            <aside className="w-72 bg-[#111318] border-r border-border-dark flex flex-col shrink-0">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 aspect-square rounded-xl size-10 flex items-center justify-center shadow-lg shadow-blue-900/20">
                            <span className="material-symbols-outlined text-white text-[20px]">school</span>
                        </div>
                        <h1 className="text-white text-lg font-bold tracking-tight">EngHub Admin</h1>
                    </div>
                </div>
                <nav className="flex flex-col gap-2 px-4 mt-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg text-text-secondary hover:text-white hover:bg-surface-dark transition-colors group">
                        <span className="material-symbols-outlined group-hover:text-white">arrow_back</span>
                        <span className="text-sm font-medium">Back to Student View</span>
                    </Link>

                    <div className="pt-4 mt-2 border-t border-gray-800">
                        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Management</p>
                        <Link href="/admin/manage" className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${isActive('/admin/manage') ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                            <span className="material-symbols-outlined">folder_open</span>
                            <span className="text-sm font-medium">Manage Files</span>
                        </Link>
                        <Link href="/admin/upload" className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${isActive('/admin/upload') ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                            <span className="material-symbols-outlined">upload_file</span>
                            <span className="text-sm font-medium">Upload Resource</span>
                        </Link>
                    </div>
                </nav>

                <div className="mt-auto p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">admin_panel_settings</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold text-white">Administrator</p>
                            <p className="text-xs text-gray-500">Super User</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {children}
            </main>
        </div>
    )
}
