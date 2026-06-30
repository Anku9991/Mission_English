"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, XCircle, MinusCircle, Target, Trophy, Clock, ShieldAlert } from "lucide-react"
import type { CBTResult, Course } from "@/types"
import { TestReview } from "@/components/cbt/TestReview"

export default function AdminResultDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const resultId = resolvedParams.id
  
  const [result, setResult] = useState<CBTResult | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const resultSnap = await getDoc(doc(db, "results", resultId))
        if (!resultSnap.exists()) throw new Error("Result not found")
        const resultData = { id: resultSnap.id, ...resultSnap.data() } as CBTResult
        setResult(resultData)

        // Fetch course to get questions
        const courseSnap = await getDoc(doc(db, "courses", resultData.courseId))
        if (courseSnap.exists()) {
          setCourse({ id: courseSnap.id, ...courseSnap.data() } as Course)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [resultId])

  const handlePublishToggle = async () => {
    if (!result) return
    setUpdating(true)
    try {
      await updateDoc(doc(db, "results", resultId), {
        isPublished: !result.isPublished
      })
      setResult(prev => prev ? { ...prev, isPublished: !prev.isPublished } : null)
    } catch (err: any) {
      alert("Error updating result status: " + err.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>
  
  if (error || !result) return (
    <div className="max-w-md mx-auto mt-20 text-center bg-red-50 p-8 rounded-3xl border border-red-100">
      <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
      <p className="text-red-500">{error || "Could not load result."}</p>
      <Link href="/admin/results">
        <Button className="mt-6 rounded-xl">Back to Results</Button>
      </Link>
    </div>
  )

  const totalQuestions = result.totalQuestions || 1
  const skipped = result.skippedCount || 0
  const marksObtained = result.score || 0
  const totalMarks = result.totalMarks || 1
  const accuracy = result.accuracy || 0
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin/results">
            <Button variant="ghost" size="icon" className="rounded-xl border border-slate-200 hover:bg-slate-50">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Student Result Details</h1>
            <p className="text-slate-500 mt-1">{result.studentName} • {result.courseTitle}</p>
          </div>
        </div>
        
        <Button
          onClick={handlePublishToggle}
          disabled={updating}
          variant={result.isPublished ? "outline" : "default"}
          className={`h-11 rounded-xl font-bold px-6 ${!result.isPublished ? "gradient-bg border-0 text-white shadow-md btn-glow" : ""}`}
        >
          {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 
           result.isPublished ? "Unpublish Result" : "Publish to Student"}
        </Button>
      </div>

      {!result.isPublished && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-700">
          <ShieldAlert className="w-5 h-5" />
          <span className="font-medium text-sm">This result is currently pending verification and is hidden from the student.</span>
        </div>
      )}

      {/* Main Score Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-sm gradient-bg text-white md:col-span-2 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <CardContent className="p-8 flex items-center justify-between relative z-10 h-full">
            <div>
              <p className="text-white/80 font-bold uppercase tracking-wider text-xs mb-2">Total Score</p>
              <div className="flex items-end space-x-2">
                <span className="text-5xl font-black drop-shadow-md">{marksObtained}</span>
                <span className="text-xl text-white/60 mb-2 font-bold">/ {totalMarks}</span>
              </div>
            </div>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-inner">
              <Trophy className="w-10 h-10 text-yellow-300 drop-shadow-md" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm rounded-3xl bg-white flex flex-col items-center justify-center">
          <CardContent className="p-6 text-center w-full">
            <Target className="w-8 h-8 text-indigo-500 mb-2 mx-auto" />
            <div className="text-3xl font-black text-slate-900">{accuracy}%</div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Accuracy</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm rounded-3xl bg-white flex flex-col items-center justify-center">
          <CardContent className="p-6 text-center w-full">
            <Clock className="w-8 h-8 text-amber-500 mb-2 mx-auto" />
            <div className="text-3xl font-black text-slate-900">{formatTime(result.timeTaken || 0)}</div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Time Taken</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Qs</CardTitle>
            <div className="w-2 h-2 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{totalQuestions}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Correct</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{result.correctCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Incorrect</CardTitle>
            <XCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{result.wrongCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Skipped</CardTitle>
            <MinusCircle className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{skipped}</div>
          </CardContent>
        </Card>
      </div>

      {course && course.questions ? (
        <TestReview questions={course.questions} answers={result.answers} />
      ) : (
        <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-600">No Questions Data</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            The original questions for this test could not be loaded. 
            They might have been deleted or the test structure changed.
          </p>
        </div>
      )}
    </div>
  )
}
