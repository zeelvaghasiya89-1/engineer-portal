'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Plus, Trash2, X } from 'lucide-react'

type Branch = {
    id: string
    name: string
}

export default function ManageBranchesModal({ isOpen, onClose, onUpdate }: { isOpen: boolean, onClose: () => void, onUpdate: () => void }) {
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const [newBranch, setNewBranch] = useState('')
    const [adding, setAdding] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            fetchBranches()
        }
    }, [isOpen])

    const fetchBranches = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('branches')
            .select('*')
            .order('name')

        if (data) setBranches(data)
        setLoading(false)
    }

    const handleAdd = async () => {
        if (!newBranch.trim()) return
        setAdding(true)
        const { error } = await supabase.from('branches').insert({ name: newBranch.trim() })
        if (!error) {
            setNewBranch('')
            fetchBranches()
            onUpdate()
        }
        setAdding(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This branch will be removed from the list.')) return
        setDeleting(id)
        const { error } = await supabase.from('branches').delete().eq('id', id)
        if (!error) {
            fetchBranches()
            onUpdate()
        }
        setDeleting(null)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#161B22] rounded-xl shadow-2xl w-full max-w-md border border-gray-700 flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Manage Branches</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 flex gap-2 border-b border-gray-700">
                    <input
                        value={newBranch}
                        onChange={(e) => setNewBranch(e.target.value)}
                        placeholder="New Branch Name..."
                        className="flex-1 bg-[#0B0E14] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={adding || !newBranch.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg disabled:opacity-50"
                    >
                        {adding ? <Loader2 className="animate-spin size-5" /> : <Plus size={20} />}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-500" /></div>
                    ) : branches.length === 0 ? (
                        <div className="text-gray-500 text-center p-4">No branches found.</div>
                    ) : (
                        branches.map(b => (
                            <div key={b.id} className="flex justify-between items-center p-3 hover:bg-gray-800 rounded-lg group text-gray-300">
                                <span>{b.name}</span>
                                <button
                                    onClick={() => handleDelete(b.id)}
                                    disabled={deleting === b.id}
                                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    {deleting === b.id ? <Loader2 className="animate-spin size-4" /> : <Trash2 size={16} />}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
