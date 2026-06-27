"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { use } from "react"
import { ArrowLeft, Trophy, CheckCircle2, XCircle, MinusCircle, Target } from "lucide-react"

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  // Mock results data
  const result = {
    testName: "SSC CGL English Tier 1",
    totalQuestions: 50,
    attempted: 45,
    correct: 38,
    wrong: 7,
    skipped: 5,
    totalMarks: 100,
    marksObtained: 72.5,
    accuracy: 84.4,
    percentile: 92.1,
  }

  return (
    <div className="max-w-5xl mx-auto pt-4 pb-20">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/student/results">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Performance Report</h1>
          <p className="text-slate-500 mt-1">{result.testName}</p>
        </div>
      </div>

      {/* Main Score Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-600 to-indigo-700 text-white md:col-span-2">
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <p className="text-blue-100 font-medium mb-2">Total Score</p>
              <div className="flex items-end space-x-2">
                <span className="text-5xl font-black">{result.marksObtained}</span>
                <span className="text-xl text-blue-200 mb-1">/ {result.totalMarks}</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-8 flex flex-col items-center justify-center h-full">
            <Target className="w-8 h-8 text-indigo-500 mb-2" />
            <div className="text-3xl font-bold text-slate-900">{result.percentile}%</div>
            <p className="text-sm text-slate-500 font-medium mt-1">Percentile</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{result.accuracy}%</div>
            <div className="w-full bg-slate-100 h-2 mt-3 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${result.accuracy}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">Correct</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{result.correct} <span className="text-sm font-normal text-slate-400">/ {result.totalQuestions}</span></div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">Incorrect</CardTitle>
            <XCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{result.wrong} <span className="text-sm font-normal text-slate-400">/ {result.totalQuestions}</span></div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">Skipped</CardTitle>
            <MinusCircle className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{result.skipped} <span className="text-sm font-normal text-slate-400">/ {result.totalQuestions}</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Link href={`/student/results/${resolvedParams.id}/review`}>
          <Button variant="outline" className="w-full md:w-auto h-12 px-8">
            Review Questions & Answers
          </Button>
        </Link>
      </div>
    </div>
  )
}
