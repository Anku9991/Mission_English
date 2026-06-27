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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Mail, ShieldAlert, GraduationCap, Loader2, KeyRound, User } from "lucide-react"

export default function LoginPage() {
  const [role, setRole] = useState<"student" | "admin">("student")
  
  // Student Auth
  const [studentId, setStudentId] = useState("")
  const [pin, setPin] = useState("")
  
  // Admin Auth
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
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
      
      // Step 1: Pre-fetch student document to check access rules
      const docRef = doc(db, "students", formattedStudentId)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        throw new Error("Student ID not found.")
      }
      
      const studentData = docSnap.data()
      
      if (studentData.status === "Inactive") {
        throw new Error("Your account is inactive. Please contact admin.")
      }
      if (studentData.paymentStatus === "Pending") {
        throw new Error("Please complete your payment to continue.")
      }
      if (studentData.testUnlocked === false) {
        throw new Error("Your account is awaiting admin approval.")
      }

      // Step 2: Sign in with mapped email and PIN
      const mappedEmail = `${formattedStudentId}@me.com`
      await signInWithEmailAndPassword(auth, mappedEmail, pin)
      
      // Update lastLogin silently
      await updateDoc(docRef, { lastLogin: Date.now() })
      
      // AuthContext handles redirection
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", "") || "Invalid Student ID or PIN")
      // If error is invalid credentials, provide a clearer message
      if (err.message.includes("auth/invalid-credential")) {
        setError("Incorrect Student ID or PIN")
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
      // AuthContext handles redirection
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", "") || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-primary/10 p-3 rounded-2xl mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Welcome Back</h1>
          <p className="text-slate-600 mt-2">Sign in to continue to Mission English</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardHeader className="pb-4">
            {/* Custom Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
              <button
                onClick={() => { setRole("student"); setError(""); }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  role === "student" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>
              <button
                onClick={() => { setRole("admin"); setError(""); }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  role === "admin" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>
            <CardTitle>{role === "student" ? "Student Login" : "Admin Portal"}</CardTitle>
            <CardDescription>
              {role === "student" ? "Login with your Student ID and PIN" : "Login with administrator credentials"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 font-medium">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {role === "student" ? (
                <motion.div
                  key="student"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="studentId"
                          placeholder="e.g. ME001"
                          className="pl-9 font-medium uppercase placeholder:normal-case"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pin">4-Digit PIN</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="pin"
                          type="password"
                          placeholder="••••"
                          maxLength={4}
                          className="pl-9 tracking-[0.2em] font-bold"
                          value={pin}
                          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} // Only numbers
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full mt-2" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Login to Dashboard
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Admin Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@missionenglish.com"
                          className="pl-9"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Login to Admin Panel
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
