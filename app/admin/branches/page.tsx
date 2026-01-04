'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Plus, Trash2, Layers } from 'lucide-react'

type Branch = {
    id: string
    name: string
}

export default function ManageBranches() {
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const [newBranch, setNewBranch] = useState('')
    const [adding, setAdding] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchBranches()
    }, [])

    const fetchBranches = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('branches')
            .select('*')
            .order('name')

        if (data) setBranches(data)
        if (error) setError(error.message)
        setLoading(false)
    }

    const handleAdd = async () => {
        if (!newBranch.trim()) return
        setAdding(true)
        setError(null)

        const { error } = await supabase.from('branches').insert({ name: newBranch.trim() })

        if (!error) {
            setNewBranch('')
            fetchBranches()
        } else {
            setError(error.message)
        }
        setAdding(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This branch will be removed from the list.')) return
        setDeleting(id)
        const { error } = await supabase.from('branches').delete().eq('id', id)
        if (!error) {
            setBranches(prev => prev.filter(b => b.id !== id))
        } else {
            setError(error.message)
        }
        setDeleting(null)
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Layers className="text-blue-500" />
                        Manage Branches
                    </h1>
                    <p className="text-gray-400">Add or remove engineering branches available in the portal.</p>
                </header>

                <div className="bg-[#11161D] rounded-xl border border-gray-800 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-white mb-4">Add New Branch</h2>
                    <div className="flex gap-4">
                        <input
                            value={newBranch}
                            onChange={(e) => setNewBranch(e.target.value)}
                            placeholder="e.g. Aerospace Engineering"
                            className="flex-1 bg-[#0B0E14] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={adding || !newBranch.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {adding ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                            Add Branch
                        </button>
                    </div>
                    {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
                </div>

                <div className="bg-[#11161D] rounded-xl border border-gray-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800">
                        <h2 className="text-lg font-semibold text-white">Existing Branches ({branches.length})</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
                    ) : branches.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No branches found. Add one above.</div>
                    ) : (
                        <div className="divide-y divide-gray-800">
                            {branches.map(branch => (
                                <div key={branch.id} className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors group">
                                    <span className="text-gray-200 font-medium ml-2">{branch.name}</span>
                                    <button
                                        onClick={() => handleDelete(branch.id)}
                                        disabled={deleting === branch.id}
                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete Branch"
                                    >
                                        {deleting === branch.id ? <Loader2 className="animate-spin size-5" /> : <Trash2 size={20} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
