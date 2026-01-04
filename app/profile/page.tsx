'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function Profile() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)

    // Form State
    const [fullName, setFullName] = useState('')
    const [branch, setBranch] = useState('')
    const [semester, setSemester] = useState<number | ''>('')
    const [role, setRole] = useState('')

    // Feedback
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profile) {
                setFullName(profile.full_name || '')
                setBranch(profile.branch || '')
                setSemester(profile.semester || '')
                setRole(profile.role || 'student')
            }
            setLoading(false)
        }

        getProfile()
    }, [router])

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    branch: branch,
                    semester: semester ? Number(semester) : null
                })
                .eq('id', user.id)

            if (error) throw error
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
            router.refresh()
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update profile' })
        } finally {
            setSaving(false)
        }
    }

    const semesters = [1, 2, 3, 4, 5, 6, 7, 8]
    const branches = ['Computer Science', 'Mechanical', 'Civil', 'Electrical', 'Electronics']

    if (loading) return <div className="flex justify-center items-center h-screen bg-background-dark text-white">Loading profile...</div>

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white pb-10">
            {/* Navbar (Simplified) */}
            <nav className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#1C2333] border-b border-border-dark">
                <div className="flex items-center gap-2">
                    <Link href="/dashboard" className="text-primary font-bold text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Dashboard
                    </Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto p-6 mt-8">
                <div className="bg-white dark:bg-[#1C2333] rounded-xl border border-slate-200 dark:border-[#282e39] overflow-hidden shadow-lg">
                    <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <div className="px-8 pb-8">
                        <div className="relative -mt-16 mb-6 flex justify-between items-end">
                            <div className="size-32 rounded-full border-4 border-white dark:border-[#1C2333] bg-gray-700 flex items-center justify-center text-5xl">
                                <span className="material-symbols-outlined text-white" style={{ fontSize: '64px' }}>person</span>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h1 className="text-2xl font-bold">{fullName || 'Student'}</h1>
                            <p className="text-slate-500">{user.email}</p>
                        </div>

                        {message && (
                            <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-400 uppercase">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-[#282e39] border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-white"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-400 uppercase">Email (Read Only)</label>
                                <input
                                    type="text"
                                    value={user.email}
                                    disabled
                                    className="w-full bg-slate-50 dark:bg-[#282e39]/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-400 uppercase">Role (Read Only)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={role}
                                        disabled
                                        className="w-full bg-slate-50 dark:bg-[#282e39]/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed capitalize"
                                    />
                                    {/* Helper text or link could go here */}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-400 uppercase">Branch</label>
                                <select
                                    value={branch}
                                    onChange={(e) => setBranch(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-[#282e39] border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-white appearance-none cursor-pointer"
                                >
                                    <option value="">Select Branch</option>
                                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-400 uppercase">Semester</label>
                                <select
                                    value={semester}
                                    onChange={(e) => setSemester(Number(e.target.value))}
                                    className="w-full bg-slate-50 dark:bg-[#282e39] border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-white appearance-none cursor-pointer"
                                >
                                    <option value="">Select Semester</option>
                                    {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                            >
                                {saving && <Loader2 className="animate-spin size-5" />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
