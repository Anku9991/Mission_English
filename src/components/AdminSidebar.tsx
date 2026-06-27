"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

const ADMIN_LINKS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Courses & Tests", href: "/admin/tests", icon: BookOpen },
  { name: "Students", href: "/admin/students", icon: Users },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout, profile } = useAuth()

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2 text-white mb-8">
          <div className="bg-primary p-2 rounded-xl">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Mission Admin</span>
        </Link>

        <nav className="space-y-2">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/admin')
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                  isActive 
                    ? "bg-primary/20 text-primary font-medium" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-400")} />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">
            {profile?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{profile?.email || 'Admin'}</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
    </aside>
  )
}
