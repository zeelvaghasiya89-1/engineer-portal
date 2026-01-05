'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { ArrowLeft, Bell, Info, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'

type Notification = {
    id: string
    message: string
    type: 'info' | 'warning' | 'success'
    created_at: string
}

export default function UserNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50) // Show last 50

            if (data) setNotifications(data)
            setLoading(false)
        }
        fetchNotifications()
    }, [])

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
        <div className="min-h-screen bg-[#0B0E14] flex justify-center items-center">
            <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        </div>
    )

    return (
        <div className="min-h-screen bg-[#0B0E14] text-white p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#9da6b9] hover:text-white transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 size-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                            <Bell className="text-white size-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Notifications</h1>
                            <p className="text-[#9da6b9]">Stay updated with the latest announcements.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-16 bg-[#1a1d24] rounded-2xl border border-[#282e39]">
                            <Bell className="w-12 h-12 mx-auto mb-4 text-[#9da6b9] opacity-50" />
                            <h3 className="text-lg font-medium text-white mb-2">All caught up!</h3>
                            <p className="text-[#9da6b9]">No notifications to display at the moment.</p>
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div key={n.id} className="bg-[#1a1d24] border border-[#282e39] p-5 rounded-xl flex items-start gap-4 hover:border-[#135bec]/50 transition-colors animate-in fade-in slide-in-from-bottom-2">
                                <div className={`p-3 rounded-lg border shrink-0 ${getTypeStyles(n.type)}`}>
                                    {getTypeIcon(n.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium text-lg leading-snug mb-2">{n.message}</p>
                                    <p className="text-sm text-[#9da6b9] flex items-center gap-2">
                                        <span>{new Date(n.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        <span>•</span>
                                        <span>{new Date(n.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
