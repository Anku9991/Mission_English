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
        try {
          const docRef = doc(db, "users", firebaseUser.uid)
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            // Auto-fix bug where student was incorrectly assigned admin role
            if (data.role === 'admin' && firebaseUser.phoneNumber && !firebaseUser.email) {
              data.role = 'student';
              await setDoc(docRef, { role: 'student' }, { merge: true });
            }
            setProfile(data);
          } else {
            const isPhoneAuth = firebaseUser.phoneNumber != null || firebaseUser.providerData.some(p => p.providerId === 'phone');
            const role: UserRole = isPhoneAuth ? "student" : "admin"
            
            const userData: any = {
              uid: firebaseUser.uid,
              role,
              createdAt: Date.now()
            };

            if (firebaseUser.email) userData.email = firebaseUser.email;
            if (firebaseUser.phoneNumber) userData.phoneNumber = firebaseUser.phoneNumber;
            if (firebaseUser.displayName) userData.name = firebaseUser.displayName;

            await setDoc(docRef, userData);
            setProfile(userData as UserProfile);
          }
        } catch (error) {
          console.error("Firebase fetch error:", error);
          // Fallback profile if offline
          setProfile({
            uid: firebaseUser.uid,
            role: "student",
            createdAt: Date.now()
          })
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
