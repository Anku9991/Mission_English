"use client"

import { useState, useEffect } from "react"
import { useAuth, StudentProfile } from "@/lib/auth-context"
import { collection, query, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, CreditCard, Activity, UserCheck, ShieldAlert, Lock, Unlock, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

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
    <div className="pb-20 max-w-7xl mx-auto">
      <div className="mb-10 p-8 rounded-3xl gradient-bg-hero relative overflow-hidden border border-slate-100 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Platform Overview</h1>
            <p className="text-slate-600 text-lg">Live analytics and student metrics.</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="premium-card h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50/50">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">{stat.title}</CardTitle>
                  <div className={`p-2.5 rounded-xl ${stat.bg} shadow-sm`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card className="premium-card h-full">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" /> Recent Signups
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Users className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm font-medium">No students registered yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {students.sort((a,b) => b.createdAt - a.createdAt).slice(0,5).map(s => (
                    <div key={s.studentId} className="flex items-center justify-between border border-slate-100 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                          {s.fullName?.[0] || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{s.fullName} <span className="text-slate-400 text-xs ml-1 font-normal">({s.studentId})</span></p>
                          <p className="text-xs text-slate-500 font-medium">{s.course}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-xs font-bold px-2 py-1 rounded-md mb-1 inline-block", s.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600')}>{s.status}</p>
                        <p className={cn("text-xs font-bold block", s.paymentStatus === 'Paid' ? 'text-slate-400' : 'text-amber-500')}>{s.paymentStatus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="premium-card h-full">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-500" /> Action Center
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {pendingStudents > 0 || lockedStudents > 0 ? (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="bg-amber-100 p-3 rounded-xl">
                      <ShieldAlert className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-amber-900 text-base mb-1">Attention Required</h4>
                      <p className="text-sm text-amber-700 font-medium leading-relaxed mb-4">
                        You have <span className="font-bold">{pendingStudents}</span> students pending payment and <span className="font-bold">{lockedStudents}</span> students with locked tests.
                      </p>
                      <a href="/admin/students" className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all">
                        Review Students <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-emerald-600 bg-emerald-50/50 rounded-2xl border border-emerald-100 border-dashed">
                  <div className="bg-emerald-100 p-4 rounded-full mb-4">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-lg text-emerald-800">All clear!</p>
                  <p className="text-sm text-emerald-600 font-medium mt-1">No pending actions required.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
