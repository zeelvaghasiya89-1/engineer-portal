'use client'

import { Download, Upload, User, Clock, ArrowRight } from 'lucide-react'

export default function ActivityPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-white">Activity Log</h1>
                <p className="text-[#9da6b9]">Track your recent interactions and contributions.</p>
            </div>

            <section className="bg-[#1C2333] rounded-xl border border-[#282e39] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#282e39]">
                    <h3 className="font-bold text-lg text-white">Recent Activity</h3>
                </div>
                <div className="p-6">
                    <div className="relative pl-6 border-l-2 border-[#282e39] space-y-8">
                        {/* Timeline Item 1 */}
                        <div className="relative group">
                            <span className="absolute -left-[31px] top-1 flex items-center justify-center size-8 rounded-full bg-[#135bec]/20 text-[#135bec] border-4 border-[#1C2333] group-hover:scale-110 transition-transform">
                                <Download className="w-4 h-4" />
                            </span>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm text-white">Downloaded <span className="font-medium text-[#135bec]">"Thermodynamics Ch.4"</span></p>
                                <span className="text-xs text-[#9da6b9] flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> 2 hours ago
                                </span>
                            </div>
                        </div>
                        {/* Timeline Item 2 */}
                        <div className="relative group">
                            <span className="absolute -left-[31px] top-1 flex items-center justify-center size-8 rounded-full bg-green-900/30 text-green-400 border-4 border-[#1C2333] group-hover:scale-110 transition-transform">
                                <Upload className="w-4 h-4" />
                            </span>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm text-white">Uploaded new resource <span className="font-medium text-green-400">"Field Notes"</span></p>
                                <span className="text-xs text-[#9da6b9] flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> 1 day ago
                                </span>
                            </div>
                        </div>
                        {/* Timeline Item 3 */}
                        <div className="relative group">
                            <span className="absolute -left-[31px] top-1 flex items-center justify-center size-8 rounded-full bg-purple-900/30 text-purple-400 border-4 border-[#1C2333] group-hover:scale-110 transition-transform">
                                <User className="w-4 h-4" />
                            </span>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm text-white">Updated profile information</p>
                                <span className="text-xs text-[#9da6b9] flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> 3 days ago
                                </span>
                            </div>
                        </div>
                        {/* Timeline Item 4 */}
                        <div className="relative group">
                            <span className="absolute -left-[31px] top-1 flex items-center justify-center size-8 rounded-full bg-yellow-900/30 text-yellow-400 border-4 border-[#1C2333] group-hover:scale-110 transition-transform">
                                <ArrowRight className="w-4 h-4" />
                            </span>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm text-white">Joined <span className="font-bold">EngineerHub</span></p>
                                <span className="text-xs text-[#9da6b9] flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> 1 week ago
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
