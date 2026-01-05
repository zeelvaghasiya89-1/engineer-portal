'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { X, FolderInput, Loader2, Folder } from 'lucide-react'
import { FolderType } from './FolderTree'

type Props = {
    isOpen: boolean
    onClose: () => void
    onMoved: () => void
    resourceId: string | null
    currentFolderId: string | null
    folders: FolderType[]
}

export default function MoveToFolderModal({ isOpen, onClose, onMoved, resourceId, currentFolderId, folders }: Props) {
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    if (!isOpen || !resourceId) return null

    const handleMove = async () => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('resources')
                .update({ folder_id: selectedFolder })
                .eq('id', resourceId)

            if (error) throw error
            onMoved()
            onClose()
        } catch (err) {
            console.error('Move failed:', err)
            alert('Failed to move resource')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#1a1d24] border border-[#282e39] rounded-2xl w-full max-w-md mx-4 shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#282e39]">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-[#135bec]/20 flex items-center justify-center text-[#135bec]">
                            <FolderInput className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-white">Move to Folder</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#282e39] text-[#9da6b9] hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar mb-6">
                        {/* Root Option */}
                        <button
                            onClick={() => setSelectedFolder(null)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${selectedFolder === null
                                    ? 'bg-[#135bec]/20 border-[#135bec] text-white'
                                    : 'bg-[#111318] border-[#282e39] text-[#9da6b9] hover:bg-[#282e39]'
                                }`}
                        >
                            <span className="material-symbols-outlined">home</span>
                            <span className="font-medium">All Files (Root)</span>
                            {currentFolderId === null && <span className="ml-auto text-xs opacity-50">(Current)</span>}
                        </button>

                        {/* Folders */}
                        {folders.map(folder => (
                            <button
                                key={folder.id}
                                onClick={() => setSelectedFolder(folder.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${selectedFolder === folder.id
                                        ? 'bg-[#135bec]/20 border-[#135bec] text-white'
                                        : 'bg-[#111318] border-[#282e39] text-[#9da6b9] hover:bg-[#282e39]'
                                    }`}
                            >
                                <span className="material-symbols-outlined" style={{ color: folder.color }}>folder</span>
                                <span className="font-medium">{folder.name}</span>
                                {currentFolderId === folder.id && <span className="ml-auto text-xs opacity-50">(Current)</span>}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-lg bg-[#282e39] hover:bg-[#323946] text-white font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleMove}
                            disabled={loading || selectedFolder === currentFolderId}
                            className="flex-1 py-3 rounded-lg bg-[#135bec] hover:bg-[#1d66f0] text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Moving...
                                </>
                            ) : (
                                <>
                                    <FolderInput className="w-4 h-4" />
                                    Move Here
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
