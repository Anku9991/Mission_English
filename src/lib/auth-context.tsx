"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

type UserRole = "student" | "admin"

export interface StudentProfile {
  studentId: string
  fullName: string
  phone: string
  email?: string
  course: string
  batch: string
  paymentStatus: "Paid" | "Pending"
  status: "Active" | "Inactive"
  testUnlocked: boolean
  createdAt: number
  lastLogin?: number
  role: "student"
}

export interface AdminProfile {
  uid: string
  role: "admin"
  email?: string
  name?: string
  createdAt: number
}

export type UserProfile = StudentProfile | AdminProfile

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        try {
          const isStudentEmail = firebaseUser.email?.endsWith("@me.com")
          
          if (isStudentEmail) {
            // Student Profile Flow
            const studentId = firebaseUser.email!.split("@")[0].toUpperCase()
            const docRef = doc(db, "students", studentId)
            const docSnap = await getDoc(docRef)
            
            if (docSnap.exists()) {
              setProfile({ ...docSnap.data(), role: "student" } as StudentProfile)
            } else {
              // Fallback if document missing
              setProfile({
                studentId,
                fullName: "Student",
                phone: "",
                course: "",
                batch: "",
                paymentStatus: "Pending",
                status: "Active",
                testUnlocked: false,
                createdAt: Date.now(),
                role: "student"
              })
            }
          } else {
            // Admin Profile Flow
            const docRef = doc(db, "users", firebaseUser.uid)
            const docSnap = await getDoc(docRef)
            
            if (docSnap.exists()) {
              setProfile({ ...docSnap.data(), role: "admin" } as AdminProfile)
            } else {
              const newAdmin: AdminProfile = {
                uid: firebaseUser.uid,
                role: "admin",
                email: firebaseUser.email || undefined,
                createdAt: Date.now()
              }
              await setDoc(docRef, newAdmin)
              setProfile(newAdmin)
            }
          }
        } catch (error) {
          console.error("Firebase fetch error:", error);
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
