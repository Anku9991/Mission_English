"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  BookOpen, Mail, ShieldCheck, GraduationCap,
  Loader2, KeyRound, User, ArrowRight, Eye, EyeOff
} from "lucide-react"

export default function LoginPage() {
  const [role, setRole] = useState<"student" | "admin">("student")
  const [studentId, setStudentId] = useState("")
  const [pin, setPin] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("")
  const [error, setError] = useState("")

  const { user, profile, optimisticLogin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Prefetch routes for instant navigation
    router.prefetch("/student")
    router.prefetch("/admin")
    
    if (user && profile) {
      if (profile.role === "admin") router.push("/admin")
      else router.push("/student")
    }
  }, [user, profile, router])

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !pin) {
      setError("Please enter both Student ID and PIN")
      return
    }
    setError("")
    setLoading(true)
    setLoadingText("Authenticating...")
    try {
      const formattedStudentId = studentId.toUpperCase().trim()
      const mappedEmail = `${formattedStudentId}@me.com`
      const firebasePassword = `${pin}ME`

      // Sign in
      const cred = await signInWithEmailAndPassword(auth, mappedEmail, firebasePassword)
      
      // Optimistic cache for lightning fast dashboard render
      const optimisticProfile = {
        studentId: formattedStudentId,
        role: "student",
        fullName: "Student",
        phone: "",
        course: "Loading...",
        batch: "",
      }
      localStorage.setItem(`me_profile_${cred.user.uid}`, JSON.stringify(optimisticProfile))
      
      // Update lastLogin silently in background
      updateDoc(doc(db, "students", formattedStudentId), { lastLogin: Date.now() }).catch(() => {})
      
      // Force sync state update
      optimisticLogin(cred.user, optimisticProfile as any)
      
      // Navigate instantly
      router.push("/student")

    } catch (err: any) {
      const msg = err.message?.replace("Firebase: ", "") || "Invalid Student ID or PIN"
      if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password")) {
        setError("Incorrect Student ID or PIN. Please try again.")
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      
      // Optimistic cache for admin
      const optimisticProfile = {
        uid: cred.user.uid,
        role: "admin",
        email: email
      }
      localStorage.setItem(`me_profile_${cred.user.uid}`, JSON.stringify(optimisticProfile))
      
      optimisticLogin(cred.user, optimisticProfile as any)
      router.push("/admin")
    } catch (err: any) {
      const msg = err.message?.replace("Firebase: ", "") || "Invalid credentials"
      if (msg.includes("auth/invalid-credential")) {
        setError("Incorrect email or password.")
      } else {
        setError(msg)
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg-hero p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/logo.jpeg" 
            alt="Mission English" 
            className="h-20 w-auto mx-auto mb-4 rounded-xl shadow-lg object-contain bg-white p-2" 
          />
          <h1 className="text-3xl font-black text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-2 font-medium">Mission English</p>
          <p className="text-xs text-blue-600 mt-1.5 font-semibold max-w-[280px] mx-auto italic leading-relaxed">
            "The Only Institute Where You Can Learn English From Basic to Advanced."
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          {/* Role Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              onClick={() => { setRole("student"); setError("") }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                role === "student"
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student
            </button>
            <button
              onClick={() => { setRole("admin"); setError("") }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                role === "admin"
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </button>
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 border border-red-100 font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
            {role === "student" ? (
              <form
                key="student"
                onSubmit={handleStudentLogin}
                className="space-y-5 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Student ID</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="studentId"
                      placeholder="e.g. ME001"
                      className="pl-10 h-12 rounded-xl input-premium uppercase placeholder:normal-case font-semibold"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">4-Digit PIN</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="pin"
                      type="password"
                      placeholder="••••"
                      maxLength={4}
                      className="pl-10 h-12 rounded-xl input-premium tracking-[0.3em] font-bold text-center"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl gradient-bg border-0 text-white font-bold text-base btn-glow"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {loading ? loadingText || "Signing in..." : "Login to Dashboard"}
                  {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500 font-semibold">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={async () => {
                    setError("")
                    setLoading(true)
                    setLoadingText("Connecting to Google...")
                    try {
                      const provider = new GoogleAuthProvider()
                      await signInWithPopup(auth, provider)
                      // onAuthStateChanged will handle the redirect
                    } catch (err: any) {
                      setError(err.message?.replace("Firebase: ", "") || "Google Sign-In failed")
                      setLoading(false)
                    }
                  }}
                  className="w-full h-12 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-base shadow-sm"
                  disabled={loading}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Sign in with Google
                </Button>
              </form>
            ) : (
              <form
                key="admin"
                onSubmit={handleAdminLogin}
                className="space-y-5 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Admin Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@missionenglish.com"
                      className="pl-10 h-12 rounded-xl input-premium"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10 h-12 rounded-xl input-premium"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 border-0 text-white font-bold text-base"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {loading ? "Signing in..." : "Login to Admin Panel"}
                  {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </form>
            )}

          <p className="text-center text-xs text-slate-400 mt-6">
            Having trouble? Contact your administrator.
          </p>
        </div>

        <div className="text-center text-xs text-slate-400 mt-6 space-y-1">
          <p className="pt-2">© {new Date().getFullYear()} Mission English. Powered by Pihnexa Technologies.</p>
        </div>
      </motion.div>
    </div>
  )
}
