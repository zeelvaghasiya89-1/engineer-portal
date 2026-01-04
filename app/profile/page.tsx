'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { User, LogOut, ArrowLeft, Save, Loader2 } from 'lucide-react'
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

export default function ProfilePage() {
    const router = useRouter()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [branches, setBranches] = useState<Branch[]>([])

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

    if (loading) {
        return <div className="min-h-screen bg-[#0B0E14] text-white flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" />
        </div>
    }

    return (
        <div className="min-h-screen bg-[#0B0E14] text-white font-sans">
            <div className="max-w-2xl mx-auto p-4 md:p-6 pt-10 md:pt-12">

                <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 md:mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </Link>

                <div className="bg-[#11161D] rounded-2xl border border-gray-800 p-6 md:p-8 shadow-2xl">
                    <div className="flex items-center gap-6 mb-8 md:mb-10">
                        <div className="size-20 md:size-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white ring-4 ring-gray-800 shadow-xl">
                            <User size={40} className="md:w-12 md:h-12" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                {profile?.full_name}
                            </h1>
                            <p className="text-gray-500 text-sm md:text-base">{profile?.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20 capitalize">
                                {profile?.role}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formFullName}
                                    onChange={(e) => setFormFullName(e.target.value)}
                                    className="w-full bg-[#0B0E14] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Branch</label>
                                <div className="relative">
                                    <select
                                        value={formBranch}
                                        onChange={(e) => setFormBranch(e.target.value)}
                                        className="w-full bg-[#0B0E14] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer transition-all"
                                    >
                                        <option value="">Select Branch</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.name}>{b.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Semester</label>
                                <div className="relative">
                                    <select
                                        value={formSemester}
                                        onChange={(e) => setFormSemester(e.target.value)}
                                        className="w-full bg-[#0B0E14] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer transition-all"
                                    >
                                        <option value="">Select Semester</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row gap-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 "
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                Save Changes
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="flex-1 bg-[#1C2333] hover:bg-[#252D3F] text-gray-300 font-medium py-3 px-6 rounded-xl border border-gray-700 transition-all flex items-center justify-center gap-2"
                            >
                                <LogOut size={20} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
