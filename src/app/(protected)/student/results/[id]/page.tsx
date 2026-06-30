"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, CheckCircle2, XCircle, MinusCircle, Target, Loader2, Clock, ShieldAlert } from "lucide-react"
import type { CBTResult, Course } from "@/types"
import { TestReview } from "@/components/cbt/TestReview"

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const resultId = resolvedParams.id
  
  const [result, setResult] = useState<CBTResult | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "results", resultId), async (docSnap) => {
      if (docSnap.exists()) {
        const resultData = { id: docSnap.id, ...docSnap.data() } as CBTResult
        setResult(resultData)
        setError("")

        // Fetch course to get questions
        try {
          const courseSnap = await getDoc(doc(db, "courses", resultData.courseId))
          if (courseSnap.exists()) {
            setCourse({ id: courseSnap.id, ...courseSnap.data() } as Course)
          }
        } catch (err: any) {
          console.error("Error fetching course questions:", err.message)
        }
      } else {
        setError("Result not found")
      }
      setLoading(false)
    }, (err) => {
      setError(err.message)
      setLoading(false)
    })
    
    return () => unsub()
  }, [resultId])

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>
  }

  if (error || !result) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center bg-red-50 p-8 rounded-3xl border border-red-100">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
        <p className="text-red-500">{error || "Could not load result."}</p>
        <Link href="/student/results">
          <Button className="mt-6 rounded-xl">Back to Results</Button>
        </Link>
      </div>
    )
  }

  // Pending Admin Verification State
  if (!result.isPublished) {
    return (
      <div className="max-w-2xl mx-auto pt-10 pb-20 px-4">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/student/results">
            <Button variant="ghost" size="icon" className="rounded-xl border border-slate-200">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>
        
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Clock className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">Result Pending Verification</h1>
          <p className="text-slate-600 max-w-md mx-auto leading-relaxed mb-8">
            Your test for <span className="font-bold text-slate-800">{result.courseTitle}</span> has been successfully submitted. 
            The admin is currently verifying the answers and will publish your detailed performance report shortly.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider bg-white py-3 px-6 rounded-xl inline-flex border border-slate-200 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Admin Review in Progress
          </div>
        </div>
      </div>
    )
  }

  // Published State - Real Data Calculation
  const totalQuestions = result.totalQuestions || 1
  const attempted = result.correctCount + result.wrongCount
  const skipped = result.skippedCount || 0
  const marksObtained = result.score || 0
  const totalMarks = result.totalMarks || 1
  const accuracy = result.accuracy || 0
  
  return (
    <div className="max-w-5xl mx-auto pt-4 pb-20 px-4">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/student/results">
          <Button variant="ghost" size="icon" className="rounded-xl border border-slate-200 hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Performance Report</h1>
          <p className="text-slate-500 mt-1">{result.courseTitle}</p>
        </div>
      </div>

      {/* Main Score Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-sm gradient-bg text-white md:col-span-2 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <CardContent className="p-10 flex items-center justify-between relative z-10">
            <div>
              <p className="text-white/80 font-bold uppercase tracking-wider text-sm mb-2">Total Score</p>
              <div className="flex items-end space-x-2">
                <span className="text-6xl font-black drop-shadow-md">{marksObtained}</span>
                <span className="text-2xl text-white/60 mb-2 font-bold">/ {totalMarks}</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-inner">
              <Trophy className="w-12 h-12 text-yellow-300 drop-shadow-md" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm rounded-3xl bg-white flex flex-col items-center justify-center">
          <CardContent className="p-8 text-center">
            <Target className="w-10 h-10 text-indigo-500 mb-3 mx-auto" />
            <div className="text-4xl font-black text-slate-900">{accuracy}%</div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-2">Accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm rounded-2xl hover:-translate-y-1 transition-transform">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Total Questions</CardTitle>
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{totalQuestions}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl hover:-translate-y-1 transition-transform">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Correct</CardTitle>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{result.correctCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl hover:-translate-y-1 transition-transform">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Incorrect</CardTitle>
            <XCircle className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{result.wrongCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl hover:-translate-y-1 transition-transform">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Skipped</CardTitle>
            <MinusCircle className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{skipped}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Review Section */}
      {course && course.questions && (
        <TestReview questions={course.questions} answers={result.answers} />
      )}
    </div>
  )
}
