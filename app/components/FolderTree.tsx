'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Folder, ChevronRight, ChevronDown, MoreVertical, Trash2, Edit2, FolderPlus, Loader2 } from 'lucide-react'

export type FolderType = {
    id: string
    name: string
    parent_id: string | null
    color: string
    created_by: string
}

type Props = {
    folders: FolderType[]
    selectedFolder: string | null
    onSelectFolder: (folderId: string | null) => void
    onCreateFolder: (parentId?: string) => void
    onFoldersChange: () => void
    isAdmin: boolean
}

export default function FolderTree({ folders, selectedFolder, onSelectFolder, onCreateFolder, onFoldersChange, isAdmin }: Props) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
    const [contextMenu, setContextMenu] = useState<{ folderId: string, x: number, y: number } | null>(null)
    const [editingFolder, setEditingFolder] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [deleting, setDeleting] = useState<string | null>(null)

    // Build folder tree
    const buildTree = (parentId: string | null = null): FolderType[] => {
        return folders.filter(f => f.parent_id === parentId)
    }

    const toggleExpand = (folderId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setExpandedFolders(prev => {
            const next = new Set(prev)
            if (next.has(folderId)) {
                next.delete(folderId)
            } else {
                next.add(folderId)
            }
            return next
        })
    }

    const handleRightClick = (e: React.MouseEvent, folderId: string) => {
        if (!isAdmin) return
        e.preventDefault()
        setContextMenu({ folderId, x: e.clientX, y: e.clientY })
    }

    const handleDelete = async (folderId: string) => {
        if (!confirm('Delete this folder and all its contents?')) return
        setDeleting(folderId)
        setContextMenu(null)

        try {
            const { error } = await supabase
                .from('folders')
                .delete()
                .eq('id', folderId)

            if (error) throw error

            if (selectedFolder === folderId) {
                onSelectFolder(null)
            }
            onFoldersChange()
        } catch (err) {
            console.error('Delete failed:', err)
            alert('Failed to delete folder')
        } finally {
            setDeleting(null)
        }
    }

    const handleRename = async (folderId: string) => {
        if (!editName.trim()) {
            setEditingFolder(null)
            return
        }

        try {
            const { error } = await supabase
                .from('folders')
                .update({ name: editName.trim() })
                .eq('id', folderId)

            if (error) throw error
            onFoldersChange()
        } catch (err) {
            console.error('Rename failed:', err)
        } finally {
            setEditingFolder(null)
            setEditName('')
        }
    }

    const startRename = (folder: FolderType) => {
        setEditingFolder(folder.id)
        setEditName(folder.name)
        setContextMenu(null)
    }

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClick = () => setContextMenu(null)
        window.addEventListener('click', handleClick)
        return () => window.removeEventListener('click', handleClick)
    }, [])

    const renderFolder = (folder: FolderType, level: number = 0) => {
        const children = buildTree(folder.id)
        const hasChildren = children.length > 0
        const isExpanded = expandedFolders.has(folder.id)
        const isSelected = selectedFolder === folder.id

        return (
            <div key={folder.id} className="relative">
                <div
                    onClick={() => onSelectFolder(folder.id)}
                    onContextMenu={(e) => handleRightClick(e, folder.id)}
                    className={`
                        group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
                        ${isSelected
                            ? 'bg-[#135bec]/20 text-white'
                            : 'text-[#9da6b9] hover:bg-[#282e39] hover:text-white'
                        }
                    `}
                    style={{ paddingLeft: `${12 + level * 16}px` }}
                >
                    {/* Expand/Collapse */}
                    {hasChildren ? (
                        <button
                            onClick={(e) => toggleExpand(folder.id, e)}
                            className="p-0.5 hover:bg-white/10 rounded transition-colors"
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>
                    ) : (
                        <div className="w-5" />
                    )}

                    {/* Folder Icon */}
                    <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ color: folder.color }}
                    >
                        {isExpanded ? 'folder_open' : 'folder'}
                    </span>

                    {/* Name */}
                    {editingFolder === folder.id ? (
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => handleRename(folder.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename(folder.id)
                                if (e.key === 'Escape') setEditingFolder(null)
                            }}
                            className="flex-1 bg-transparent border-b border-[#135bec] text-white text-sm outline-none py-0.5"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span className="flex-1 text-sm font-medium truncate">{folder.name}</span>
                    )}

                    {/* Loading indicator */}
                    {deleting === folder.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                    )}

                    {/* Action buttons - always visible when selected (admin only) */}
                    {isAdmin && !editingFolder && deleting !== folder.id && (
                        <div className={`flex items-center gap-0.5 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                            <MoreVertical className="w-4 h-4" />
                        </div>
                    )}
                </div>

                {/* Floating Action Menu - shows when folder is selected */}
                {isAdmin && isSelected && !editingFolder && deleting !== folder.id && (
                    <div
                        className="absolute right-0 top-0 flex flex-col bg-[#1a1d24] border border-[#282e39] rounded-lg shadow-2xl overflow-hidden z-50"
                        style={{ transform: 'translateX(calc(100% + 8px))' }}
                    >
                        {/* Add Subfolder */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onCreateFolder(folder.id)
                            }}
                            className="flex items-center justify-center p-2.5 hover:bg-[#282e39] text-[#9da6b9] hover:text-white transition-colors border-b border-[#282e39]"
                            title="Add Subfolder"
                        >
                            <FolderPlus className="w-4 h-4" />
                        </button>
                        {/* Rename */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                startRename(folder)
                            }}
                            className="flex items-center justify-center p-2.5 hover:bg-[#282e39] text-[#9da6b9] hover:text-white transition-colors border-b border-[#282e39]"
                            title="Rename"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Delete */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(folder.id)
                            }}
                            className="flex items-center justify-center p-2.5 hover:bg-red-500/20 text-[#9da6b9] hover:text-red-400 transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div>
                        {children.map(child => renderFolder(child, level + 1))}
                    </div>
                )}
            </div>
        )
    }

    const rootFolders = buildTree(null)

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-[#9da6b9] uppercase tracking-wider">My Folders</h3>
                {isAdmin && (
                    <button
                        onClick={() => onCreateFolder()}
                        className="p-1 rounded hover:bg-[#282e39] text-[#9da6b9] hover:text-white transition-colors"
                        title="New Folder"
                    >
                        <FolderPlus className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* All Files option */}
            <div
                onClick={() => onSelectFolder(null)}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all mb-1
                    ${selectedFolder === null
                        ? 'bg-[#135bec]/20 text-white'
                        : 'text-[#9da6b9] hover:bg-[#282e39] hover:text-white'
                    }
                `}
            >
                <div className="w-5" />
                <span className="material-symbols-outlined text-[20px] text-[#9da6b9]">home</span>
                <span className="text-sm font-medium">All Files</span>
            </div>

            {/* Folder Tree */}
            {rootFolders.length > 0 ? (
                rootFolders.map(folder => renderFolder(folder))
            ) : (
                <p className="text-xs text-[#9da6b9] text-center py-4 italic">
                    No folders yet
                </p>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed bg-[#1a1d24] border border-[#282e39] rounded-lg shadow-2xl py-1 z-50 min-w-[160px]"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => {
                            onCreateFolder(contextMenu.folderId)
                            setContextMenu(null)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-[#282e39] transition-colors"
                    >
                        <FolderPlus className="w-4 h-4" />
                        New Subfolder
                    </button>
                    <button
                        onClick={() => {
                            const folder = folders.find(f => f.id === contextMenu.folderId)
                            if (folder) startRename(folder)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-[#282e39] transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Rename
                    </button>
                    <div className="h-px bg-[#282e39] my-1" />
                    <button
                        onClick={() => handleDelete(contextMenu.folderId)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            )}
        </div>
    )
}
