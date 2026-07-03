"use client"

import { CheckCircle2, XCircle, MinusCircle } from "lucide-react"
import type { Question } from "@/types"

interface TestReviewProps {
  questions: Question[]
  answers: Record<number, string>
}

export function TestReview({ questions, answers }: TestReviewProps) {
  if (!questions || questions.length === 0) return null

  return (
    <div className="space-y-8 mt-12">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-black text-foreground">Detailed Review</h2>
        <div className="h-px bg-slate-200 flex-1"></div>
      </div>

      <div className="grid gap-6">
        {questions.map((q, i) => {
          const studentAnswer = answers[i]
          const isCorrect = studentAnswer === q.correct
          const isSkipped = studentAnswer === undefined

          return (
            <div 
              key={i} 
              className={`premium-card p-6 md:p-8 rounded-3xl border-2 transition-all ${
                isCorrect ? "border-emerald-100 bg-emerald-50/30" : 
                isSkipped ? "border-border bg-secondary/50/50" : 
                "border-red-100 bg-red-50/30"
              }`}
            >
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-xl text-sm font-bold ${
                    isCorrect ? "bg-emerald-100 text-emerald-700" : 
                    isSkipped ? "bg-slate-200 text-muted-foreground" : 
                    "bg-red-100 text-red-700"
                  }`}>
                    Question {i + 1}
                  </span>
                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {!isCorrect && !isSkipped && <XCircle className="w-5 h-5 text-red-500" />}
                  {isSkipped && <MinusCircle className="w-5 h-5 text-muted-foreground" />}
                </div>
                <span className="text-muted-foreground font-medium text-sm bg-card px-3 py-1 rounded-lg shadow-sm border border-border">
                  Marks: {q.marks || 1}
                </span>
              </div>
              
              <h3 className="text-lg font-medium text-foreground mb-6 leading-relaxed">
                {q.text}
              </h3>

              <div className="space-y-3">
                {(["A", "B", "C", "D"] as const).map(opt => {
                  const isOptStudentChoice = studentAnswer === opt
                  const isOptCorrectChoice = q.correct === opt
                  
                  let optStyle = "border-border bg-card text-foreground"
                  let badgeStyle = "bg-secondary text-muted-foreground"

                  if (isOptCorrectChoice) {
                    // Always highlight the correct answer in green
                    optStyle = "border-emerald-400 bg-emerald-50 text-emerald-900 font-medium shadow-sm ring-2 ring-emerald-100"
                    badgeStyle = "bg-emerald-500 text-white"
                  } else if (isOptStudentChoice && !isOptCorrectChoice) {
                    // Highlight student's wrong answer in red
                    optStyle = "border-red-300 bg-red-50 text-red-900"
                    badgeStyle = "bg-red-500 text-white"
                  }

                  return (
                    <div
                      key={opt}
                      className={`w-full text-left p-4 rounded-xl border-2 flex items-center gap-4 ${optStyle}`}
                    >
                      <span className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-sm ${badgeStyle}`}>
                        {opt}
                      </span>
                      <span className="text-base flex-1">
                        {q.options[opt]}
                      </span>
                      {isOptCorrectChoice && (
                        <span className="text-emerald-600 text-sm font-bold flex items-center gap-1 bg-emerald-100 px-2 py-1 rounded-md">
                          <CheckCircle2 className="w-4 h-4" /> Correct Answer
                        </span>
                      )}
                      {isOptStudentChoice && !isOptCorrectChoice && (
                        <span className="text-red-600 text-sm font-bold flex items-center gap-1 bg-red-100 px-2 py-1 rounded-md">
                          <XCircle className="w-4 h-4" /> Your Answer
                        </span>
                      )}
                      {isOptStudentChoice && isOptCorrectChoice && (
                        <span className="text-emerald-600 text-sm font-bold flex items-center gap-1 bg-emerald-100 px-2 py-1 rounded-md">
                          <CheckCircle2 className="w-4 h-4" /> Your Answer
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
