'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Types
type Resource = {
    id: string
    title: string
    branch: string
    semester: number
    subject_code: string
    type: string
    file_url: string
    uploaded_by: string
}

type Profile = {
    id: string
    full_name: string
    branch: string
    semester: number
    role: string
}

export default function Dashboard() {
    const router = useRouter()
    const [userProfile, setUserProfile] = useState<Profile | null>(null)
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [selectedBranch, setSelectedBranch] = useState<string>('')
    const [selectedSemester, setSelectedSemester] = useState<number | ''>('')
    const [selectedType, setSelectedType] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch Logic
    useEffect(() => {
        const init = async () => {
            // 1. Get User
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // 2. Get Profile only if user exists
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    setUserProfile(profile)
                    // Smart Filter Defaults (only if user logged in with defaults)
                    if (selectedBranch === '') setSelectedBranch(profile.branch || '')
                    if (selectedSemester === '') setSelectedSemester(profile.semester || '')
                }
            }

            fetchResources()
        }

        init()
    }, [])

    // Refetch when filters change
    useEffect(() => {
        fetchResources()
    }, [selectedBranch, selectedSemester, selectedType, searchQuery])

    const fetchResources = async () => {
        setLoading(true)
        let query = supabase.from('resources').select('*')

        if (selectedBranch) query = query.eq('branch', selectedBranch)
        if (selectedSemester) query = query.eq('semester', selectedSemester)
        if (selectedType) query = query.eq('type', selectedType)

        // For Search, we do client-side or simple ILIKE
        if (searchQuery) {
            // search title or subject_code
            // Supabase's 'or' syntax: .or(`title.ilike.%${q}%,subject_code.ilike.%${q}%`)
            query = query.or(`title.ilike.%${searchQuery}%,subject_code.ilike.%${searchQuery}%`)
        }

        const { data, error } = await query
        if (data) setResources(data)
        setLoading(false)
    }

    const handleDownload = (url: string) => {
        window.open(url, '_blank')
    }

    // Helper for semesters
    const semesters = [1, 2, 3, 4, 5, 6, 7, 8]
    const branches = ['Computer Science', 'Mechanical', 'Civil', 'Electrical', 'Electronics']
    const types = ['Notes', 'Papers', 'Labs', 'Books']

    return (
        <div className="flex h-screen bg-background-dark overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 border-r border-border-dark bg-background-dark flex flex-col overflow-y-auto custom-scrollbar pb-6 p-4">
                {/* Branch Filter */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Branch</h3>
                    <div className="space-y-1">
                        {branches.map(branch => (
                            <label key={branch} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                                <input
                                    type="radio"
                                    name="branch"
                                    checked={selectedBranch === branch}
                                    onChange={() => setSelectedBranch(branch)}
                                    className="bg-transparent border-gray-600 text-primary focus:ring-0 checked:bg-primary"
                                />
                                <span className="text-sm text-gray-300">{branch}</span>
                            </label>
                        ))}
                        <button onClick={() => setSelectedBranch('')} className="text-xs text-primary mt-2 hover:underline pl-2">Clear Branch</button>
                    </div>
                </div>

                {/* Semester Filter */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Semester</h3>
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-surface-dark border border-border-dark rounded-lg text-sm text-white p-2"
                    >
                        <option value="">All Semesters</option>
                        {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                </div>

                {/* Type Filter */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Type</h3>
                    <div className="flex flex-wrap gap-2">
                        {types.map(t => (
                            <button
                                key={t}
                                onClick={() => setSelectedType(selectedType === t ? '' : t)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedType === t ? 'bg-primary text-white border-primary' : 'bg-surface-dark text-gray-400 border-border-dark hover:text-white'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-black/20">
                {/* Header (Search & Profile) */}
                <header className="h-16 border-b border-border-dark flex items-center justify-between px-6 bg-background-dark z-10">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400">search</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Search resources..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full rounded-lg bg-surface-dark border-transparent text-gray-300 placeholder-gray-500 focus:bg-white/10 focus:border-primary focus:ring-0 sm:text-sm pl-10 py-2 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {userProfile ? (
                            <>
                                {userProfile.role === 'admin' && (
                                    <Link href="/admin/dashboard">
                                        <button className="hidden sm:flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                                            Admin
                                        </button>
                                    </Link>
                                )}
                                <Link href="/profile">
                                    <div className="size-9 rounded-full bg-gray-700 flex items-center justify-center text-white ring-2 ring-border-dark hover:ring-primary cursor-pointer" title={userProfile.full_name}>
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                </Link>
                            </>
                        ) : (
                            <Link href="/login">
                                <button className="flex items-center gap-2 bg-surface-dark hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-border-dark">
                                    Log In
                                </button>
                            </Link>
                        )}
                    </div>
                </header>

                {/* Resource Feed */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-white">
                                {selectedBranch ? `${selectedBranch} Engineering` : 'All Resources'}
                                {selectedSemester ? ` - Semester ${selectedSemester}` : ''}
                            </h1>
                            <span className="text-gray-400 text-sm">{resources.length} resources found</span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-64 text-gray-500">Loading resources...</div>
                        ) : resources.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">folder_off</span>
                                <p>No resources found matching your filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {resources.map(res => (
                                    <div key={res.id} className="group bg-surface-dark border border-border-dark rounded-xl p-4 hover:border-primary/50 hover:shadow-lg transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`size-10 rounded-lg flex items-center justify-center ${res.type === 'Notes' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                                <span className="material-symbols-outlined">description</span>
                                            </div>
                                            <button onClick={() => handleDownload(res.file_url)} className="text-gray-400 hover:text-white pb-1">
                                                <span className="material-symbols-outlined">download</span>
                                            </button>
                                        </div>
                                        <h3 className="text-white font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">{res.title}</h3>
                                        <p className="text-gray-500 text-xs mb-4">{res.subject_code}</p>
                                        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/5">
                                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-300 font-mono">{res.type} </span>
                                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-300 font-mono">Sem {res.semester}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
