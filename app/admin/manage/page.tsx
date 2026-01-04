'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'

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

export default function AdminManage() {
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)

    // Search/Filter State
    const [searchQuery, setSearchQuery] = useState('')
    const [filterBranch, setFilterBranch] = useState('')
    const [filterSemester, setFilterSemester] = useState('')
    const [filterType, setFilterType] = useState('')

    // Edit Modal State
    const [editingResource, setEditingResource] = useState<Resource | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editSubjectCode, setEditSubjectCode] = useState('')
    const [savingEdit, setSavingEdit] = useState(false)

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        fetchResources()
    }, [])

    const fetchResources = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setResources(data)
        setLoading(false)
    }

    const handleDelete = async (resource: Resource) => {
        if (!confirm('Are you sure you want to delete this resource? This cannot be undone.')) return

        setDeleting(resource.id)
        setMessage(null)

        try {
            // 1. Delete from Storage
            // Extract file path from URL. Assuming standard Supabase Storage URL format.
            // URL: .../storage/v1/object/public/eng-docs/filename.pdf
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

            // Update local state
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

    return (
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-[#101622] h-full p-8 pb-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">Manage Resources</h2>
                </div>

                {message && (
                    <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {message.text}
                    </div>
                )}

                {/* Filters */}
                <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111318] lg:grid-cols-12 mb-6">
                    <div className="lg:col-span-12 xl:col-span-3">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-[#1c1f27] dark:text-white"
                        />
                    </div>
                    <div className="lg:col-span-6 xl:col-span-3">
                        <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm dark:border-slate-700 dark:bg-[#1c1f27] dark:text-white">
                            <option value="">All Branches</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Civil">Civil</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Electronics">Electronics</option>
                        </select>
                    </div>
                    <div className="lg:col-span-6 xl:col-span-3">
                        <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm dark:border-slate-700 dark:bg-[#1c1f27] dark:text-white">
                            <option value="">All Semesters</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                    </div>
                    <div className="lg:col-span-6 xl:col-span-3">
                        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm dark:border-slate-700 dark:bg-[#1c1f27] dark:text-white">
                            <option value="">All Types</option>
                            {['Notes', 'Papers', 'Labs', 'Books'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111318]">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] border-collapse text-left">
                            <thead>
                                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-[#1c1f27] dark:text-slate-400">
                                    <th className="px-6 py-4 font-semibold">Document Title</th>
                                    <th className="px-6 py-4 font-semibold">Subject</th>
                                    <th className="px-6 py-4 font-semibold">Branch</th>
                                    <th className="px-6 py-4 font-semibold">Semester</th>
                                    <th className="px-6 py-4 font-semibold">Type</th>
                                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-10 text-gray-500">Loading resources...</td></tr>
                                ) : filteredResources.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-10 text-gray-500">No resources found.</td></tr>
                                ) : (
                                    filteredResources.map(r => (
                                        <tr key={r.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{r.title}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{r.subject_code}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {r.branch}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">Sem {r.semester}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{r.type}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(r)}
                                                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-primary"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(r)}
                                                        disabled={deleting === r.id}
                                                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-900/20 dark:hover:text-red-500 disabled:opacity-50"
                                                    >
                                                        {deleting === r.id ? <Loader2 className="animate-spin size-5" /> : <span className="material-symbols-outlined text-[20px]">delete</span>}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingResource && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1c1f27] rounded-xl shadow-2xl w-full max-w-md p-6 m-4 border border-slate-200 dark:border-slate-800">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Edit Resource</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-black/20 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Subject Code</label>
                                <input
                                    type="text"
                                    value={editSubjectCode}
                                    onChange={e => setEditSubjectCode(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-black/20 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setEditingResource(null)}
                                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSave}
                                disabled={savingEdit}
                                className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
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
