"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { PlayCircle, FileText, BookOpen, Clock, Lock, Unlock, ArrowRight, Loader2, IndianRupee, Trophy } from "lucide-react"
import type { Course } from "@/types"
import { motion, AnimatePresence } from "framer-motion"

const TYPE_META = {
  cbt:    { label: "CBT Test",     icon: FileText,   grad: "from-blue-500 to-indigo-600" },
  course: { label: "Video Course", icon: PlayCircle, grad: "from-purple-500 to-pink-600" },
  notes:  { label: "PDF Notes",    icon: BookOpen,   grad: "from-amber-500 to-orange-500" },
}

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState<string | null>(null)
  const [completedTests, setCompletedTests] = useState<Record<string, string>>({})

  const studentProfile = profile?.role === "student" ? profile : null
  const [unlockedIds, setUnlockedIds] = useState<string[]>(studentProfile?.unlockedCourses || [])

  useEffect(() => {
    if (!studentProfile?.studentId) return
    const unsub = onSnapshot(doc(db, "students", studentProfile.studentId), (docSnap) => {
      if (docSnap.exists()) {
        setUnlockedIds(docSnap.data().unlockedCourses || [])
      }
    })
    return () => unsub()
  }, [studentProfile?.studentId])

  useEffect(() => {
    // Only fetch published courses
    const q = query(collection(db, "courses"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, snap => {
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Course)).filter(c => c.isPublished))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!studentProfile?.studentId) return
    const q = query(collection(db, "results"), where("studentId", "==", studentProfile.studentId))
    const unsub = onSnapshot(q, snap => {
      const map: Record<string, string> = {}
      snap.docs.forEach(d => {
        const data = d.data()
        map[data.courseId] = d.id
      })
      setCompletedTests(map)
    })
    return () => unsub()
  }, [studentProfile?.studentId])

  const handleFreeUnlock = async (courseId: string) => {
    if (!studentProfile) return
    setUnlocking(courseId)
    try {
      await updateDoc(doc(db, "students", studentProfile.studentId), {
        unlockedCourses: arrayUnion(courseId)
      })
      // The real-time listener will instantly catch this and update unlockedIds
    } catch (err: any) {
      alert("Error unlocking course: " + err.message)
    } finally {
      setUnlocking(null)
    }
  }

  return (
    <div className="pb-12">
      {/* Welcome Banner */}
      <div className="mb-10 p-8 rounded-3xl gradient-bg-hero relative overflow-hidden border border-slate-100 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              Welcome back, <span className="gradient-text">{studentProfile?.fullName?.split(' ')[0] || 'Student'}</span>! 👋
            </h1>
            <p className="text-slate-600 text-lg">Ready to continue your preparation?</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/80 backdrop-blur px-5 py-3 rounded-2xl border border-white shadow-sm flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Enrolled</span>
              <span className="text-2xl font-black text-blue-600 flex items-center gap-2">
                <Unlock className="w-5 h-5 text-blue-500" />
                {unlockedIds.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-500" />
          Available Courses
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-slate-200/50">
            <PlayCircle className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No active courses yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Explore the available courses below and unlock them to start your learning journey.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {courses.map((course, i) => {
              const meta = TYPE_META[course.type]
              const Icon = meta.icon
              const isUnlocked = unlockedIds.includes(course.id)
              const isFree = course.price === 0
              const completedResultId = completedTests[course.id]

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="premium-card flex flex-col h-full overflow-hidden group"
                >
                  {/* Top Color Bar */}
                  <div className={`h-2 w-full bg-gradient-to-r ${meta.grad}`} />
                  
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200`}>
                        <Icon className="w-3.5 h-3.5" /> {meta.label}
                      </span>
                      {isUnlocked ? (
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1">
                          <Unlock className="w-3.5 h-3.5" /> Unlocked
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> Locked
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug">{course.title}</h3>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-1">{course.description}</p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 mb-6 pb-6 border-b border-slate-100">
                      {course.type === "cbt" && (
                        <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-400" /> {course.questions?.length || 0} Qs</span>
                      )}
                      {course.type === "course" && (
                        <span className="flex items-center gap-1.5"><PlayCircle className="w-4 h-4 text-slate-400" /> {course.modules?.length || 0} Mod</span>
                      )}
                      {course.duration && (
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {course.duration}</span>
                      )}
                    </div>

                    {/* Action Area */}
                    <div className="mt-auto">
                      {isUnlocked ? (
                        course.type === "cbt" && completedResultId ? (
                          <Link href={`/student/results/${completedResultId}`}>
                            <Button className="w-full h-12 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-bold text-base gap-2 group-hover:scale-[1.02] transition-transform shadow-sm">
                              View Result
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        ) : (
                          <Link href={course.type === "cbt" ? `/cbt/${course.id}` : `/student/course/${course.id}`}>
                            <Button className="w-full h-12 rounded-xl gradient-bg border-0 text-white font-bold text-base btn-glow gap-2 group-hover:scale-[1.02] transition-transform">
                              {course.type === "cbt" ? "Start Test" : "View Content"}
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        )
                      ) : isFree ? (
                        <Button 
                          onClick={() => handleFreeUnlock(course.id)}
                          disabled={unlocking === course.id}
                          className="w-full h-12 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border border-emerald-200 font-bold text-base gap-2 transition-colors"
                        >
                          {unlocking === course.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Unlock className="w-5 h-5" />}
                          {unlocking === course.id ? "Unlocking..." : "Unlock for Free"}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-2xl">
                          <div className="flex-1 text-center">
                            <span className="text-xl font-black text-slate-900 flex items-center justify-center">
                              <IndianRupee className="w-5 h-5" />{course.price}
                            </span>
                          </div>
                          <Link href={`/student/payment/${course.id}`} className="flex-[2]">
                            <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                              <Lock className="w-4 h-4 text-slate-400" /> Enroll Now
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
