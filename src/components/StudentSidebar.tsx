"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Settings, 
  LogOut,
  Trophy,
  GraduationCap
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
  const studentProfile = profile?.role === 'student' ? profile : null;

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shadow-sm z-40">
      <div className="p-6">
        <Link href="/student" className="flex items-center space-x-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-md">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">Mission English</span>
        </Link>

        <nav className="space-y-1.5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2 mt-8">My Learning</div>
          {sidebarLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`) && link.href !== "/student"
            const isDashboardActive = pathname === "/student" && link.href === "/student"
            const active = isActive || isDashboardActive
            
            return (
              <Link key={link.name} href={link.href}>
                <span className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group",
                  active 
                    ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 transition-colors", 
                    active ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"
                  )} />
                  <span>{link.name}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-5 rounded-full bg-indigo-600" />
                  )}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-6">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold shadow-md">
              {studentProfile?.fullName?.[0] || studentProfile?.phone?.slice(-1) || 'S'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">{studentProfile?.fullName || studentProfile?.phone || 'Student'}</p>
              <p className="text-xs text-slate-500 font-medium">Student</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-center text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-red-600 transition-colors rounded-xl font-bold h-10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>
        
        <div className="text-center text-[10px] text-slate-400 font-bold tracking-widest uppercase">
          Powered By Pihnexa
        </div>
      </div>
    </aside>
  )
}
