"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { signInWithEmailAndPassword } from "firebase/auth"
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
  const [error, setError] = useState("")

  const { user, profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
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
    try {
      const formattedStudentId = studentId.toUpperCase().trim()
      const mappedEmail = `${formattedStudentId}@me.com`
      const firebasePassword = `${pin}ME`

      // Sign in (no artificial delay — Firebase token propagates instantly in modern SDK)
      await signInWithEmailAndPassword(auth, mappedEmail, firebasePassword)

      // Fetch student document to validate access
      const docRef = doc(db, "students", formattedStudentId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        await auth.signOut()
        throw new Error("Student ID not found.")
      }

      const studentData = docSnap.data()
      if (studentData.status === "Inactive") {
        await auth.signOut()
        throw new Error("Your account is inactive. Please contact admin.")
      }

      // Update lastLogin silently (non-blocking)
      updateDoc(docRef, { lastLogin: Date.now() }).catch(() => {})
      // AuthContext handles redirect

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
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      const msg = err.message?.replace("Firebase: ", "") || "Invalid credentials"
      if (msg.includes("auth/invalid-credential")) {
        setError("Incorrect email or password.")
      } else {
        setError(msg)
      }
    } finally {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg mb-4 shadow-xl btn-glow">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Sign in to Mission English</p>
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
          <AnimatePresence mode="wait">
            {role === "student" ? (
              <motion.form
                key="student"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleStudentLogin}
                className="space-y-5"
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
                  {loading ? "Signing in..." : "Login to Dashboard"}
                  {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="admin"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleAdminLogin}
                className="space-y-5"
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
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-slate-400 mt-6">
            Having trouble? Contact your administrator.
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} Mission English. Powered by Pihnexa Technologies.
        </p>
      </motion.div>
    </div>
  )
}
