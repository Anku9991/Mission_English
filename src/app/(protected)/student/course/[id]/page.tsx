"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, PlayCircle, Lock, BookOpen } from "lucide-react"
import type { Course } from "@/types"

export default function CourseViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const courseId = resolvedParams.id
  
  const router = useRouter()
  const { profile } = useAuth()
  
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [activeLesson, setActiveLesson] = useState<string | null>(null)

  useEffect(() => {
    async function loadCourse() {
      if (!profile) return
      try {
        const docSnap = await getDoc(doc(db, "courses", courseId))
        if (!docSnap.exists()) {
          setCourse(null)
          return
        }
        const data = { id: docSnap.id, ...docSnap.data() } as Course
        setCourse(data)

        // Check access
        const studentProfile = profile as any
        const unlocked = studentProfile.unlockedCourses || []
        
        if (unlocked.includes(courseId)) {
          setHasAccess(true)
        }
        
        // Auto select first lesson if it's a video course
        if (data.type === "course" && data.modules?.[0]?.lessons?.[0]) {
          setActiveLesson(data.modules[0].lessons[0].url)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadCourse()
  }, [courseId, profile])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-500 font-medium">Loading content...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Content not found</h2>
        <Link href="/student"><Button className="mt-4">Back to Dashboard</Button></Link>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-500 mb-8">You need to enroll in this course to view its content.</p>
        <Link href={`/student/payment/${course.id}`}>
          <Button className="w-full h-12 rounded-xl gradient-bg border-0 text-white font-bold">Enroll Now</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/student">
            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 border border-slate-200">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">{course.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{course.type === "notes" ? "PDF Notes Viewer" : "Video Course Player"}</p>
          </div>
        </div>
      </div>

      {course.type === "notes" ? (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[75vh]">
          <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-slate-700">{course.fileName || "Study Material"}</span>
            <a href={(course as any).pdfUrl} target="_blank" rel="noreferrer" className="ml-auto">
              <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs font-bold">
                Open in New Tab
              </Button>
            </a>
          </div>
          <div className="flex-1 w-full bg-slate-100">
            {/* Embed PDF Viewer */}
            <iframe 
              src={(course as any).pdfUrl + "#toolbar=0"} 
              className="w-full h-full border-0"
              title="PDF Viewer"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black rounded-3xl overflow-hidden shadow-lg aspect-video relative flex items-center justify-center">
              {activeLesson ? (
                <iframe
                  src={activeLesson.includes("youtube.com") ? activeLesson.replace("watch?v=", "embed/") : activeLesson}
                  className="w-full h-full absolute inset-0"
                  allowFullScreen
                  title="Video Player"
                />
              ) : (
                <div className="text-slate-500 flex flex-col items-center">
                  <PlayCircle className="w-12 h-12 mb-2 opacity-50" />
                  <p>Select a lesson from the curriculum</p>
                </div>
              )}
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">About this Course</h2>
              <p className="text-slate-600 leading-relaxed">{course.description}</p>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden sticky top-6">
              <div className="bg-slate-50 border-b border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 text-lg">Curriculum</h3>
                <p className="text-xs text-slate-500 mt-1">{course.modules?.length || 0} Modules</p>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {course.modules?.map((m, mIdx) => (
                  <div key={m.id} className="border-b border-slate-100 last:border-0">
                    <div className="bg-slate-50/50 px-5 py-3 font-semibold text-slate-800 text-sm">
                      Module {mIdx + 1}: {m.title}
                    </div>
                    <div className="divide-y divide-slate-50">
                      {m.lessons.map((l, lIdx) => (
                        <button
                          key={l.id}
                          onClick={() => setActiveLesson(l.url)}
                          className={`w-full text-left px-5 py-4 flex items-start gap-3 transition-colors ${activeLesson === l.url ? "bg-blue-50/50" : "hover:bg-slate-50"}`}
                        >
                          <PlayCircle className={`w-4 h-4 mt-0.5 shrink-0 ${activeLesson === l.url ? "text-blue-500" : "text-slate-400"}`} />
                          <div>
                            <p className={`text-sm font-medium ${activeLesson === l.url ? "text-blue-700" : "text-slate-700"}`}>
                              {lIdx + 1}. {l.title}
                            </p>
                            {l.duration && <span className="text-xs text-slate-400 mt-1 block">{l.duration}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
