'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Download, FileText, Video, File, BookOpen, User, LogIn, ChevronDown, Filter, Layers, Book, GraduationCap, Menu, X, Plus, Trash2, Settings, Loader2 } from 'lucide-react'
import ManageBranchesModal from '@/app/components/ManageBranchesModal'

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

type Branch = {
    id: string
    name: string
}

export default function Dashboard() {
    const router = useRouter()
    const [userProfile, setUserProfile] = useState<Profile | null>(null)
    const [resources, setResources] = useState<Resource[]>([])
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [selectedBranch, setSelectedBranch] = useState<string>('')
    const [selectedSemester, setSelectedSemester] = useState<number | ''>('')
    const [selectedType, setSelectedType] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')

    // Mobile specific
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Fetch Logic
    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        // 1. Get User & Profile
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profile) {
                setUserProfile(profile)
                if (selectedBranch === '') setSelectedBranch(profile.branch || '')
                if (selectedSemester === '') setSelectedSemester(profile.semester || '')
            } else {
                setUserProfile({
                    id: user.id,
                    full_name: user.user_metadata?.full_name || 'User',
                    branch: '',
                    semester: 0,
                    role: 'student'
                })
            }
        }

        await Promise.all([fetchBranches(), fetchResources()])
        setLoading(false)
    }

    const fetchBranches = async () => {
        const { data } = await supabase.from('branches').select('*').order('name')
        if (data) setBranches(data)
    }

    // Refetch when filters change
    useEffect(() => {
        fetchResources()
    }, [selectedBranch, selectedSemester, selectedType, searchQuery])

    const fetchResources = async () => {
        let query = supabase.from('resources').select('*')

        if (selectedBranch) query = query.eq('branch', selectedBranch)
        if (selectedSemester) query = query.eq('semester', selectedSemester)
        if (selectedType) query = query.eq('type', selectedType)

        if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,subject_code.ilike.%${searchQuery}%`)
        }

        const { data, error } = await query
        if (data) setResources(data)
    }

    const handleDeleteResource = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent card click
        if (!confirm('Are you sure you want to delete this resource?')) return
        setDeletingId(id)

        // Ideally should check deleting permissions or rely on RLS failure
        const { error } = await supabase.from('resources').delete().eq('id', id)
        if (!error) {
            setResources(prev => prev.filter(r => r.id !== id))
        } else {
            alert('Failed to delete: ' + error.message)
        }
        setDeletingId(null)
    }

    const handleDownload = (url: string) => {
        window.open(url, '_blank')
    }

    const semesters = [1, 2, 3, 4, 5, 6, 7, 8]
    const types = ['Notes', 'Papers', 'Labs', 'Books']

    const getBranchColor = (branch: string) => {
        // Just a simple hash to color or default for dynamic branches
        const colors = [
            'bg-purple-500/10 text-purple-400 border-purple-500/20',
            'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'bg-orange-500/10 text-orange-400 border-orange-500/20',
            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            'bg-teal-500/10 text-teal-400 border-teal-500/20',
            'bg-pink-500/10 text-pink-400 border-pink-500/20'
        ]
        const index = branch.length % colors.length
        return colors[index]
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
            <ManageBranchesModal
                isOpen={isBranchModalOpen}
                onClose={() => setIsBranchModalOpen(false)}
                onUpdate={fetchBranches}
            />

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 w-72 bg-[#11161D] border-r border-gray-800 flex flex-col z-50 transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 size-8 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                            <GraduationCap className="text-white size-5" />
                        </div>
                        <h1 className="text-lg font-bold tracking-tight">EngHub</h1>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden p-2 text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8">
                    {/* Branch Filter */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2">
                                <Layers className="size-4 text-blue-500" />
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Branch</h3>
                            </div>
                            {userProfile?.role === 'admin' && (
                                <button
                                    onClick={() => setIsBranchModalOpen(true)}
                                    className="text-gray-500 hover:text-blue-400 p-1 rounded"
                                    title="Manage Branches"
                                >
                                    <Settings size={14} />
                                </button>
                            )}
                        </div>

                        <div className="space-y-1">
                            {branches.map(branch => (
                                <button
                                    key={branch.id}
                                    onClick={() => {
                                        setSelectedBranch(branch.name === selectedBranch ? '' : branch.name);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${selectedBranch === branch.name ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : 'text-gray-400 border-transparent hover:bg-gray-800 hover:text-gray-200'}`}
                                >
                                    {branch.name}
                                </button>
                            ))}
                            {branches.length === 0 && <div className="text-xs text-gray-600 px-3">No branches found</div>}
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
                                    onChange={(e) => {
                                        setSelectedSemester(e.target.value ? Number(e.target.value) : '');
                                        setIsMobileMenuOpen(false);
                                    }}
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
            <main className="flex-1 flex flex-col overflow-hidden relative w-full">
                {/* Header */}
                <header className="h-16 lg:h-20 border-b border-gray-800 flex items-center justify-between px-4 lg:px-8 bg-[#0B0E14] z-10 shrink-0 gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="flex-1 max-w-2xl">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 lg:w-5 lg:h-5 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full rounded-xl bg-[#11161D] border border-gray-800 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-sm pl-10 lg:pl-12 py-2.5 lg:py-3 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4 shrink-0">
                        {userProfile ? (
                            <>
                                {userProfile.role === 'admin' && (
                                    <>
                                        <Link href="/admin/upload" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20" title="Upload New Resource">
                                            <Plus size={18} />
                                            <span className="hidden sm:inline">Upload</span>
                                        </Link>
                                        <Link href="/admin/dashboard" className="hidden sm:flex items-center gap-2 bg-[#1C2333] hover:bg-[#252D3F] border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                            <span>Admin</span>
                                        </Link>
                                    </>
                                )}
                                <Link href="/profile">
                                    <div className="flex items-center gap-3 pl-2 lg:pl-4 lg:border-l border-gray-800">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-medium text-white">{userProfile.full_name}</p>
                                            <p className="text-xs text-gray-500 capitalize">{userProfile.role}</p>
                                        </div>
                                        <div className="size-8 lg:size-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white ring-2 ring-gray-800 hover:ring-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-500/20">
                                            <User size={18} />
                                        </div>
                                    </div>
                                </Link>
                            </>
                        ) : (
                            <Link href="/login" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20">
                                <LogIn size={18} />
                                <span className="hidden sm:inline">Sign In</span>
                            </Link>
                        )}
                    </div>
                </header>

                {/* Resource Feed */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#0B0E14]">
                    <div className="max-w-[1600px] mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 lg:mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                                    {selectedBranch ? `${selectedBranch}` : 'All Resources'}
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    {selectedSemester ? `Semester ${selectedSemester} • ` : ''}
                                    Browse and download academic materials.
                                </p>
                            </div>
                            <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700 w-fit">
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
                                    Try adjusting your search or filters.
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
                                {resources.map(res => (
                                    <div key={res.id} className="group flex flex-col bg-[#11161D] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 relative">
                                        <div className="p-5 flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 rounded-xl flex items-center justify-center ${res.type === 'Notes' ? 'bg-blue-500/10 text-blue-500' : res.type === 'Video' ? 'bg-purple-500/10 text-purple-500' : 'bg-gray-800 text-gray-400'}`}>
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

                                            <div className="flex items-center gap-2">
                                                {userProfile?.role === 'admin' && (
                                                    <button
                                                        onClick={(e) => handleDeleteResource(res.id, e)}
                                                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                        title="Delete (Admin)"
                                                        disabled={deletingId === res.id}
                                                    >
                                                        {deletingId === res.id ? <Loader2 className="animate-spin size-3" /> : <Trash2 size={14} />}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDownload(res.file_url)}
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-gray-800 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-all"
                                                >
                                                    <Download size={14} />
                                                    Download
                                                </button>
                                            </div>
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
