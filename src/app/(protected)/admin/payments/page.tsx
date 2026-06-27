"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, Loader2, IndianRupee, User, BookOpen, Hash, AlertCircle } from "lucide-react"
import type { PaymentRequest } from "@/types"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")

  useEffect(() => {
    const q = query(collection(db, "payment_requests"), orderBy("submittedAt", "desc"))
    const unsub = onSnapshot(q, snap => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentRequest)))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const handleApprove = async (p: PaymentRequest) => {
    if (!confirm(`Approve payment for "${p.courseTitle}" by ${p.studentName}?`)) return
    setProcessing(p.id)
    try {
      // 1. Unlock course for student (add to unlockedCourses array)
      await updateDoc(doc(db, "students", p.studentId), {
        unlockedCourses: arrayUnion(p.courseId),
        paymentStatus: "Paid",
      })
      // 2. Mark payment as approved
      await updateDoc(doc(db, "payment_requests", p.id), {
        status: "approved",
        reviewedAt: Date.now(),
      })
    } catch (err: any) {
      alert("Error approving: " + err.message)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (p: PaymentRequest) => {
    if (!confirm(`Reject payment for "${p.courseTitle}" by ${p.studentName}?`)) return
    setProcessing(p.id)
    try {
      await updateDoc(doc(db, "payment_requests", p.id), {
        status: "rejected",
        reviewedAt: Date.now(),
      })
    } catch (err: any) {
      alert("Error rejecting: " + err.message)
    } finally {
      setProcessing(null)
    }
  }

  const filtered = filter === "all" ? payments : payments.filter(p => p.status === filter)
  const pendingCount = payments.filter(p => p.status === "pending").length

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Payment Approvals</h1>
          <p className="text-slate-500 mt-1 text-sm">Verify UPI transactions and unlock course access</p>
        </div>
        {pendingCount > 0 && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-sm font-semibold"
          >
            <AlertCircle className="w-4 h-4" />
            {pendingCount} pending
          </motion.div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["pending", "approved", "rejected", "all"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
              filter === f
                ? f === "pending" ? "bg-amber-500 text-white shadow-md"
                  : f === "approved" ? "bg-emerald-500 text-white shadow-md"
                  : f === "rejected" ? "bg-red-500 text-white shadow-md"
                  : "gradient-bg text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f === "all" ? `All (${payments.length})` :
             f === "pending" ? `⏳ Pending (${payments.filter(p => p.status === "pending").length})` :
             f === "approved" ? `✅ Approved (${payments.filter(p => p.status === "approved").length})` :
             `❌ Rejected (${payments.filter(p => p.status === "rejected").length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
          <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-600 mb-2">No {filter === "all" ? "" : filter} payments</h3>
          <p className="text-slate-400 text-sm">When students submit payment proofs, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((p, i) => {
              const isProcessing = processing === p.id
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  className="premium-card p-5 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status badge */}
                        {p.status === "pending" && (
                          <span className="badge-warning"><Clock className="w-3 h-3 mr-1" /> Pending</span>
                        )}
                        {p.status === "approved" && (
                          <span className="badge-success"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</span>
                        )}
                        {p.status === "rejected" && (
                          <span className="badge-error"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>
                        )}
                        <span className="font-bold text-slate-900 text-lg flex items-center gap-0.5">
                          <IndianRupee className="w-4 h-4" />{p.amount}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-800">{p.studentName}</span>
                          <span className="text-xs text-slate-400">({p.studentId})</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          {p.courseTitle}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-500">Txn ID:</span>
                        <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg text-xs font-bold tracking-wider">
                          {p.txnId}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">
                        Submitted: {new Date(p.submittedAt).toLocaleString("en-IN")}
                        {p.reviewedAt && <> · Reviewed: {new Date(p.reviewedAt).toLocaleString("en-IN")}</>}
                      </p>
                    </div>

                    {/* Actions */}
                    {p.status === "pending" && (
                      <div className="flex gap-3 shrink-0">
                        <Button
                          variant="outline"
                          onClick={() => handleReject(p)}
                          disabled={isProcessing}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl gap-2"
                        >
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleApprove(p)}
                          disabled={isProcessing}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2"
                        >
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          Approve & Unlock
                        </Button>
                      </div>
                    )}
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
