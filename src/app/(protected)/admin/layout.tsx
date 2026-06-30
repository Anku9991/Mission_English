import AdminSidebar from "@/components/AdminSidebar"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import NotificationPanel from "@/components/NotificationPanel"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRole="admin">
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 overflow-x-hidden">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full relative">
          <NotificationPanel />
          <div className="max-w-6xl mx-auto pt-10 md:pt-0">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
