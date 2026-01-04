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
    const [branches, setBranches] = useState<Branch[]>([]) // Dynamic branches
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
        // Parallel fetch
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
            // 1. Delete from Storage
            const fileUrlParts = resource.file_url.split('/eng-docs/')
            if (fileUrlParts.length > 1) {
                const filePath = fileUrlParts[1]
                const { error: storageError } = await supabase.storage
                    .from('eng-docs')
                    .remove([filePath])

                if (storageError) console.error('Storage delete error:', storageError)
            }

            // 2. Delete from DB
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
        // Simple hash fallback
        return 'bg-gray-800 text-gray-300 border-gray-700'
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Video': return <Video className="w-4 h-4 text-purple-400" />
            case 'Notes': return <FileText className="w-4 h-4 text-red-400" />
            default: return <File className="w-4 h-4 text-blue-400" />
        }
    }

    if (loading) return (
        <div className="flex-1 flex justify-center items-center h-full">
            <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        </div>
    )

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-[1400px] mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">All Resources</h1>
                        <p className="text-gray-400">View, edit, and organize all uploaded academic materials.</p>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 mb-6 rounded-lg border ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border-green-800' : 'bg-red-900/20 text-red-400 border-red-800'}`}>
                        {message.text}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-[#11161D] p-5 rounded-xl border border-gray-800 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-3">
                            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search by title, code..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-gray-700 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-200 outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Branch</label>
                            <div className="relative">
                                <select
                                    value={filterBranch}
                                    onChange={(e) => setFilterBranch(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-200 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Semester</label>
                            <div className="relative">
                                <select
                                    value={filterSemester}
                                    onChange={(e) => setFilterSemester(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-200 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                                >
                                    <option value="">All Semesters</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Type</label>
                            <div className="relative">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-200 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                                >
                                    <option value="">All Types</option>
                                    {['Notes', 'Papers', 'Labs', 'Books'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-[#11161D] rounded-xl border border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-gray-800 bg-[#161B22]">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Document Title</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Subject Code & Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Branch</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Semester</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Upload Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {currentItems.length > 0 ? (
                                    currentItems.map((r) => (
                                        <tr key={r.id} className="hover:bg-[#161B22]/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-200">{r.title}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300">{r.subject_code}</div>
                                                <div className="text-xs text-gray-500 capitalize">{r.title.length > 20 ? r.title.substring(0, 20) + '...' : r.title}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded border text-xs font-medium ${getBranchColor(r.branch)}`}>
                                                    {r.branch}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-300">
                                                Sem {r.semester}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(r.type)}
                                                    <span className="text-sm text-gray-300">{r.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {new Date(r.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditModal(r)}
                                                        className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-blue-400 transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(r)}
                                                        disabled={deleting === r.id}
                                                        className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                                                    >
                                                        {deleting === r.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            No resources found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Pagination */}
                    <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Showing <span className="font-medium text-white">{indexOfFirstItem + 1}</span> to <span className="font-medium text-white">{Math.min(indexOfLastItem, filteredResources.length)}</span> of <span className="font-medium text-white">{filteredResources.length}</span> results
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-1.5 rounded border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal (Preserved Functionality, Dark Styled) */}
            {editingResource && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#161B22] rounded-xl shadow-2xl w-full max-w-md p-6 m-4 border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4">Edit Resource</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    className="w-full rounded-lg border border-gray-600 bg-[#0B0E14] px-4 py-2 outline-none focus:border-blue-500 text-white transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Subject Code</label>
                                <input
                                    type="text"
                                    value={editSubjectCode}
                                    onChange={e => setEditSubjectCode(e.target.value)}
                                    className="w-full rounded-lg border border-gray-600 bg-[#0B0E14] px-4 py-2 outline-none focus:border-blue-500 text-white transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setEditingResource(null)}
                                className="px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSave}
                                disabled={savingEdit}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
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
