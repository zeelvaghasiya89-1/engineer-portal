'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminUpload() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [branches, setBranches] = useState<{ id: string, name: string }[]>([])

    // Form State
    const [title, setTitle] = useState('')
    const [branch, setBranch] = useState('')
    const [semester, setSemester] = useState('')
    const [subjectCode, setSubjectCode] = useState('')
    const [type, setType] = useState('Lecture Notes')

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
                uploaded_by: user.id
            })

            if (dbError) throw dbError

            setMessage({ type: 'success', text: 'Resource uploaded successfully!' })

            // Clear form
            setTitle('')
            setSubjectCode('')
            setFile(null)

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

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <header className="w-full px-4 md:px-8 py-6 md:py-8 pb-4 shrink-0 z-10 bg-background-dark/95 backdrop-blur-sm sticky top-0 border-b border-border-dark">
                <div className="max-w-5xl mx-auto w-full">
                    <Link href="/admin/dashboard" className="inline-block text-sm text-gray-400 hover:text-primary mb-2 transition-colors">
                        &larr; Back to Dashboard
                    </Link>
                    <h2 className="text-white text-2xl md:text-3xl font-black leading-tight tracking-tight">Upload New Resource</h2>
                    <p className="text-gray-400 text-sm md:text-base">Add new study materials to the student database.</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-20 pt-6">
                <div className="max-w-5xl mx-auto w-full">
                    {message && (
                        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                        {/* Upload Zone */}
                        <div className="lg:col-span-2">
                            <div className={`group relative flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed ${file ? 'border-primary bg-primary/5' : 'border-gray-700 bg-gray-800/50'} hover:border-primary hover:bg-gray-800 px-6 py-12 transition-all`}>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".pdf,.zip,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="bg-gray-800 p-4 rounded-full border border-gray-700 group-hover:border-primary/50 transition-all">
                                    <span className="material-symbols-outlined text-gray-400 group-hover:text-primary" style={{ fontSize: '40px' }}>cloud_upload</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <p className="text-white text-lg font-bold">{file ? file.name : 'Drag PDF or ZIP files here, or click to browse'}</p>
                                    <p className="text-gray-500 text-sm">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Supported formats: PDF, ZIP (Max 50MB)'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Column 1 */}
                        <div className="flex flex-col gap-6 bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">school</span>
                                Academic Info
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-gray-400 text-sm font-medium mb-1 block">Branch</label>
                                    <select required value={branch} onChange={e => setBranch(e.target.value)} className="w-full rounded-lg bg-gray-900 border border-gray-700 text-white h-12 px-4 focus:ring-1 focus:ring-primary focus:border-primary">
                                        <option value="">Select Branch</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.name}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm font-medium mb-1 block">Semester</label>
                                    <select required value={semester} onChange={e => setSemester(e.target.value)} className="w-full rounded-lg bg-gray-900 border border-gray-700 text-white h-12 px-4 focus:ring-1 focus:ring-primary focus:border-primary">
                                        <option value="">Select Semester</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm font-medium mb-1 block">Subject Code</label>
                                    <input required type="text" value={subjectCode} onChange={e => setSubjectCode(e.target.value)} placeholder="e.g. KCS-401" className="w-full rounded-lg bg-gray-900 border border-gray-700 text-white h-12 px-4 focus:ring-1 focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="flex flex-col gap-6 bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">description</span>
                                Resource Details
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-gray-400 text-sm font-medium mb-1 block">Title</label>
                                    <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Resource Title" className="w-full rounded-lg bg-gray-900 border border-gray-700 text-white h-12 px-4 focus:ring-1 focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm font-medium mb-1 block">Type</label>
                                    <div className="space-y-2 text-white">
                                        {['Notes', 'Papers', 'Labs', 'Books'].map(t => (
                                            <label key={t} className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 bg-gray-900 hover:border-primary/50 cursor-pointer">
                                                <input type="radio" name="type" value={t} checked={type === t} onChange={e => setType(e.target.value)} className="text-primary focus:ring-primary bg-transparent border-gray-500" />
                                                <span className="text-sm font-medium">{t}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 pt-4">
                            <button disabled={loading} type="submit" className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-blue-600 text-white font-bold text-lg h-14 rounded-xl shadow-lg shadow-blue-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? <Loader2 className="animate-spin" /> : <span className="material-symbols-outlined">publish</span>}
                                {loading ? 'Uploading...' : 'Publish Resource'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}
