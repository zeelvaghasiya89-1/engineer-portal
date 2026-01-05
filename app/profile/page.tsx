'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { LogOut, Save, Loader2, Link as IconLink, FileText, BookOpen, Video, FileQuestion, FlaskConical } from 'lucide-react'
import Link from 'next/link'

type Profile = {
    id: string
    full_name: string
    branch: string
    semester: number
    role: string
    email: string
}

type Branch = {
    id: string
    name: string
}

type Resource = {
    id: string
    title: string
    type: string
    subject_code: string
    created_at: string
}

export default function ProfilePage() {
    const router = useRouter()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [branches, setBranches] = useState<Branch[]>([])
    const [resources, setResources] = useState<Resource[]>([])

    const [formBranch, setFormBranch] = useState('')
    const [formSemester, setFormSemester] = useState('')
    const [formFullName, setFormFullName] = useState('')

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            // Fetch Branches
            const { data: dbBranches } = await supabase.from('branches').select('*').order('name')
            if (dbBranches) setBranches(dbBranches)

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (data) {
                setProfile({ ...data, email: user.email || '' })
                setFormFullName(data.full_name)
                setFormBranch(data.branch || '')
                setFormSemester(data.semester?.toString() || '')
            }

            // Fetch user's resources
            const { data: userResources } = await supabase
                .from('resources')
                .select('id, title, type, subject_code, created_at')
                .eq('uploaded_by', user.id)
                .order('created_at', { ascending: false })
                .limit(5)

            if (userResources) setResources(userResources)
            setLoading(false)
        }

        fetchProfile()
    }, [router])

    const handleSave = async () => {
        if (!profile) return
        setSaving(true)

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: formFullName,
                branch: formBranch,
                semester: formSemester ? Number(formSemester) : null
            })
            .eq('id', profile.id)

        if (error) {
            alert('Error updating profile')
        } else {
            alert('Profile updated!')
            router.refresh()
        }
        setSaving(false)
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'Notes': return <BookOpen className="w-5 h-5" />
            case 'Papers': return <FileQuestion className="w-5 h-5" />
            case 'Labs': return <FlaskConical className="w-5 h-5" />
            case 'Books': return <BookOpen className="w-5 h-5" />
            case 'Video': return <Video className="w-5 h-5" />
            default: return <FileText className="w-5 h-5" />
        }
    }

    const getFileIconBg = (type: string) => {
        switch (type) {
            case 'Notes': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            case 'Papers': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            case 'Labs': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
            case 'Books': return 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
            case 'Video': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            default: return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
        }
    }

    if (loading) {
        return <div className="min-h-[50vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
        </div>
    }

    return (
        <>
            {/* Header & Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#9da6b9]">
                    <Link className="hover:text-[#135bec] transition-colors" href="/dashboard">Home</Link>
                    <span>/</span>
                    <Link className="hover:text-[#135bec] transition-colors" href="#">Users</Link>
                    <span>/</span>
                    <span className="text-white font-medium">Profile</span>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#282e39] border border-transparent rounded-lg hover:bg-[#323946] transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#135bec] rounded-lg hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/20"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Profile
                    </button>
                </div>
            </div>

            {/* Personal Information Card */}
            <section className="bg-[#1C2333] rounded-xl border border-[#282e39] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#282e39] flex items-center justify-between">
                    <h3 className="font-bold text-lg text-white">Academic Information</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#9da6b9]">Full Name</span>
                        <input
                            type="text"
                            value={formFullName}
                            onChange={(e) => setFormFullName(e.target.value)}
                            className="bg-[#101622] border border-[#282e39] rounded-lg px-3 py-2 text-white focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec]/20 outline-none transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#9da6b9]">Branch</span>
                        <select
                            value={formBranch}
                            onChange={(e) => setFormBranch(e.target.value)}
                            className="bg-[#101622] border border-[#282e39] rounded-lg px-3 py-2 text-white focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec]/20 outline-none appearance-none cursor-pointer transition-all"
                        >
                            <option value="">Select Branch</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#9da6b9]">Semester</span>
                        <select
                            value={formSemester}
                            onChange={(e) => setFormSemester(e.target.value)}
                            className="bg-[#101622] border border-[#282e39] rounded-lg px-3 py-2 text-white focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec]/20 outline-none appearance-none cursor-pointer transition-all"
                        >
                            <option value="">Select Semester</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#9da6b9]">Email Address</span>
                        <p className="text-base font-medium text-white py-2">{profile?.email}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#9da6b9]">Role</span>
                        <p className="text-base font-medium text-white py-2 capitalize">{profile?.role}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#9da6b9]">Status</span>
                        <span className="inline-flex items-center w-fit gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 text-sm font-medium mt-1">
                            <span className="size-1.5 rounded-full bg-green-500"></span>
                            Active
                        </span>
                    </div>
                </div>
            </section>

            {/* Recent Resources Table */}
            <section className="bg-[#1C2333] rounded-xl border border-[#282e39] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-[#282e39] flex items-center justify-between">
                    <h3 className="font-bold text-lg text-white">My Resources</h3>
                    <Link className="text-sm font-medium text-[#135bec] hover:text-blue-400" href="/dashboard">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#282e39]/50 text-[#9da6b9] text-xs uppercase tracking-wider font-semibold">
                                <th className="px-6 py-3 font-semibold">Resource Name</th>
                                <th className="px-6 py-3 font-semibold">Subject</th>
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#282e39]">
                            {resources.length > 0 ? resources.map(res => (
                                <tr key={res.id} className="group hover:bg-[#282e39]/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-8 rounded flex items-center justify-center ${getFileIconBg(res.type)}`}>
                                                {getFileIcon(res.type)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{res.title}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{res.subject_code}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{new Date(res.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                            {res.type}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-[#9da6b9]">
                                        No resources uploaded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    )
}
