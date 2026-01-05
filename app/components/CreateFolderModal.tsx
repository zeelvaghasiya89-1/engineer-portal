'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { X, FolderPlus, Loader2, ChevronRight } from 'lucide-react'

type Folder = {
    id: string
    name: string
    parent_id: string | null
    color: string
}

type Props = {
    isOpen: boolean
    onClose: () => void
    onFolderCreated: () => void
    parentFolder?: Folder | null
    existingFolders: Folder[]
}

export default function CreateFolderModal({ isOpen, onClose, onFolderCreated, parentFolder, existingFolders }: Props) {
    const [name, setName] = useState('')
    const [color, setColor] = useState('#135bec')
    const [selectedParent, setSelectedParent] = useState<string | null>(parentFolder?.id || null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const colors = [
        '#135bec', // Blue
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#8b5cf6', // Purple
        '#ec4899', // Pink
        '#06b6d4', // Cyan
        '#6b7280', // Gray
    ]

    useEffect(() => {
        if (parentFolder) {
            setSelectedParent(parentFolder.id)
        }
    }, [parentFolder])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            setError('Please enter a folder name')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                throw new Error('You must be logged in')
            }

            const { error: insertError } = await supabase
                .from('folders')
                .insert({
                    name: name.trim(),
                    parent_id: selectedParent,
                    created_by: user.id,
                    color
                })

            if (insertError) throw insertError

            setName('')
            setColor('#135bec')
            setSelectedParent(null)
            onFolderCreated()
            onClose()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    // Get root folders for parent selection
    const rootFolders = existingFolders.filter(f => !f.parent_id)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-[#1a1d24] border border-[#282e39] rounded-2xl w-full max-w-md mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#282e39]">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-[#135bec]/20 flex items-center justify-center text-[#135bec]">
                            <FolderPlus className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-white">Create New Folder</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[#282e39] text-[#9da6b9] hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleCreate} className="p-6 space-y-5">
                    {/* Folder Name */}
                    <div>
                        <label className="block text-sm font-medium text-[#9da6b9] mb-2">
                            Folder Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter folder name..."
                            className="w-full bg-[#111318] border border-[#282e39] rounded-lg px-4 py-3 text-white placeholder:text-[#9da6b9] focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] outline-none transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Parent Folder */}
                    <div>
                        <label className="block text-sm font-medium text-[#9da6b9] mb-2">
                            Location
                        </label>
                        <select
                            value={selectedParent || ''}
                            onChange={(e) => setSelectedParent(e.target.value || null)}
                            className="w-full bg-[#111318] border border-[#282e39] rounded-lg px-4 py-3 text-white focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] outline-none appearance-none cursor-pointer transition-all"
                        >
                            <option value="">📁 Root (My Folders)</option>
                            {rootFolders.map(folder => (
                                <option key={folder.id} value={folder.id}>
                                    └ 📁 {folder.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-medium text-[#9da6b9] mb-2">
                            Folder Color
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`size-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1d24] scale-110' : 'hover:scale-105'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-[#111318] rounded-lg p-4 border border-[#282e39]">
                        <p className="text-xs text-[#9da6b9] mb-2">Preview</p>
                        <div className="flex items-center gap-3">
                            <div
                                className="size-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${color}20` }}
                            >
                                <span className="material-symbols-outlined text-[22px]" style={{ color }}>folder</span>
                            </div>
                            <span className="text-white font-medium">{name || 'Untitled Folder'}</span>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-lg bg-[#282e39] hover:bg-[#323946] text-white font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="flex-1 py-3 rounded-lg bg-[#135bec] hover:bg-[#1d66f0] text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <FolderPlus className="w-4 h-4" />
                                    Create Folder
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
