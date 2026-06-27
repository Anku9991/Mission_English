"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  LogOut,
  Trophy
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const sidebarLinks = [
  { name: "Dashboard", href: "/student", icon: LayoutDashboard },
  { name: "My Results", href: "/student/results", icon: Trophy },
  { name: "Settings", href: "/student/settings", icon: Settings },
]

export default function StudentSidebar() {
  const pathname = usePathname()
  const { logout, profile } = useAuth()

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link href="/student" className="flex items-center space-x-3 mb-10">
          <img src="/logo.png" alt="Mission English" className="w-10 h-10 object-contain bg-white rounded-full p-1" />
          <span className="text-xl font-bold text-white tracking-tight">Mission English</span>
        </Link>

        <nav className="space-y-2">
          {sidebarLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`) && link.href !== "/student"
            const isDashboardActive = pathname === "/student" && link.href === "/student"
            const active = isActive || isDashboardActive
            
            return (
              <Link key={link.name} href={link.href}>
                <span className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-slate-800 hover:text-white"
                )}>
                  <Icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-6">
        <div className="bg-slate-800 rounded-xl p-4 mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              {profile?.name?.[0] || profile?.phoneNumber?.slice(-1) || 'S'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{profile?.name || profile?.phoneNumber || 'Student'}</p>
              <p className="text-xs text-slate-400">Student</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>
        
        <div className="text-center text-xs text-slate-500 font-medium">
          Powered By Pihnexa Technologies
        </div>
      </div>
    </aside>
  )
}
