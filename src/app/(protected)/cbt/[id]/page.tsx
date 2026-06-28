"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Clock, Save, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react"
import type { Course, Question, CBTResult } from "@/types"

export default function CBTTestPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const courseId = resolvedParams.id
  const { profile } = useAuth()
  const router = useRouter()

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [started, setStarted] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)

  // Timer
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    async function loadTest() {
      try {
        const docSnap = await getDoc(doc(db, "courses", courseId))
        if (!docSnap.exists()) throw new Error("Test not found")
        const data = { id: docSnap.id, ...docSnap.data() } as Course
        if (data.type !== "cbt") throw new Error("This is not a CBT test")
        if (!data.questions || data.questions.length === 0) throw new Error("Test contains no questions")
        
        const studentProfile = profile?.role === "student" ? profile : null
        if (!studentProfile) throw new Error("Not authorized")
        if (data.price > 0 && !studentProfile.unlockedCourses.includes(data.id)) {
          throw new Error("You must unlock this test first")
        }

        // Security: Check if student has already completed this test
        const resultsRef = collection(db, "results")
        const q = query(resultsRef, where("studentId", "==", studentProfile.studentId))
        const existingResults = await getDocs(q)
        
        const testResult = existingResults.docs.find(d => d.data().courseId === courseId)
        if (testResult) {
          router.replace(`/student/results/${testResult.id}`)
          return // Stop execution
        }

        setCourse(data)
        // Parse duration (e.g. "60 minutes" -> 3600 seconds)
        const minMatch = data.duration?.match(/(\d+)/)
        setTimeLeft((minMatch ? parseInt(minMatch[1]) : 30) * 60)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (profile) loadTest()
  }, [courseId, profile])

  useEffect(() => {
    if (!started || submitting || timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    if (timeLeft === 1) handleSubmit() // Auto submit when time runs out
    return () => clearInterval(timer)
  }, [started, timeLeft, submitting])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSelectOption = (opt: string) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: opt }))
  }

  const handleSubmit = async () => {
    if (!course || !profile || submitting) return
    setSubmitting(true)
    
    // Calculate score
    let score = 0
    let totalMarks = 0
    course.questions!.forEach((q, i) => {
      totalMarks += q.marks || 1
      if (answers[i] === q.correct) score += q.marks || 1
    })

    const studentProfile = profile as any
    const result: Omit<CBTResult, "id"> = {
      studentId: studentProfile.studentId,
      studentName: studentProfile.fullName || "Student",
      courseId: course.id,
      courseTitle: course.title,
      answers,
      score,
      totalMarks,
      totalQuestions: course.questions!.length,
      submittedAt: Date.now(),
      timeTaken: Math.floor((Date.now() - startTime) / 1000),
      isPublished: false
    }

    try {
      const docRef = await addDoc(collection(db, "results"), result)
      router.replace(`/student/results/${docRef.id}`)
    } catch (err: any) {
      alert("Error saving result: " + err.message)
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>
  if (error) return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center">
      <AlertCircle className="w-10 h-10 mx-auto mb-4" />
      <h2 className="font-bold text-lg mb-2">Error</h2>
      <p>{error}</p>
      <Button onClick={() => router.push("/student")} className="mt-6">Return to Dashboard</Button>
    </div>
  )
  if (!course || !course.questions) return null

  // Pre-start screen
  if (!started) {
    return (
      <div className="max-w-3xl mx-auto pt-10">
        <div className="premium-card p-10 text-center">
          <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">{course.title}</h1>
          <p className="text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
            Welcome to the CBT environment. Once you start the test, the timer will begin. 
            Do not refresh the page or your progress will be lost.
          </p>
          
          <div className="flex justify-center gap-10 mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100 max-w-md mx-auto">
            <div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Questions</div>
              <div className="text-2xl font-black text-slate-800">{course.questions.length}</div>
            </div>
            <div className="w-px bg-slate-200" />
            <div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</div>
              <div className="text-2xl font-black text-slate-800">{formatTime(timeLeft)}</div>
            </div>
          </div>

          <Button 
            size="lg" 
            onClick={() => { setStarted(true); setStartTime(Date.now()) }}
            className="px-12 h-14 rounded-2xl gradient-bg border-0 text-white font-bold text-lg btn-glow"
          >
            Start Test Now
          </Button>
        </div>
      </div>
    )
  }

  // Active CBT Interface
  const currentQ = course.questions[currentIdx]

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-bold text-slate-800 truncate pr-4">{course.title}</h1>
          <div className="flex items-center gap-6 shrink-0">
            <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
            <Button 
              onClick={() => { if(confirm("Submit test early?")) handleSubmit() }}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 shadow-md"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Submit
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Question Area */}
        <div className="lg:col-span-3">
          <div className="premium-card p-8">
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold">
                Question {currentIdx + 1} of {course.questions.length}
              </span>
              <span className="text-slate-500 font-medium text-sm">
                Marks: {currentQ.marks || 1}
              </span>
            </div>
            
            <h2 className="text-xl font-medium text-slate-900 mb-8 leading-relaxed">
              {currentQ.text}
            </h2>

            <div className="space-y-3">
              {(["A", "B", "C", "D"] as const).map(opt => {
                const isSelected = answers[currentIdx] === opt
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group ${
                      isSelected 
                        ? "border-blue-500 bg-blue-50/50" 
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                      isSelected ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                    }`}>
                      {opt}
                    </span>
                    <span className={`text-base font-medium ${isSelected ? "text-slate-900" : "text-slate-700"}`}>
                      {currentQ.options[opt]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentIdx(p => Math.max(0, p - 1))}
              disabled={currentIdx === 0}
              className="rounded-xl px-6 h-12 bg-white border-slate-200 hover:bg-slate-50 font-bold gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Previous
            </Button>
            
            <Button 
              onClick={() => {
                if (currentIdx === course.questions!.length - 1) {
                  if (confirm("This is the last question. Submit test?")) handleSubmit()
                } else {
                  setCurrentIdx(p => p + 1)
                }
              }}
              className="rounded-xl px-8 h-12 gradient-bg border-0 text-white font-bold gap-2 btn-glow"
            >
              {currentIdx === course.questions!.length - 1 ? "Save & Submit" : "Next Question"}
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className="lg:col-span-1">
          <div className="premium-card p-6 sticky top-24">
            <h3 className="font-bold text-slate-800 mb-4">Question Palette</h3>
            
            <div className="grid grid-cols-5 gap-2 mb-6">
              {course.questions.map((_, i) => {
                const isAnswered = answers[i] !== undefined
                const isCurrent = currentIdx === i
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold border-2 transition-all ${
                      isCurrent ? "border-blue-500 bg-white text-blue-600 shadow-md scale-110 z-10" :
                      isAnswered ? "bg-emerald-100 border-emerald-200 text-emerald-700" :
                      "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-100 text-sm font-medium">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200" />
                <span className="text-slate-600">Answered ({Object.keys(answers).length})</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-slate-50 border border-slate-200" />
                <span className="text-slate-600">Not Visited ({course.questions.length - Object.keys(answers).length})</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
