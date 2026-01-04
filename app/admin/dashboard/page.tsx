'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Eye, FileText, Upload, Users } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalResources: 0,
        totalUsers: 0,
        recentUploads: [] as any[]
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true)

            // 1. Total Resources
            const { count: resourceCount } = await supabase
                .from('resources')
                .select('*', { count: 'exact', head: true })

            // 2. Total Users (Approximate from profiles)
            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })

            // 3. Recent Uploads
            const { data: recent } = await supabase
                .from('resources')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)

            setStats({
                totalResources: resourceCount || 0,
                totalUsers: userCount || 0,
                recentUploads: recent || []
            })
            setLoading(false)
        }

        fetchStats()
    }, [])

    return (
        <div className="p-8 h-full overflow-y-auto bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-slate-500 mb-8 max-w-2xl">Overview of the Engineering Resource Portal activity.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white dark:bg-[#1C2333] border border-slate-200 dark:border-[#282e39] p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                            <FileText size={24} />
                        </div>
                        <span className="text-xs font-semibold bg-green-500/10 text-green-500 px-2 py-1 rounded">Live</span>
                    </div>
                    <h3 className="text-4xl font-bold mb-1">{stats.totalResources}</h3>
                    <p className="text-slate-500 text-sm">Total Resources</p>
                </div>

                <div className="bg-white dark:bg-[#1C2333] border border-slate-200 dark:border-[#282e39] p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-500">
                            <Users size={24} />
                        </div>
                        <span className="text-xs font-semibold bg-green-500/10 text-green-500 px-2 py-1 rounded">Active</span>
                    </div>
                    <h3 className="text-4xl font-bold mb-1">{stats.totalUsers}</h3>
                    <p className="text-slate-500 text-sm">Registered Students</p>
                </div>

                <div className="bg-white dark:bg-[#1C2333] border border-slate-200 dark:border-[#282e39] p-6 rounded-xl shadow-sm flex flex-col justify-center items-center text-center">
                    <Link href="/admin/upload">
                        <button className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 mb-2">
                            <Upload size={20} />
                            Upload New Resource
                        </button>
                    </Link>
                    <p className="text-slate-500 text-xs">Fast track upload</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1C2333] border border-slate-200 dark:border-[#282e39] rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-[#282e39] flex justify-between items-center">
                    <h3 className="font-bold text-lg">Recent Uploads</h3>
                    <Link href="/admin/manage" className="text-sm text-primary hover:underline">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-[#111318]/50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200 dark:border-[#282e39]">
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Subject Code</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-[#282e39]">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading data...</td></tr>
                            ) : stats.recentUploads.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No uploads yet.</td></tr>
                            ) : (
                                stats.recentUploads.map((file) => (
                                    <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-[#282e39]/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">{file.title}</td>
                                        <td className="px-6 py-4 text-slate-500">{file.subject_code}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] px-2 py-1 rounded font-mono ${file.type === 'Notes' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                                {file.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">{new Date(file.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <a href={file.file_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                                                <Eye size={18} />
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
