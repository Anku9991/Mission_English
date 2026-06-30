"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, CheckCircle2, ShieldAlert, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import type { CBTResult } from "@/types"
import { motion } from "framer-motion"

export default function AdminResultsPage() {
  const [results, setResults] = useState<CBTResult[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, "results"), orderBy("submittedAt", "desc"))
    const unsub = onSnapshot(q, snap => {
      setResults(snap.docs.map(d => ({ id: d.id, ...d.data() } as CBTResult)))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const handlePublishToggle = async (resultId: string, currentStatus: boolean) => {
    setUpdating(resultId)
    try {
      await updateDoc(doc(db, "results", resultId), {
        isPublished: !currentStatus
      })
    } catch (err: any) {
      alert("Error updating result status: " + err.message)
    } finally {
      setUpdating(null)
    }
  }

  const handleDeleteResult = async (resultId: string) => {
    if (!confirm("Are you sure you want to permanently delete this result? This will allow the student to retake the test. This action cannot be undone.")) return
    setUpdating(resultId)
    try {
      await deleteDoc(doc(db, "results", resultId))
    } catch (err: any) {
      alert("Error deleting result: " + err.message)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="pb-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Student Results</h1>
        <p className="text-slate-500 mt-1">Review test submissions and publish scores to students.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-600 mb-1">No Submissions Yet</h3>
          <p className="text-slate-400 text-sm">When students complete a CBT test, their results will appear here.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="premium-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-premium">
                <thead>
                  <tr>
                    <th className="pl-8">Student</th>
                    <th>Test Name</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th className="pr-8 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-900">{r.studentName}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{r.studentId}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      {r.courseTitle}
                      <div className="text-xs text-slate-400 font-normal mt-0.5">
                        {new Date(r.submittedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-black text-slate-900">{r.score} <span className="text-slate-400 font-medium text-sm">/ {r.totalMarks}</span></div>
                    </td>
                    <td className="p-4">
                      {r.isPublished ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                          <ShieldAlert className="w-3.5 h-3.5" /> Pending Verification
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handlePublishToggle(r.id, !!r.isPublished)}
                          disabled={updating === r.id}
                          variant={r.isPublished ? "outline" : "default"}
                          className={`h-9 rounded-xl text-xs font-bold px-4 ${!r.isPublished ? "gradient-bg border-0 text-white shadow-md btn-glow" : ""}`}
                        >
                          {updating === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                           r.isPublished ? "Unpublish" : "Publish Result"}
                        </Button>
                        <Link href={`/admin/results/${r.id}`}>
                          <Button
                            variant="outline"
                            className="h-9 w-9 p-0 rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleDeleteResult(r.id)}
                          disabled={updating === r.id}
                          variant="ghost"
                          className="h-9 w-9 p-0 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                          title="Delete Result (Allow Retake)"
                        >
                          {updating === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
      )}
    </div>
  )
}
