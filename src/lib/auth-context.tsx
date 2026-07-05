"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"
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
  unlockedCourses: string[] // array of Firestore course IDs
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
  optimisticLogin: (user: User, profile: UserProfile) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  optimisticLogin: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      let profileUnsub: (() => void) | undefined;
      
      if (firebaseUser) {
        // FAST PATH: Load from cache instantly to bypass "Authenticating..." screen
        const cachedProfile = localStorage.getItem(`me_profile_${firebaseUser.uid}`)
        if (cachedProfile) {
          try {
            setProfile(JSON.parse(cachedProfile))
            setLoading(false) // INSTANT UNBLOCK!
          } catch (e) {
            // ignore JSON parse errors
          }
        }
        
        try {
          // 1. Check if user is an Admin
          const userDocRef = doc(db, "users", firebaseUser.uid)
          const userDocSnap = await getDoc(userDocRef)

          if (userDocSnap.exists()) {
            // ADMIN FLOW
            const finalProfile = { ...userDocSnap.data(), role: "admin" } as AdminProfile
            setProfile(finalProfile)
            localStorage.setItem(`me_profile_${firebaseUser.uid}`, JSON.stringify(finalProfile))
            setLoading(false)
          } else {
            // STUDENT FLOW
            let studentId = firebaseUser.uid // Default to UID for Google Auth
            if (firebaseUser.email?.endsWith("@me.com")) {
              studentId = firebaseUser.email.split("@")[0].toUpperCase()
            }
            
            const docRef = doc(db, "students", studentId)
            
            profileUnsub = onSnapshot(docRef, async (docSnap) => {
              let finalProfile: UserProfile;
              if (docSnap.exists()) {
                const data = docSnap.data()
                finalProfile = { 
                  ...data, 
                  role: "student",
                  unlockedCourses: data.unlockedCourses || []
                } as StudentProfile
              } else {
                // New student via Google Auth
                finalProfile = {
                  studentId,
                  fullName: firebaseUser.displayName || "Student",
                  phone: "",
                  email: firebaseUser.email || "",
                  course: "",
                  batch: "",
                  paymentStatus: "Pending",
                  status: "Active",
                  testUnlocked: false,
                  unlockedCourses: [],
                  createdAt: Date.now(),
                  role: "student"
                }
                // Save to Firestore so it persists
                await setDoc(docRef, finalProfile, { merge: true }).catch(console.error)
              }
              
              setProfile(prev => {
                if (JSON.stringify(prev) === JSON.stringify(finalProfile)) return prev;
                return finalProfile;
              });
              localStorage.setItem(`me_profile_${firebaseUser.uid}`, JSON.stringify(finalProfile))
              setLoading(false)
            });
          }

        } catch (error) {
          console.error("Firebase fetch error:", error);
          setLoading(false)
        }
      } else {
        setProfile(null)
        setLoading(false)
      }

      return () => {
        if (profileUnsub) profileUnsub();
      }
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    if (user) {
      localStorage.removeItem(`me_profile_${user.uid}`)
    }
    await signOut(auth)
  }

  const optimisticLogin = (newUser: User, newProfile: UserProfile) => {
    setUser(newUser)
    setProfile(newProfile)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, optimisticLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
