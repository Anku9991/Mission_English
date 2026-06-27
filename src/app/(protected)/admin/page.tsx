"use client"

import { useState, useEffect } from "react"
import { useAuth, StudentProfile } from "@/lib/auth-context"
import { collection, query, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, CreditCard, Activity, UserCheck, ShieldAlert, Lock, Unlock } from "lucide-react"

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [students, setStudents] = useState<StudentProfile[]>([])

  useEffect(() => {
    const q = query(collection(db, "students"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => doc.data() as StudentProfile))
    })
    return () => unsubscribe()
  }, [])

  const totalStudents = students.length
  const activeStudents = students.filter(s => s.status === 'Active').length
  const inactiveStudents = totalStudents - activeStudents
  const paidStudents = students.filter(s => s.paymentStatus === 'Paid').length
  const pendingStudents = totalStudents - paidStudents
  const unlockedStudents = students.filter(s => s.testUnlocked).length
  const lockedStudents = totalStudents - unlockedStudents

  const stats = [
    { title: "Total Students", value: totalStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Active / Inactive", value: `${activeStudents} / ${inactiveStudents}`, icon: UserCheck, color: "text-green-600", bg: "bg-green-100" },
    { title: "Paid / Pending", value: `${paidStudents} / ${pendingStudents}`, icon: CreditCard, color: "text-amber-600", bg: "bg-amber-100" },
    { title: "Unlocked / Locked", value: `${unlockedStudents} / ${lockedStudents}`, icon: Lock, color: "text-indigo-600", bg: "bg-indigo-100" },
  ]

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your platform's performance and live student stats.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Students</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No students registered yet.</p>
            ) : (
              <div className="space-y-4">
                {students.sort((a,b) => b.createdAt - a.createdAt).slice(0,5).map(s => (
                  <div key={s.studentId} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{s.fullName} <span className="text-slate-400 text-xs font-normal">({s.studentId})</span></p>
                      <p className="text-xs text-slate-500">{s.course}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-semibold ${s.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>{s.status}</p>
                      <p className={`text-xs ${s.paymentStatus === 'Paid' ? 'text-slate-500' : 'text-amber-600 font-medium'}`}>{s.paymentStatus}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Action Center</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingStudents > 0 || lockedStudents > 0 ? (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">Action Required</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    You have {pendingStudents} students pending payment and {lockedStudents} students with locked tests. Go to Student Management to approve them.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4">All clear! No pending actions required.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
