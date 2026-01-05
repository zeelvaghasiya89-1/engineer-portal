'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Bell, Trash2, Plus, Info, AlertTriangle, CheckCircle, X } from 'lucide-react'

type Notification = {
    id: string
    message: string
    type: 'info' | 'warning' | 'success'
    created_at: string
}

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newMessage, setNewMessage] = useState('')
    const [newType, setNewType] = useState<'info' | 'warning' | 'success'>('info')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setNotifications(data)
        if (error) console.error('Error fetching notifications:', error)
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this notification?')) return
        setDeletingId(id)

        const { error } = await supabase.from('notifications').delete().eq('id', id)

        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== id))
        } else {
            alert('Failed to delete')
        }
        setDeletingId(null)
    }

    const handleCreate = async () => {
        if (!newMessage.trim()) return
        setCreating(true)

        const { data, error } = await supabase
            .from('notifications')
            .insert({
                message: newMessage,
                type: newType,
                created_by: (await supabase.auth.getUser()).data.user?.id
            })
            .select()
            .single()

        if (data) {
            setNotifications([data, ...notifications])
            setShowCreateModal(false)
            setNewMessage('')
            setNewType('info')
        } else {
            alert('Failed to create notification: ' + error?.message)
        }
        setCreating(false)
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
            default: return <Info className="w-5 h-5 text-blue-500" />
        }
    }

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'success': return 'bg-green-500/10 text-green-500 border-green-500/20'
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        }
    }

    if (loading) return (
        <div className="flex-1 flex justify-center items-center h-full">
            <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        </div>
    )

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Notifications</h1>
                        <p className="text-[#9da6b9]">Broadcast messages to all students dashboard.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-[#135bec] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Message
                    </button>
                </div>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12 text-[#9da6b9] bg-[#1a1d24] rounded-xl border border-[#282e39]">
                            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No active notifications.</p>
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div key={n.id} className="group bg-[#1a1d24] border border-[#282e39] p-5 rounded-xl flex items-start gap-4 hover:border-[#135bec]/50 transition-colors">
                                <div className={`p-3 rounded-lg border ${getTypeStyles(n.type)}`}>
                                    {getTypeIcon(n.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium text-lg mb-1">{n.message}</p>
                                    <p className="text-sm text-[#9da6b9]">
                                        {new Date(n.created_at).toLocaleString()} • <span className="uppercase text-xs font-bold tracking-wider">{n.type}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(n.id)}
                                    disabled={deletingId === n.id}
                                    className="p-2 text-[#9da6b9] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                                >
                                    {deletingId === n.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1a1d24] w-full max-w-md rounded-2xl border border-[#282e39] shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#282e39] flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Send Notification</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-[#9da6b9] hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#9da6b9] mb-1.5">Message</label>
                                <textarea
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    className="w-full h-32 bg-[#0B0E14] border border-[#282e39] rounded-lg p-3 text-white focus:border-[#135bec] outline-none resize-none"
                                    placeholder="Type your announcement here..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#9da6b9] mb-1.5">Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['info', 'warning', 'success'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewType(type)}
                                            className={`py-2 px-3 rounded-lg border capitalize text-sm font-medium transition-all ${newType === type
                                                    ? getTypeStyles(type) + ' border-current ring-1 ring-current'
                                                    : 'border-[#282e39] text-[#9da6b9] hover:bg-[#282e39]'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={handleCreate}
                                disabled={creating || !newMessage.trim()}
                                className="w-full py-3 bg-[#135bec] hover:bg-blue-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Broadcast'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
