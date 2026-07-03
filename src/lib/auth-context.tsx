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
          const isStudentEmail = firebaseUser.email?.endsWith("@me.com")
          
          if (isStudentEmail) {
            // Student Profile Flow - Use onSnapshot for real-time updates!
            const studentId = firebaseUser.email!.split("@")[0].toUpperCase()
            const docRef = doc(db, "students", studentId)
            
            profileUnsub = onSnapshot(docRef, (docSnap) => {
              let finalProfile: UserProfile;
              if (docSnap.exists()) {
                const data = docSnap.data()
                finalProfile = { 
                  ...data, 
                  role: "student",
                  unlockedCourses: data.unlockedCourses || []
                } as StudentProfile
              } else {
                finalProfile = {
                  studentId,
                  fullName: "Student",
                  phone: "",
                  course: "",
                  batch: "",
                  paymentStatus: "Pending",
                  status: "Active",
                  testUnlocked: false,
                  unlockedCourses: [],
                  createdAt: Date.now(),
                  role: "student"
                }
              }
              setProfile(prev => {
                if (JSON.stringify(prev) === JSON.stringify(finalProfile)) return prev;
                return finalProfile;
              });
              localStorage.setItem(`me_profile_${firebaseUser.uid}`, JSON.stringify(finalProfile))
              setLoading(false)
            });
            
          } else {
            // Admin Profile Flow
            const docRef = doc(db, "users", firebaseUser.uid)
            const docSnap = await getDoc(docRef)
            let finalProfile: UserProfile;
            
            if (docSnap.exists()) {
              finalProfile = { ...docSnap.data(), role: "admin" } as AdminProfile
            } else {
              finalProfile = {
                uid: firebaseUser.uid,
                role: "admin",
                email: firebaseUser.email || undefined,
                createdAt: Date.now()
              }
              await setDoc(docRef, finalProfile)
            }
            setProfile(finalProfile)
            localStorage.setItem(`me_profile_${firebaseUser.uid}`, JSON.stringify(finalProfile))
            setLoading(false)
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
