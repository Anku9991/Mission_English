"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, Clock, FileText, PlayCircle, BookOpen, Loader2, IndianRupee, Zap } from "lucide-react"
import type { Course } from "@/types"
import { motion, AnimatePresence } from "framer-motion"

const TYPE_META = {
  cbt:    { label: "CBT Test",     bg: "bg-blue-50 text-blue-700 border-blue-100",   icon: FileText,   grad: "from-blue-500 to-indigo-600" },
  course: { label: "Video Course", bg: "bg-purple-50 text-purple-700 border-purple-100", icon: PlayCircle, grad: "from-purple-500 to-pink-600" },
  notes:  { label: "PDF Notes",   bg: "bg-amber-50 text-amber-700 border-amber-100",  icon: BookOpen,   grad: "from-amber-500 to-orange-500" },
}

export default function TestsPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, "courses"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, snap => {
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Course)))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await deleteDoc(doc(db, "courses", id))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Courses & Tests</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {loading ? "Loading..." : `${courses.length} item${courses.length !== 1 ? "s" : ""} published`}
          </p>
        </div>
        <Link href="/admin/tests/create">
          <Button className="gap-2 rounded-xl gradient-bg border-0 text-white btn-glow font-semibold">
            <Plus className="w-4 h-4" /> Create New
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
          <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-700 mb-2">No content yet</h2>
          <p className="text-slate-400 mb-6 max-w-sm mx-auto">Create your first CBT test, video course, or PDF notes to get started.</p>
          <Link href="/admin/tests/create">
            <Button className="rounded-xl gradient-bg border-0 text-white gap-2 btn-glow">
              <Plus className="w-4 h-4" /> Create First Content
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {courses.map((course, i) => {
              const meta = TYPE_META[course.type]
              const Icon = meta.icon
              const isDeleting = deleting === course.id
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="premium-card group relative overflow-hidden"
                >
                  {/* Gradient top bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${meta.grad}`} />
                  <div className="p-5">
                    {/* Type badge & Category + Actions */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${meta.bg}`}>
                          <Icon className="w-3 h-3" /> {meta.label}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border bg-slate-100 text-slate-600 border-slate-200 uppercase">
                          {course.category || "Uncategorized"}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                        <Link href={`/admin/tests/edit/${course.id}`}>
                          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg hover:bg-blue-50 text-blue-500">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-lg hover:bg-red-50 text-red-500"
                          onClick={() => handleDelete(course.id, course.title)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">{course.title}</h3>
                    {course.description && (
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{course.description}</p>
                    )}

                    {/* Stats row */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-100">
                      {course.type === "cbt" && course.questions && (
                        <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {course.questions.length} Qs</span>
                      )}
                      {course.type === "course" && course.modules && (
                        <span className="flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" /> {course.modules.length} Modules</span>
                      )}
                      {course.duration && (
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                      )}
                      <span className={`ml-auto flex items-center gap-0.5 font-bold text-sm ${course.price === 0 ? "text-emerald-600" : "text-slate-700"}`}>
                        {course.price === 0 ? "🆓 Free" : <><IndianRupee className="w-3 h-3" />{course.price}</>}
                      </span>
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
