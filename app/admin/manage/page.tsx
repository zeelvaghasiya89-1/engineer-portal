'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, FileText, Video, File, Search, ChevronDown, Trash2, Edit2, Plus } from 'lucide-react'
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
    created_at: string
}

type Branch = {
    id: string
    name: string
}

export default function AdminManage() {
    const [resources, setResources] = useState<Resource[]>([])
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)

    // Search/Filter State
    const [searchQuery, setSearchQuery] = useState('')
    const [filterBranch, setFilterBranch] = useState('')
    const [filterSemester, setFilterSemester] = useState('')
    const [filterType, setFilterType] = useState('')

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 7

    // Edit Modal State
    const [editingResource, setEditingResource] = useState<Resource | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editSubjectCode, setEditSubjectCode] = useState('')
    const [savingEdit, setSavingEdit] = useState(false)

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const [resRes, resBranches] = await Promise.all([
            supabase.from('resources').select('*').order('created_at', { ascending: false }),
            supabase.from('branches').select('*').order('name')
        ])

        if (resRes.data) setResources(resRes.data)
        if (resBranches.data) setBranches(resBranches.data)
        setLoading(false)
    }

    const handleDelete = async (resource: Resource) => {
        if (!confirm('Are you sure you want to delete this resource? This cannot be undone.')) return

        setDeleting(resource.id)
        setMessage(null)

        try {
            const fileUrlParts = resource.file_url.split('/eng-docs/')
            if (fileUrlParts.length > 1) {
                const filePath = fileUrlParts[1]
                const { error: storageError } = await supabase.storage
                    .from('eng-docs')
                    .remove([filePath])

                if (storageError) console.error('Storage delete error:', storageError)
            }

            const { error: dbError } = await supabase
                .from('resources')
                .delete()
                .eq('id', resource.id)

            if (dbError) throw dbError

            setMessage({ type: 'success', text: 'Resource deleted successfully' })
            setResources(resources.filter(r => r.id !== resource.id))

        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: err.message || 'Failed to delete' })
        } finally {
            setDeleting(null)
        }
    }

    const openEditModal = (resource: Resource) => {
        setEditingResource(resource)
        setEditTitle(resource.title)
        setEditSubjectCode(resource.subject_code)
        setMessage(null)
    }

    const handleEditSave = async () => {
        if (!editingResource) return
        setSavingEdit(true)

        try {
            const { error } = await supabase
                .from('resources')
                .update({
                    title: editTitle,
                    subject_code: editSubjectCode
                })
                .eq('id', editingResource.id)

            if (error) throw error

            setResources(resources.map(r =>
                r.id === editingResource.id
                    ? { ...r, title: editTitle, subject_code: editSubjectCode }
                    : r
            ))

            setEditingResource(null)
            setMessage({ type: 'success', text: 'Resource updated successfully' })

        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update' })
        } finally {
            setSavingEdit(false)
        }
    }

    // Filter Logic
    const filteredResources = resources.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.subject_code.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesBranch = filterBranch ? r.branch === filterBranch : true
        const matchesSemester = filterSemester ? r.semester === Number(filterSemester) : true
        const matchesType = filterType ? r.type === filterType : true

        return matchesSearch && matchesBranch && matchesSemester && matchesType
    })

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredResources.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredResources.length / itemsPerPage)

    const getBranchColor = (branch: string) => {
        const colors: { [key: string]: string } = {
            'Mechanical': 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/30',
            'Electrical': 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/30 dark:text-yellow-400 dark:ring-yellow-400/30',
            'Computer Science': 'bg-purple-50 text-purple-700 ring-purple-700/10 dark:bg-purple-900/30 dark:text-purple-400 dark:ring-purple-400/30',
            'Civil': 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-900/30 dark:text-orange-400 dark:ring-orange-400/30',
        }
        return colors[branch] || 'bg-slate-100 text-slate-600 ring-slate-500/10 dark:bg-slate-700/50 dark:text-slate-300 dark:ring-slate-500/30'
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Video': return <Video className="w-4 h-4 text-purple-500" />
            case 'Notes': return <span className="material-symbols-outlined text-[18px] text-red-500">picture_as_pdf</span>
            case 'Papers': return <span className="material-symbols-outlined text-[18px] text-green-500">assignment</span>
            case 'Labs': return <span className="material-symbols-outlined text-[18px] text-slate-400">description</span>
            default: return <File className="w-4 h-4 text-blue-400" />
        }
    }

    if (loading) return (
        <div className="flex-1 flex justify-center items-center h-full">
            <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        </div>
    )

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
            <div className="max-w-[1400px] mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Manage Resources</h1>
                        <p className="text-[#9da6b9]">View, edit, and organize all uploaded academic materials.</p>
                    </div>
                    <Link href="/admin/upload" className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#135bec] px-5 py-2.5 text-sm font-bold tracking-wide text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-2 focus:ring-offset-[#101622]">
                        <Plus className="w-5 h-5" />
                        Upload New Resource
                    </Link>
                </div>

                {message && (
                    <div className={`p-4 mb-6 rounded-lg border ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border-green-800' : 'bg-red-900/20 text-red-400 border-red-800'}`}>
                        {message.text}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-[#111318] p-5 rounded-xl border border-[#282e39] mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Search Bar */}
                        <div className="md:col-span-12 xl:col-span-4">
                            <label className="block text-sm font-medium text-[#9da6b9] mb-1.5">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by title, code..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg border border-[#282e39] bg-[#1a1d24] px-4 py-2.5 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-[#135bec] focus:outline-none focus:ring-1 focus:ring-[#135bec]"
                                />
                            </div>
                        </div>
                        {/* Filters */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:col-span-12 xl:col-span-8">
                            <div>
                                <label className="block text-sm font-medium text-[#9da6b9] mb-1.5">Branch</label>
                                <div className="relative">
                                    <select
                                        value={filterBranch}
                                        onChange={(e) => setFilterBranch(e.target.value)}
                                        className="w-full appearance-none rounded-lg border border-[#282e39] bg-[#1a1d24] px-4 py-2.5 text-sm text-white focus:border-[#135bec] focus:outline-none focus:ring-1 focus:ring-[#135bec]"
                                    >
                                        <option value="">All Branches</option>
                                        {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#9da6b9] mb-1.5">Semester</label>
                                <div className="relative">
                                    <select
                                        value={filterSemester}
                                        onChange={(e) => setFilterSemester(e.target.value)}
                                        className="w-full appearance-none rounded-lg border border-[#282e39] bg-[#1a1d24] px-4 py-2.5 text-sm text-white focus:border-[#135bec] focus:outline-none focus:ring-1 focus:ring-[#135bec]"
                                    >
                                        <option value="">All Semesters</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#9da6b9] mb-1.5">Type</label>
                                <div className="relative">
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="w-full appearance-none rounded-lg border border-[#282e39] bg-[#1a1d24] px-4 py-2.5 text-sm text-white focus:border-[#135bec] focus:outline-none focus:ring-1 focus:ring-[#135bec]"
                                    >
                                        <option value="">All Types</option>
                                        {['Notes', 'Papers', 'Labs', 'Books'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-[#111318] rounded-xl border border-[#282e39] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] border-collapse text-left">
                            <thead>
                                <tr className="bg-[#1a1d24] text-xs uppercase tracking-wide text-[#9da6b9]">
                                    <th className="px-6 py-4 font-semibold">Document Title</th>
                                    <th className="px-6 py-4 font-semibold">Subject Code & Name</th>
                                    <th className="px-6 py-4 font-semibold">Branch</th>
                                    <th className="px-6 py-4 font-semibold">Semester</th>
                                    <th className="px-6 py-4 font-semibold">Type</th>
                                    <th className="px-6 py-4 font-semibold">Upload Date</th>
                                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#282e39] text-sm">
                                {currentItems.length > 0 ? (
                                    currentItems.map((r) => (
                                        <tr key={r.id} className="group transition-colors hover:bg-[#1a1d24]/50">
                                            <td className="px-6 py-4 font-medium text-white">
                                                {r.title}
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">
                                                {r.subject_code}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getBranchColor(r.branch)}`}>
                                                    {r.branch}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">Sem {r.semester}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    {getTypeIcon(r.type)}
                                                    <span>{r.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditModal(r)}
                                                        className="rounded p-1.5 text-slate-500 hover:bg-[#282e39] hover:text-[#135bec] transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(r)}
                                                        disabled={deleting === r.id}
                                                        className="rounded p-1.5 text-slate-500 hover:bg-red-900/20 hover:text-red-500 transition-colors disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        {deleting === r.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-[#9da6b9]">
                                            No resources found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Pagination */}
                    <div className="px-6 py-4 border-t border-[#282e39] flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                            Showing <span className="font-medium text-white">{filteredResources.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-medium text-white">{Math.min(indexOfLastItem, filteredResources.length)}</span> of <span className="font-medium text-white">{filteredResources.length}</span> results
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="flex items-center justify-center rounded-lg border border-[#282e39] bg-[#1a1d24] px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-[#282e39] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="flex items-center justify-center rounded-lg border border-[#282e39] bg-[#1a1d24] px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-[#282e39] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingResource && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1a1d24] rounded-xl shadow-2xl w-full max-w-md p-6 m-4 border border-[#282e39]">
                        <h3 className="text-xl font-bold text-white mb-4">Edit Resource</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#9da6b9] mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    className="w-full rounded-lg border border-[#282e39] bg-[#0B0E14] px-4 py-2 outline-none focus:border-[#135bec] text-white transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#9da6b9] mb-1">Subject Code</label>
                                <input
                                    type="text"
                                    value={editSubjectCode}
                                    onChange={e => setEditSubjectCode(e.target.value)}
                                    className="w-full rounded-lg border border-[#282e39] bg-[#0B0E14] px-4 py-2 outline-none focus:border-[#135bec] text-white transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setEditingResource(null)}
                                className="px-4 py-2 rounded-lg text-slate-400 hover:bg-[#282e39] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSave}
                                disabled={savingEdit}
                                className="px-4 py-2 rounded-lg bg-[#135bec] text-white font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
                            >
                                {savingEdit && <Loader2 className="animate-spin size-4" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
