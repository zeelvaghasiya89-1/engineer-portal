import AdminSidebar from '@/app/components/AdminSidebar'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex bg-[#0B0E14] min-h-screen text-white font-sans">
            <AdminSidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden pt-16 lg:pt-0 relative">
                {children}
            </main>
        </div>
    )
}
