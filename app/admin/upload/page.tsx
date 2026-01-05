'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, CloudUpload } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminUpload() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [branches, setBranches] = useState<{ id: string, name: string }[]>([])
    const [folders, setFolders] = useState<{ id: string, name: string, parent_id: string | null }[]>([])

    // Form State
    const [title, setTitle] = useState('')
    const [branch, setBranch] = useState('')
    const [semester, setSemester] = useState('')
    const [subjectCode, setSubjectCode] = useState('')
    const [type, setType] = useState('Notes')
    const [selectedFolder, setSelectedFolder] = useState('')

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Check auth & fetch branches
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
            }

            const { data } = await supabase.from('branches').select('*').order('name')
            if (data) setBranches(data)

            const { data: folderData } = await supabase.from('folders').select('*').order('name')
            if (folderData) setFolders(folderData)
        }
        init()
    }, [router])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file' })
            return
        }

        setLoading(true)
        setMessage(null)

        try {
            // 0. Get User
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                throw new Error('You must be logged in to upload.')
            }

            // 1. Upload File
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('eng-docs')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('eng-docs')
                .getPublicUrl(filePath)

            // 2. Insert DB Record
            const { error: dbError } = await supabase.from('resources').insert({
                title,
                branch,
                semester: Number(semester),
                subject_code: subjectCode,
                type,
                file_url: publicUrl,
                uploaded_by: user.id,
                folder_id: selectedFolder || null
            })

            if (dbError) throw dbError

            setMessage({ type: 'success', text: 'Resource uploaded successfully!' })

            // Clear form
            setSubjectCode('')
            setFile(null)
            setSelectedFolder('')

            const fileInput = document.getElementById('file-upload') as HTMLInputElement | null
            if (fileInput) {
                fileInput.value = ''
            }

        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: err.message || 'Upload failed' })
        } finally {
            setLoading(false)
        }
    }

    const resourceTypes = [
        { value: 'Notes', label: 'Lecture Notes', icon: 'menu_book' },
        { value: 'Labs', label: 'Lab Manual', icon: 'science' },
        { value: 'Papers', label: 'Previous Year Paper', icon: 'article' },
        { value: 'Books', label: 'Textbook', icon: 'book' },
    ]

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <header className="w-full px-4 md:px-8 py-8 pb-4 shrink-0 z-10 bg-[#0B0E14]/95 backdrop-blur-sm sticky top-0">
                <div className="max-w-5xl mx-auto w-full">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-white text-2xl md:text-3xl font-black leading-tight tracking-tight">Upload New Engineering Resource</h2>
                        <p className="text-[#9da6b9] text-base">Add new study materials, notes, or papers to the student database.</p>
                    </div>
                </div>
            </header>

            {/* Scrollable Content Area */}
            <div className="px-4 md:px-8 pb-20">
                <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">

                    {message && (
                        <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Upload Zone */}
                    <section>
                        <div className={`group relative flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed ${file ? 'border-[#135bec] bg-[#135bec]/5' : 'border-[#282e39] bg-[#1a1d24]/50'} hover:border-[#135bec] hover:bg-[#1a1d24] px-6 py-10 lg:py-16 transition-all cursor-pointer`}>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".pdf,.zip,.doc,.docx"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="bg-[#1a1d24] p-4 rounded-full border border-[#282e39] group-hover:border-[#135bec]/50 group-hover:shadow-[0_0_20px_rgba(19,91,236,0.15)] transition-all">
                                <CloudUpload className={`w-10 h-10 ${file ? 'text-[#135bec]' : 'text-[#9da6b9]'} group-hover:text-[#135bec] transition-colors`} />
                            </div>
                            <div className="flex flex-col items-center gap-1 text-center">
                                <p className="text-white text-lg font-bold">{file ? file.name : 'Drag PDF or ZIP files here, or click to browse'}</p>
                                <p className="text-[#9da6b9] text-sm">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Supported formats: PDF, ZIP (Max 50MB)'}</p>
                            </div>
                            <button type="button" className="flex items-center justify-center rounded-lg h-10 px-6 bg-[#1a1d24] border border-[#282e39] text-white text-sm font-bold hover:bg-[#282e39] transition-colors">
                                Browse Files
                            </button>
                        </div>
                    </section>

                    {/* Form Grid */}
                    <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                        {/* Column 1: Academic Info */}
                        <div className="flex flex-col gap-6 bg-[#1a1d24]/30 p-6 rounded-xl border border-[#282e39]/50">
                            <div className="flex items-center gap-2 pb-2 border-b border-[#282e39]/50 mb-2">
                                <span className="material-symbols-outlined text-[#135bec]" style={{ fontSize: '20px' }}>school</span>
                                <h3 className="text-white font-semibold text-lg">Academic Info</h3>
                            </div>
                            <label className="flex flex-col gap-2">
                                <span className="text-[#9da6b9] text-sm font-medium">Branch / Department</span>
                                <select
                                    required
                                    value={branch}
                                    onChange={e => setBranch(e.target.value)}
                                    className="w-full rounded-lg bg-[#0B0E14] border border-[#282e39] text-white placeholder-[#9da6b9] focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] h-12 px-4 text-base transition-shadow outline-none"
                                >
                                    <option value="">Select Branch (e.g. CSE, ME)</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.name}>{b.name}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-[#9da6b9] text-sm font-medium">Folder (Optional)</span>
                                <select
                                    value={selectedFolder}
                                    onChange={e => setSelectedFolder(e.target.value)}
                                    className="w-full rounded-lg bg-[#0B0E14] border border-[#282e39] text-white placeholder-[#9da6b9] focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] h-12 px-4 text-base transition-shadow outline-none"
                                >
                                    <option value="">No Folder (Root)</option>
                                    {folders.map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.parent_id ? '└ ' : ''}📁 {f.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-[#9da6b9] text-sm font-medium">Semester</span>
                                <select
                                    required
                                    value={semester}
                                    onChange={e => setSemester(e.target.value)}
                                    className="w-full rounded-lg bg-[#0B0E14] border border-[#282e39] text-white placeholder-[#9da6b9] focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] h-12 px-4 text-base transition-shadow outline-none"
                                >
                                    <option value="">Select Semester (1-8)</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-[#9da6b9] text-sm font-medium">Subject Code & Name</span>
                                <input
                                    required
                                    type="text"
                                    value={subjectCode}
                                    onChange={e => setSubjectCode(e.target.value)}
                                    placeholder="e.g., KCS-401 Data Structures"
                                    className="w-full rounded-lg bg-[#0B0E14] border border-[#282e39] text-white placeholder-[#9da6b9] focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] h-12 px-4 text-base transition-shadow outline-none"
                                />
                            </label>
                        </div>

                        {/* Column 2: Resource Details */}
                        <div className="flex flex-col gap-6 bg-[#1a1d24]/30 p-6 rounded-xl border border-[#282e39]/50 h-full">
                            <div className="flex items-center gap-2 pb-2 border-b border-[#282e39]/50 mb-2">
                                <span className="material-symbols-outlined text-[#135bec]" style={{ fontSize: '20px' }}>description</span>
                                <h3 className="text-white font-semibold text-lg">Resource Details</h3>
                            </div>
                            <label className="flex flex-col gap-2">
                                <span className="text-[#9da6b9] text-sm font-medium">Document Title</span>
                                <input
                                    required
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Enter a clear title for the resource"
                                    className="w-full rounded-lg bg-[#0B0E14] border border-[#282e39] text-white placeholder-[#9da6b9] focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] h-12 px-4 text-base transition-shadow outline-none"
                                />
                            </label>
                            <div className="flex flex-col gap-3">
                                <span className="text-[#9da6b9] text-sm font-medium">Resource Type</span>
                                <div className="flex flex-col gap-3">
                                    {resourceTypes.map(rt => (
                                        <label key={rt.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${type === rt.value ? 'border-[#135bec]/50 bg-[#135bec]/10' : 'border-[#282e39] bg-[#0B0E14] hover:border-[#135bec]/30'}`}>
                                            <input
                                                type="radio"
                                                name="resource_type"
                                                value={rt.value}
                                                checked={type === rt.value}
                                                onChange={e => setType(e.target.value)}
                                                className="w-5 h-5 text-[#135bec] bg-transparent border-gray-500 focus:ring-[#135bec] focus:ring-2"
                                            />
                                            <span className="material-symbols-outlined text-[#9da6b9]" style={{ fontSize: '20px' }}>{rt.icon}</span>
                                            <span className="text-white text-sm font-medium">{rt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Action - Spanning both columns */}
                        <div className="lg:col-span-2 pt-4">
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full flex items-center justify-center gap-3 bg-[#135bec] hover:bg-blue-600 text-white font-bold text-lg h-14 rounded-xl shadow-lg shadow-blue-900/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <span className="material-symbols-outlined">publish</span>}
                                {loading ? 'Uploading...' : 'Publish to Student Portal'}
                            </button>
                            <p className="text-center text-[#9da6b9] text-xs mt-4">By publishing, you confirm that this resource complies with the university's academic integrity policy.</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
