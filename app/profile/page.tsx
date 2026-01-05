'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { User, LogOut, Save, Loader2, Search, Bell, Home, FolderOpen, Shield, History, CloudUpload, Download, Upload, Edit2 } from 'lucide-react'
import Link from 'next/link'

type Profile = {
    id: string
    full_name: string
    branch: string
    semester: number
    role: string
    email: string
    created_at?: string
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

    const [activeTab, setActiveTab] = useState('overview')

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

            const { data, error } = await supabase
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
            case 'Notes':
                return <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            case 'Papers':
                return <span className="material-symbols-outlined text-[20px]">description</span>
            default:
                return <span className="material-symbols-outlined text-[20px]">article</span>
        }
    }

    const getFileIconBg = (type: string) => {
        switch (type) {
            case 'Notes':
                return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            case 'Papers':
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            default:
                return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
        }
    }

    if (loading) {
        return <div className="min-h-screen bg-[#101622] text-white flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" />
        </div>
    }

    return (
        <div className="bg-[#101622] text-white min-h-screen flex flex-col font-sans">
            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-[#282e39] bg-[#1C2333] px-6 py-3 sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <Link href="/dashboard" className="flex items-center gap-4 text-white">
                        <div className="size-8 text-[#135bec]">
                            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"></path>
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-tight">EngineerHub</h2>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link className="text-[#9da6b9] hover:text-[#135bec] text-sm font-medium transition-colors" href="/dashboard">Resources</Link>
                        <Link className="text-[#9da6b9] hover:text-[#135bec] text-sm font-medium transition-colors" href="#">Community</Link>
                        <Link className="text-[#9da6b9] hover:text-[#135bec] text-sm font-medium transition-colors" href="#">Forum</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    {/* Search Bar */}
                    <div className="hidden sm:flex items-center w-64 h-10 rounded-lg bg-[#282e39] px-3 focus-within:ring-2 focus-within:ring-[#135bec]/50 transition-all">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input className="w-full bg-transparent border-none text-sm text-white placeholder-slate-400 focus:ring-0 focus:outline-none px-2" placeholder="Search resources..." type="text" />
                    </div>
                    {/* Notifications */}
                    <button className="flex items-center justify-center size-10 rounded-lg hover:bg-[#282e39] text-white transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-[#1C2333]"></span>
                    </button>
                    {/* User Menu Avatar */}
                    <div className="size-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center ring-2 ring-[#282e39]">
                        <User className="w-5 h-5 text-white" />
                    </div>
                </div>
            </header>

            {/* Main Content Layout */}
            <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* LEFT COLUMN: Sidebar */}
                    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
                        {/* Profile Identity Card */}
                        <div className="bg-[#1C2333] rounded-xl p-6 shadow-sm border border-[#282e39] flex flex-col items-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-[#135bec] opacity-30"></div>
                            <div className="relative mt-8 group cursor-pointer">
                                <div className="size-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center border-4 border-[#1C2333] shadow-md">
                                    <User className="w-12 h-12 text-white" />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit2 className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <h1 className="text-xl font-bold text-white">{profile?.full_name}</h1>
                                <p className="text-sm text-[#9da6b9]">{profile?.branch || 'Engineering'} Student</p>
                                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#135bec]/10 text-[#135bec] text-xs font-semibold">
                                    <span className="material-symbols-outlined text-[16px]">school</span>
                                    {profile?.role === 'admin' ? 'Administrator' : 'Student'}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full mt-6 pt-6 border-t border-[#282e39]">
                                <div className="flex flex-col items-center p-2 rounded-lg hover:bg-[#282e39]/50 transition-colors">
                                    <span className="text-lg font-bold text-white">{resources.length}</span>
                                    <span className="text-xs text-[#9da6b9]">Uploads</span>
                                </div>
                                <div className="flex flex-col items-center p-2 rounded-lg hover:bg-[#282e39]/50 transition-colors">
                                    <span className="text-lg font-bold text-white">450</span>
                                    <span className="text-xs text-[#9da6b9]">Reputation</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="bg-[#1C2333] rounded-xl p-3 shadow-sm border border-[#282e39]">
                            <ul className="flex flex-col gap-1">
                                <li>
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${activeTab === 'overview' ? 'bg-[#135bec] text-white' : 'text-[#9da6b9] hover:bg-[#282e39] transition-colors'}`}
                                    >
                                        <Home className="w-5 h-5" />
                                        Overview
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab('resources')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${activeTab === 'resources' ? 'bg-[#135bec] text-white' : 'text-[#9da6b9] hover:bg-[#282e39] transition-colors'}`}
                                    >
                                        <FolderOpen className="w-5 h-5" />
                                        My Resources
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab('security')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${activeTab === 'security' ? 'bg-[#135bec] text-white' : 'text-[#9da6b9] hover:bg-[#282e39] transition-colors'}`}
                                    >
                                        <Shield className="w-5 h-5" />
                                        Security
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab('activity')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${activeTab === 'activity' ? 'bg-[#135bec] text-white' : 'text-[#9da6b9] hover:bg-[#282e39] transition-colors'}`}
                                    >
                                        <History className="w-5 h-5" />
                                        Activity Log
                                    </button>
                                </li>
                            </ul>
                        </nav>

                        {/* Storage Widget */}
                        <div className="bg-gradient-to-br from-[#135bec] to-blue-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden hidden lg:block">
                            <CloudUpload className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
                            <h3 className="font-bold text-lg mb-1">Contribute More!</h3>
                            <p className="text-sm text-blue-100 mb-4">Upload verified notes to earn reputation badges.</p>
                            <Link href={profile?.role === 'admin' ? '/admin/upload' : '/dashboard'} className="block w-full py-2 bg-white text-[#135bec] text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm text-center">
                                Upload Resource
                            </Link>
                        </div>
                    </aside>

                    {/* RIGHT COLUMN: Main Content */}
                    <main className="flex-1 flex flex-col gap-6 min-w-0">
                        {/* Header & Breadcrumbs */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-2 text-sm text-[#9da6b9]">
                                <Link className="hover:text-[#135bec] transition-colors" href="/dashboard">Home</Link>
                                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                <Link className="hover:text-[#135bec] transition-colors" href="#">Users</Link>
                                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
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

                        {/* Activity Timeline */}
                        <section className="bg-[#1C2333] rounded-xl border border-[#282e39] overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#282e39]">
                                <h3 className="font-bold text-lg text-white">Recent Activity</h3>
                            </div>
                            <div className="p-6">
                                <div className="relative pl-6 border-l-2 border-[#282e39] space-y-8">
                                    {/* Timeline Item 1 */}
                                    <div className="relative">
                                        <span className="absolute -left-[31px] top-1 flex items-center justify-center size-8 rounded-full bg-[#135bec]/20 text-[#135bec] border-4 border-[#1C2333]">
                                            <Download className="w-4 h-4" />
                                        </span>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm text-white">Downloaded <span className="font-medium">"Thermodynamics Ch.4"</span></p>
                                            <span className="text-xs text-[#9da6b9]">2 hours ago</span>
                                        </div>
                                    </div>
                                    {/* Timeline Item 2 */}
                                    <div className="relative">
                                        <span className="absolute -left-[31px] top-1 flex items-center justify-center size-8 rounded-full bg-green-900/30 text-green-400 border-4 border-[#1C2333]">
                                            <Upload className="w-4 h-4" />
                                        </span>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm text-white">Uploaded new resource <span className="font-medium">"Field Notes"</span></p>
                                            <span className="text-xs text-[#9da6b9]">1 day ago</span>
                                        </div>
                                    </div>
                                    {/* Timeline Item 3 */}
                                    <div className="relative">
                                        <span className="absolute -left-[31px] top-1 flex items-center justify-center size-8 rounded-full bg-purple-900/30 text-purple-400 border-4 border-[#1C2333]">
                                            <User className="w-4 h-4" />
                                        </span>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm text-white">Updated profile information</p>
                                            <span className="text-xs text-[#9da6b9]">3 days ago</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    )
}
