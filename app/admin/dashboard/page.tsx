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
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                    <p className="text-gray-400">Welcome back, Admin. Here's what's happening today.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <div className="bg-[#11161D] border border-gray-800 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FileText size={100} />
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                                <FileText size={24} />
                            </div>
                            <span className="text-xs font-semibold bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20">Live</span>
                        </div>
                        <h3 className="text-4xl font-bold text-white mb-1 relative z-10">{stats.totalResources}</h3>
                        <p className="text-gray-400 text-sm relative z-10">Total Resources</p>
                    </div>

                    <div className="bg-[#11161D] border border-gray-800 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={100} />
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-500">
                                <Users size={24} />
                            </div>
                            <span className="text-xs font-semibold bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20">Active</span>
                        </div>
                        <h3 className="text-4xl font-bold text-white mb-1 relative z-10">{stats.totalUsers}</h3>
                        <p className="text-gray-400 text-sm relative z-10">Registered Students</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/20 p-6 rounded-xl shadow-lg flex flex-col justify-center items-center text-center">
                        <Link href="/admin/upload" className="w-full">
                            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mb-2">
                                <Upload size={20} />
                                Upload New Resource
                            </button>
                        </Link>
                        <p className="text-blue-200/60 text-xs">Fast track upload</p>
                    </div>
                </div>

                <div className="bg-[#11161D] border border-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-[#161B22]">
                        <h3 className="font-bold text-lg text-white">Recent Uploads</h3>
                        <Link href="/admin/manage" className="text-sm text-blue-400 hover:text-blue-300 hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-[#0B0E14] text-xs uppercase text-gray-400 font-semibold border-b border-gray-800">
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Subject Code</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading data...</td></tr>
                                ) : stats.recentUploads.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No uploads yet.</td></tr>
                                ) : (
                                    stats.recentUploads.map((file) => (
                                        <tr key={file.id} className="hover:bg-[#1C2128] transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-200 max-w-xs truncate">{file.title}</td>
                                            <td className="px-6 py-4 text-gray-400">{file.subject_code}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] px-2 py-1 rounded font-mono ${file.type === 'Notes' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'}`}>
                                                    {file.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">{new Date(file.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <a href={file.file_url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors inline-block p-2 hover:bg-gray-700 rounded-lg">
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
        </div>
    )
}
