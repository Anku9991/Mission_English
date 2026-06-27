"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole?: "admin" | "student" }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (allowedRole && profile && profile.role !== allowedRole) {
        // Redirect to their respective dashboard if they try to access wrong route
        if (profile.role === "admin") router.push("/admin")
        if (profile.role === "student") router.push("/student")
      }
    }
  }, [user, profile, loading, router, allowedRole])

  if (loading || !user || (allowedRole && profile?.role !== allowedRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Authenticating...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
