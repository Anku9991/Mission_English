"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

type UserRole = "student" | "admin"

interface UserProfile {
  uid: string
  role: UserRole
  phoneNumber?: string
  email?: string
  name?: string
  createdAt: number
}

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
        // Fetch or create user profile in Firestore
        const docRef = doc(db, "users", firebaseUser.uid)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile)
        } else {
          // If admin logs in via Email, they should already be in DB manually, 
          // but if it's a new student via Phone OTP, create them.
          const isPhoneAuth = firebaseUser.providerData.some(p => p.providerId === 'phone')
          const role: UserRole = isPhoneAuth ? "student" : "admin"
          
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            role,
            phoneNumber: firebaseUser.phoneNumber || undefined,
            email: firebaseUser.email || undefined,
            createdAt: Date.now()
          }
          await setDoc(docRef, newProfile)
          setProfile(newProfile)
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
