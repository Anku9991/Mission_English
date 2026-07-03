"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Loader2, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react"
import type { CBTResult } from "@/types"
import { motion, AnimatePresence } from "framer-motion"

export default function StudentResultsPage() {
  const { profile } = useAuth()
  const [results, setResults] = useState<CBTResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const studentProfile = profile?.role === "student" ? profile : null
    if (!studentProfile?.studentId) return

    const q = query(
      collection(db, "results"),
      where("studentId", "==", studentProfile.studentId)
    )
    
    const unsub = onSnapshot(q, snap => {
      // Sort client-side to avoid requiring composite indexes
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as CBTResult))
      data.sort((a, b) => b.submittedAt - a.submittedAt)
      setResults(data)
      setLoading(false)
    })
    
    return () => unsub()
  }, [profile])

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pt-4 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground">My Results</h1>
        <p className="text-muted-foreground mt-1">View your performance reports for completed CBTs.</p>
      </div>

      {results.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-3xl bg-secondary/50">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Trophy className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">No results yet</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              You haven't completed any CBT tests yet. Once you finish a test, your detailed performance report will appear here.
            </p>
            <Link href="/student">
              <Button className="rounded-xl px-8 gradient-bg border-0 text-white font-bold btn-glow">
                Explore Tests
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {results.map((result, i) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="premium-card flex flex-col h-full overflow-hidden group"
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${result.isPublished ? 'from-emerald-400 to-teal-500' : 'from-amber-400 to-orange-500'}`} />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {new Date(result.submittedAt).toLocaleDateString()}
                    </span>
                    {result.isPublished ? (
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                        <ShieldAlert className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-6 leading-snug">{result.courseTitle}</h3>
                  
                  {result.isPublished ? (
                    <div className="bg-secondary/50 rounded-2xl p-4 mb-6 border border-border flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Score</p>
                        <p className="text-2xl font-black text-foreground">{result.score} <span className="text-sm text-muted-foreground font-medium">/ {result.totalMarks}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Accuracy</p>
                        <p className="text-2xl font-black text-indigo-600">{result.accuracy}%</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-secondary/50 rounded-2xl p-4 mb-6 border border-border text-center">
                      <p className="text-sm font-medium text-muted-foreground">Score hidden pending admin verification.</p>
                    </div>
                  )}

                  <div className="mt-auto pt-2">
                    <Link href={`/student/results/${result.id}`}>
                      <Button 
                        variant={result.isPublished ? "default" : "outline"}
                        className={`w-full h-12 rounded-xl font-bold text-base gap-2 group-hover:scale-[1.02] transition-transform ${result.isPublished ? 'gradient-bg border-0 text-white btn-glow' : 'border-border'}`}
                      >
                        {result.isPublished ? "View Full Report" : "Check Status"}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
