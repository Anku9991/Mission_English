"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Settings, 
  LogOut,
  Trophy,
  Menu,
  X
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
  const [isOpen, setIsOpen] = useState(false)

  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-card border-b border-border p-4 sticky top-0 z-40 shadow-sm w-full">
        <Link href="/student" className="flex items-center">
          <img src="/logo.jpeg" alt="Mission English Logo" className="h-8 object-contain" />
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-muted-foreground bg-secondary/50 hover:bg-secondary rounded-lg border border-border">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/50 z-40 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "w-72 bg-card border-r border-border flex flex-col h-screen fixed md:sticky top-0 shadow-sm z-50 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
      <div className="p-6">
        <Link href="/student" className="flex items-center mb-8 px-2 group">
          <img 
            src="/logo.jpeg" 
            alt="Mission English Logo" 
            className="w-auto h-12 object-contain" 
          />
        </Link>

        <nav className="space-y-1.5">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2 mt-8">My Learning</div>
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
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 transition-colors", 
                    active ? "text-indigo-600" : "text-muted-foreground group-hover:text-indigo-500"
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
        <div className="bg-secondary/50 border border-border rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold shadow-md">
              {studentProfile?.fullName?.[0] || studentProfile?.phone?.slice(-1) || 'S'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-foreground truncate">{studentProfile?.fullName || studentProfile?.phone || 'Student'}</p>
              <p className="text-xs text-muted-foreground font-medium">Student</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-center text-muted-foreground border-border hover:bg-secondary hover:text-red-600 transition-colors rounded-xl font-bold h-10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>
        
        <div className="text-center space-y-1.5 mt-2">
          <p className="text-[10px] text-indigo-600 font-semibold italic leading-snug px-1">"The Only Institute Where You Can Learn English From Basic to Advanced."</p>
          <div className="text-[10px] text-muted-foreground font-medium">
            <p>Director - Ajay Das</p>
            <p>Station Para South, Dinhata</p>
            <p>Coochbehar (736135)</p>
          </div>
          <div className="pt-3 text-[9px] text-muted-foreground font-bold tracking-widest uppercase border-t border-border mt-2">
            Powered By Pihnexa
          </div>
        </div>
      </div>
      </aside>
    </>
  )
}
