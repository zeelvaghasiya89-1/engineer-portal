'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Download, FileText, Video, File, BookOpen, User, LogIn, ChevronDown, Filter, Layers, Book, GraduationCap } from 'lucide-react'

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

    const getBranchColor = (branch: string) => {
        switch (branch) {
            case 'Computer Science': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            case 'Mechanical': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            case 'Civil': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
            case 'Electrical': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            default: return 'bg-gray-800 text-gray-300 border-gray-700'
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Video': return <Video className="w-5 h-5 text-purple-400" />
            case 'Notes': return <FileText className="w-5 h-5 text-blue-400" />
            case 'Books': return <BookOpen className="w-5 h-5 text-green-400" />
            default: return <File className="w-5 h-5 text-gray-400" />
        }
    }

    return (
        <div className="flex h-screen bg-[#0B0E14] text-white overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-72 flex-shrink-0 border-r border-gray-800 bg-[#11161D] flex flex-col overflow-y-auto custom-scrollbar pb-6">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 size-8 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                            <GraduationCap className="text-white size-5" />
                        </div>
                        <h1 className="text-lg font-bold tracking-tight">EngHub</h1>
                    </div>
                </div>

                <div className="p-4 space-y-8">
                    {/* Branch Filter */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <Layers className="size-4 text-blue-500" />
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Branch</h3>
                        </div>

                        <div className="space-y-1">
                            {branches.map(branch => (
                                <button
                                    key={branch}
                                    onClick={() => setSelectedBranch(branch === selectedBranch ? '' : branch)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${selectedBranch === branch ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : 'text-gray-400 border-transparent hover:bg-gray-800 hover:text-gray-200'}`}
                                >
                                    {branch}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Semester Filter */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <Book className="size-4 text-green-500" />
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Semester</h3>
                        </div>
                        <div className="px-1">
                            <div className="relative">
                                <select
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full bg-[#0B0E14] border border-gray-700 rounded-lg py-2.5 px-4 text-sm text-gray-200 outline-none focus:border-blue-500 appearance-none cursor-pointer transition-colors"
                                >
                                    <option value="">All Semesters</option>
                                    {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <Filter className="size-4 text-purple-500" />
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resource Type</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 px-1">
                            {types.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setSelectedType(selectedType === t ? '' : t)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${selectedType === t ? 'bg-white text-black border-white' : 'bg-[#0B0E14] text-gray-400 border-gray-700 hover:border-gray-500'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header (Search & Profile) */}
                <header className="h-20 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0B0E14] z-10 shrink-0">
                    <div className="flex-1 max-w-2xl mr-8">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search, e.g. 'Thermodynamics' or 'ME101'"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full rounded-xl bg-[#11161D] border border-gray-800 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 sm:text-sm pl-12 py-3 transition-all outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {userProfile ? (
                            <>
                                {userProfile.role === 'admin' && (
                                    <Link href="/admin/dashboard">
                                        <button className="hidden sm:flex items-center gap-2 bg-[#1C2333] hover:bg-[#252D3F] border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                            <span>Admin View</span>
                                        </button>
                                    </Link>
                                )}
                                <Link href="/profile">
                                    <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-medium text-white">{userProfile.full_name}</p>
                                            <p className="text-xs text-gray-500 capitalize">{userProfile.role}</p>
                                        </div>
                                        <div className="size-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white ring-2 ring-gray-800 hover:ring-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-500/20">
                                            <User size={20} />
                                        </div>
                                    </div>
                                </Link>
                            </>
                        ) : (
                            <Link href="/login">
                                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20">
                                    <LogIn size={18} />
                                    Sign In
                                </button>
                            </Link>
                        )}
                    </div>
                </header>

                {/* Resource Feed */}
                <div className="flex-1 overflow-y-auto p-8 bg-[#0B0E14]">
                    <div className="max-w-[1600px] mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {selectedBranch ? `${selectedBranch}` : 'All Resources'}
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    {selectedSemester ? `Semester ${selectedSemester} • ` : ''}
                                    Browse and download academic materials.
                                </p>
                            </div>
                            <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                                {resources.length} Result{resources.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-4">
                                <div className="size-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                                <p>Loading library...</p>
                            </div>
                        ) : resources.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="bg-gray-800/50 p-6 rounded-full mb-6">
                                    <Search className="size-12 text-gray-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No resources found</h3>
                                <p className="text-gray-500 max-w-md">
                                    We couldn't find any resources matching your current filters. Try adjusting your search keywords or removing some filters.
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedBranch('');
                                        setSelectedSemester('');
                                        setSelectedType('');
                                        setSearchQuery('');
                                    }}
                                    className="mt-6 text-blue-400 hover:text-blue-300 font-medium text-sm hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {resources.map(res => (
                                    <div key={res.id} className="group flex flex-col bg-[#11161D] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 relative">
                                        <div className="p-5 flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 rounded-xl flex items-center justify-center ${res.type === 'Notes' ? 'bg-blue-500/10 text-blue-400' : res.type === 'Video' ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-800 text-gray-400'}`}>
                                                    {getTypeIcon(res.type)}
                                                </div>
                                                <span className={`text-[10px] px-2 py-1 rounded font-mono border ${getBranchColor(res.branch)}`}>
                                                    Sem {res.semester}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-semibold text-gray-100 line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors h-[3.5rem] leading-tight" title={res.title}>{res.title}</h3>

                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mb-4">
                                                <span className="truncate max-w-[150px]">{res.subject_code}</span>
                                                <span>•</span>
                                                <span>{res.type}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 border-t border-gray-800 bg-gray-900/30 flex items-center justify-between group-hover:bg-gray-800/50 transition-colors">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="truncate max-w-[100px]">By {res.uploaded_by || 'Admin'}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDownload(res.file_url)}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-gray-800 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-all"
                                            >
                                                <Download size={14} />
                                                Download
                                            </button>
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
