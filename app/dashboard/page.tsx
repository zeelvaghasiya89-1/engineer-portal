'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Download, FileText, Video, File, BookOpen, User, LogIn, ChevronDown, Filter, Layers, Book, GraduationCap, Menu, X, Plus, Trash2, Settings, Loader2, LayoutDashboard, Bell, Eye, Check, ArrowUpDown } from 'lucide-react'
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
    created_at?: string
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
    const [selectedBranches, setSelectedBranches] = useState<string[]>([])
    const [selectedSemester, setSelectedSemester] = useState<number | ''>('')
    const [selectedType, setSelectedType] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')

    // Sort
    const [sortBy, setSortBy] = useState<'popularity' | 'newest' | 'oldest' | 'title'>('newest')
    const [showSortMenu, setShowSortMenu] = useState(false)

    // Notifications
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications] = useState([
        { id: 1, text: 'New notes added for Data Structures', time: '2 hours ago', unread: true },
        { id: 2, text: 'Mid-sem papers uploaded for Civil', time: '5 hours ago', unread: true },
        { id: 3, text: 'Lab manual updated for Electronics', time: '1 day ago', unread: false },
    ])

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
    }, [selectedBranches, selectedSemester, selectedType, searchQuery])

    const fetchResources = async () => {
        let query = supabase.from('resources').select('*')

        if (selectedBranches.length > 0) {
            query = query.in('branch', selectedBranches)
        }
        if (selectedSemester) query = query.eq('semester', selectedSemester)
        if (selectedType) query = query.eq('type', selectedType)

        if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,subject_code.ilike.%${searchQuery}%`)
        }

        const { data, error } = await query
        if (data) setResources(data)
    }

    // Sort resources
    const sortedResources = [...resources].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            case 'oldest':
                return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
            case 'title':
                return a.title.localeCompare(b.title)
            case 'popularity':
            default:
                return 0 // Keep original order for popularity (would need view count)
        }
    })

    const handleBranchToggle = (branchName: string) => {
        setSelectedBranches(prev =>
            prev.includes(branchName)
                ? prev.filter(b => b !== branchName)
                : [...prev, branchName]
        )
    }

    const handleDeleteResource = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this resource?')) return
        setDeletingId(id)

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

    const clearFilters = () => {
        setSelectedBranches([])
        setSelectedSemester('')
        setSelectedType('')
        setSearchQuery('')
    }

    const handleViewCollection = () => {
        // Filter to show only exam-related materials
        setSelectedType('Papers')
        setSearchQuery('')
    }

    const semesters = [1, 2, 3, 4, 5, 6, 7, 8]
    const types = ['Notes', 'Papers', 'Labs', 'Books']

    const sortOptions = [
        { value: 'popularity', label: 'Popularity' },
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'title', label: 'Title A-Z' },
    ]

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Video': return <Video className="w-5 h-5" />
            case 'Notes': return <span className="material-symbols-outlined text-[20px]">menu_book</span>
            case 'Books': return <BookOpen className="w-5 h-5" />
            case 'Labs': return <span className="material-symbols-outlined text-[20px]">science</span>
            case 'Papers': return <span className="material-symbols-outlined text-[20px]">article</span>
            default: return <File className="w-5 h-5" />
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Notes': return 'text-blue-400 bg-blue-500/10 group-hover:bg-blue-500 group-hover:text-white'
            case 'Papers': return 'text-emerald-400 bg-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-white'
            case 'Labs': return 'text-orange-400 bg-orange-500/10 group-hover:bg-orange-500 group-hover:text-white'
            case 'Books': return 'text-pink-400 bg-pink-500/10 group-hover:bg-pink-500 group-hover:text-white'
            default: return 'text-gray-400 bg-gray-500/10'
        }
    }

    const getBranchColor = (branch: string, isSelected: boolean = false) => {
        const colors: { [key: string]: { bg: string, selected: string } } = {
            'Civil': { bg: 'hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/30', selected: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
            'Common': { bg: 'hover:bg-gray-500/10 hover:text-gray-300 hover:border-gray-500/30', selected: 'bg-gray-500/20 text-gray-300 border-gray-500/40' },
            'Computer Science': { bg: 'hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30', selected: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
            'Electrical': { bg: 'hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-500/30', selected: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
            'Electronics': { bg: 'hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30', selected: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
            'Information Technology': { bg: 'hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30', selected: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' },
            'Mechanical': { bg: 'hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30', selected: 'bg-red-500/20 text-red-400 border-red-500/40' },
        }
        const defaultColor = { bg: 'hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30', selected: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' }
        const color = colors[branch] || defaultColor
        return isSelected ? color.selected : color.bg
    }

    const getBadgeColor = (branch: string) => {
        const colors = [
            'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'bg-orange-500/10 text-orange-400 border-orange-500/20',
            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'bg-pink-500/10 text-pink-400 border-pink-500/20',
            'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            'bg-purple-500/10 text-purple-400 border-purple-500/20',
        ]
        const index = branch.length % colors.length
        return colors[index]
    }

    return (
        <div className="bg-[#111318] text-white overflow-hidden h-screen flex flex-col font-sans">
            <ManageBranchesModal
                isOpen={isBranchModalOpen}
                onClose={() => setIsBranchModalOpen(false)}
                onUpdate={fetchBranches}
            />

            {/* Header */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#282e39] bg-[#111318] px-4 lg:px-6 z-20 relative">
                {/* Logo */}
                <div className="flex items-center gap-3 w-auto lg:w-64">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex size-8 items-center justify-center rounded bg-[#135bec] text-white">
                        <span className="material-symbols-outlined text-[20px]">hub</span>
                    </div>
                    <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">EngineerHub</h2>
                </div>

                {/* Central Search */}
                <div className="flex flex-1 max-w-2xl px-2 lg:px-4">
                    <div className="flex w-full items-center rounded-lg bg-[#282e39] h-10 group focus-within:ring-2 focus-within:ring-[#135bec]/50 transition-all">
                        <div className="flex items-center justify-center pl-3 text-[#9da6b9]">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            className="flex-1 bg-transparent border-none text-white placeholder-[#9da6b9] text-sm px-3 focus:ring-0 focus:outline-none h-full w-full"
                            placeholder="Search notes, manuals, exams..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="pr-2 hidden sm:flex text-xs text-[#9da6b9] font-mono bg-[#1a1d24]/50 rounded px-1.5 py-0.5 border border-white/5 mr-2">⌘K</div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 lg:gap-4 w-auto lg:w-64 justify-end">
                    {userProfile?.role === 'admin' && (
                        <Link href="/admin/upload" className="hidden lg:flex items-center justify-center gap-2 rounded-lg bg-[#135bec] hover:bg-[#1d66f0] transition-colors h-9 px-4 text-white text-sm font-semibold shadow-lg shadow-[#135bec]/20">
                            <span className="material-symbols-outlined text-[18px]">upload_file</span>
                            <span className="truncate">Upload</span>
                        </Link>
                    )}
                    <div className="h-8 w-[1px] bg-[#282e39] mx-1 hidden lg:block"></div>

                    {/* Notifications Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="text-[#9da6b9] hover:text-white transition-colors relative p-2"
                        >
                            <Bell className="w-5 h-5" />
                            {notifications.filter(n => n.unread).length > 0 && (
                                <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full border-2 border-[#111318]"></span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                                <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1d24] border border-[#282e39] rounded-xl shadow-2xl z-40 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-[#282e39] flex items-center justify-between">
                                        <h3 className="font-semibold text-white">Notifications</h3>
                                        <span className="text-xs text-[#9da6b9]">{notifications.filter(n => n.unread).length} new</span>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.map(notif => (
                                            <div key={notif.id} className={`px-4 py-3 border-b border-[#282e39]/50 hover:bg-[#282e39]/30 cursor-pointer transition-colors ${notif.unread ? 'bg-[#135bec]/5' : ''}`}>
                                                <p className="text-sm text-white">{notif.text}</p>
                                                <p className="text-xs text-[#9da6b9] mt-1">{notif.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-2 border-t border-[#282e39]">
                                        <button className="text-sm text-[#135bec] hover:underline w-full text-center">View all notifications</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {userProfile ? (
                        <Link href="/profile">
                            <div className="size-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full ring-2 ring-[#282e39] cursor-pointer flex items-center justify-center text-white">
                                <User size={18} />
                            </div>
                        </Link>
                    ) : (
                        <Link href="/login" className="flex items-center gap-2 bg-[#135bec] hover:bg-[#1d66f0] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                            <LogIn size={18} />
                            <span className="hidden sm:inline">Sign In</span>
                        </Link>
                    )}
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed lg:static inset-y-0 left-0 w-64 flex-shrink-0 border-r border-[#282e39] bg-[#111318] flex flex-col overflow-y-auto custom-scrollbar pb-6 z-50 transition-transform duration-300 ease-in-out
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    {/* Mobile Close Button */}
                    <div className="lg:hidden p-4 border-b border-[#282e39] flex items-center justify-between">
                        <span className="font-bold text-white">Filters</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Filters: Branch - Now with animated buttons */}
                    <div className="px-5 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-[#9da6b9] uppercase tracking-wider">Branch</h3>
                            <button onClick={clearFilters} className="text-[10px] text-[#135bec] hover:underline">Clear</button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {branches.map(branch => {
                                const isSelected = selectedBranches.includes(branch.name)
                                return (
                                    <button
                                        key={branch.id}
                                        onClick={() => handleBranchToggle(branch.name)}
                                        className={`
                                            group flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 text-left
                                            ${isSelected
                                                ? `${getBranchColor(branch.name, true)} scale-[1.02]`
                                                : `border-[#282e39] text-[#9da6b9] ${getBranchColor(branch.name, false)}`
                                            }
                                            hover:scale-[1.02] active:scale-[0.98]
                                        `}
                                    >
                                        <div className={`
                                            flex items-center justify-center size-5 rounded border transition-all duration-200
                                            ${isSelected
                                                ? 'bg-current border-current/50'
                                                : 'border-current/30 group-hover:border-current/50'
                                            }
                                        `}>
                                            {isSelected && <Check className="w-3 h-3 text-[#111318]" />}
                                        </div>
                                        <span className="text-sm font-medium">{branch.name}</span>
                                    </button>
                                )
                            })}
                            {branches.length === 0 && <div className="text-xs text-gray-600 px-2">No branches found</div>}
                        </div>
                        {userProfile?.role === 'admin' && (
                            <button
                                onClick={() => setIsBranchModalOpen(true)}
                                className="mt-4 text-xs text-[#135bec] hover:underline flex items-center gap-1"
                            >
                                <Settings size={12} />
                                Manage Branches
                            </button>
                        )}
                    </div>

                    <div className="h-px bg-[#282e39] mx-5 my-4"></div>

                    {/* Filters: Semester */}
                    <div className="px-5">
                        <h3 className="text-xs font-bold text-[#9da6b9] uppercase tracking-wider mb-3">Semester</h3>
                        <div className="relative">
                            <select
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value ? Number(e.target.value) : '')}
                                className="w-full appearance-none rounded-lg bg-[#1a1d24] border border-[#282e39] text-sm text-white px-3 py-2.5 focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] outline-none cursor-pointer"
                            >
                                <option value="">Select Semester</option>
                                {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#9da6b9]">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-[#282e39] mx-5 my-4"></div>

                    {/* Filters: Resource Type */}
                    <div className="px-5">
                        <h3 className="text-xs font-bold text-[#9da6b9] uppercase tracking-wider mb-3">Resource Type</h3>
                        <div className="flex flex-wrap gap-2">
                            {types.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setSelectedType(selectedType === t ? '' : t)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 active:scale-95 ${selectedType === t
                                        ? 'bg-[#135bec]/20 text-[#135bec] border-[#135bec]/30'
                                        : 'bg-[#1a1d24] text-[#9da6b9] border-[#282e39] hover:border-gray-500 hover:text-white'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Promo/Help */}
                    <div className="mt-auto p-5">
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2 text-white">
                                <span className="material-symbols-outlined text-[18px]">help</span>
                                <span className="text-sm font-bold">Need Help?</span>
                            </div>
                            <p className="text-xs text-[#9da6b9] mb-3 leading-relaxed">Can't find a specific resource? Request it from the community.</p>
                            <button className="w-full py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors">Request Resource</button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#0b0d11]">
                    <div className="max-w-[1400px] mx-auto p-4 lg:p-8">
                        {/* Hero Section */}
                        <div className="relative overflow-hidden rounded-2xl bg-[#135bec] p-6 lg:p-8 mb-8 group">
                            {/* Background Elements */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#101622] via-[#135bec]/80 to-[#135bec] opacity-90"></div>
                            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                            <div className="absolute right-10 bottom-10 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl"></div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="max-w-xl">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md mb-4 border border-white/10">
                                        <span className="size-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                        Exam Season Live
                                    </div>
                                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 tracking-tight">Mid-Sem Prep: Digital Logic Design</h1>
                                    <p className="text-blue-100 text-sm md:text-base leading-relaxed">Curated list of top-rated handwritten notes, past year papers, and lab manuals specifically for the upcoming mid-semester examinations.</p>
                                </div>
                                <button
                                    onClick={handleViewCollection}
                                    className="shrink-0 rounded-lg bg-white text-[#135bec] hover:bg-gray-50 px-5 py-2.5 text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                >
                                    View Collection
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#135bec]">trending_up</span>
                                {selectedBranches.length > 0 ? selectedBranches.join(', ') : 'All Resources'}
                            </h2>

                            {/* Sort Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSortMenu(!showSortMenu)}
                                    className="flex items-center gap-2 text-sm text-[#9da6b9] hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-[#1a1d24]"
                                >
                                    <ArrowUpDown className="w-4 h-4" />
                                    <span className="hidden sm:inline">Sort by:</span>
                                    <span className="font-medium text-white">{sortOptions.find(o => o.value === sortBy)?.label}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                                </button>

                                {showSortMenu && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setShowSortMenu(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1d24] border border-[#282e39] rounded-xl shadow-2xl z-40 overflow-hidden py-1">
                                            {sortOptions.map(option => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setSortBy(option.value as any)
                                                        setShowSortMenu(false)
                                                    }}
                                                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${sortBy === option.value ? 'text-[#135bec] bg-[#135bec]/10' : 'text-white hover:bg-[#282e39]'}`}
                                                >
                                                    {option.label}
                                                    {sortBy === option.value && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Resource Grid */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-4">
                                <div className="size-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                                <p>Loading library...</p>
                            </div>
                        ) : sortedResources.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="bg-gray-800/50 p-6 rounded-full mb-6">
                                    <Search className="size-12 text-gray-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No resources found</h3>
                                <p className="text-gray-500 max-w-md">
                                    Try adjusting your search or filters.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-6 text-blue-400 hover:text-blue-300 font-medium text-sm hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
                                    {sortedResources.map(res => (
                                        <div key={res.id} className="group flex flex-col gap-4 rounded-xl border border-[#282e39] bg-[#1a1d24] p-4 hover:border-[#135bec]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#135bec]/5 hover:-translate-y-1 cursor-pointer">
                                            <div className="flex items-start justify-between">
                                                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors ${getTypeColor(res.type)}`}>
                                                    {getTypeIcon(res.type)}
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 rounded-md hover:bg-white/10 text-[#9da6b9] hover:text-white" title="Preview">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(res.file_url)}
                                                        className="p-1.5 rounded-md hover:bg-white/10 text-[#9da6b9] hover:text-[#135bec]"
                                                        title="Download"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    {userProfile?.role === 'admin' && (
                                                        <button
                                                            onClick={(e) => handleDeleteResource(res.id, e)}
                                                            className="p-1.5 rounded-md hover:bg-white/10 text-[#9da6b9] hover:text-red-400"
                                                            title="Delete"
                                                            disabled={deletingId === res.id}
                                                        >
                                                            {deletingId === res.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-white line-clamp-2 leading-snug group-hover:text-[#135bec] transition-colors">{res.title}</h3>
                                                <p className="mt-1.5 text-xs text-[#9da6b9] flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">person</span>
                                                    {res.uploaded_by || 'Admin'}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                                                <div className="flex gap-2">
                                                    <span className={`inline-flex items-center rounded px-2 py-0.5 font-mono text-[10px] font-medium border ${getBadgeColor(res.branch)}`}>{res.branch}</span>
                                                    <span className="inline-flex items-center rounded bg-purple-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-purple-400 border border-purple-500/20">Sem {res.semester}</span>
                                                </div>
                                                <span className="font-mono text-[10px] text-[#9da6b9]">{res.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Load More */}
                                <div className="flex justify-center mb-8">
                                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-[#282e39] bg-[#1a1d24] text-[#9da6b9] text-sm font-medium hover:text-white hover:border-gray-500 transition-all hover:scale-105 active:scale-95">
                                        Load more resources
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
