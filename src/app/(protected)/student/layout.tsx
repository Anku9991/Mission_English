import StudentSidebar from "@/components/StudentSidebar"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRole="student">
      <div className="flex min-h-screen bg-slate-50">
        <StudentSidebar />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
