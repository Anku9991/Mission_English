"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Settings, 
  LogOut,
  Target,
  Trophy
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

const STUDENT_LINKS = [
  { name: "My Dashboard", href: "/student", icon: LayoutDashboard },
  { name: "My Courses", href: "/student/courses", icon: BookOpen },
  { name: "Test Series", href: "/student/tests", icon: Target },
  { name: "My Results", href: "/student/results", icon: Trophy },
  { name: "Profile", href: "/student/profile", icon: Settings },
]

export default function StudentSidebar() {
  const pathname = usePathname()
  const { logout, profile } = useAuth()

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2 text-slate-900 mb-8">
          <div className="bg-primary/10 p-2 rounded-xl">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">Mission English</span>
        </Link>

        <nav className="space-y-2">
          {STUDENT_LINKS.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/student')
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700 font-medium" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-blue-700" : "text-slate-400")} />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            {profile?.phoneNumber?.slice(-2) || 'St'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-900 truncate">Student User</p>
            <p className="text-xs text-slate-500 truncate">{profile?.phoneNumber}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
    </aside>
  )
}
