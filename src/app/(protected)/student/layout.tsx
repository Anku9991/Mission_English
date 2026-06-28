import StudentSidebar from "@/components/StudentSidebar"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRole="student">
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 overflow-x-hidden">
        <StudentSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
