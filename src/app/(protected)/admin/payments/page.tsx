"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, addDoc, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, Loader2, IndianRupee, User, BookOpen, Hash, Download, Zap } from "lucide-react"
import type { PaymentRequest } from "@/types"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("approved")
  const [selectedDate, setSelectedDate] = useState<string>("") // YYYY-MM-DD

  useEffect(() => {
    let q = query(collection(db, "payment_requests"), orderBy("submittedAt", "desc"))

    if (selectedDate) {
      const start = new Date(selectedDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(selectedDate)
      end.setHours(23, 59, 59, 999)

      q = query(
        collection(db, "payment_requests"),
        where("submittedAt", ">=", start.getTime()),
        where("submittedAt", "<=", end.getTime()),
        orderBy("submittedAt", "desc")
      )
    }

    const unsub = onSnapshot(q, snap => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentRequest)))
      setLoading(false)
    })
    return () => unsub()
  }, [selectedDate])

  const exportToCSV = () => {
    const dataToExport = filter === "all" ? payments : filtered
    if (dataToExport.length === 0) {
      alert("No data to export")
      return
    }

    const headers = ["User ID", "Name", "Course", "Amount (INR)", "Transaction ID", "Status", "Date Submitted"]
    const rows = dataToExport.map(p => [
      `"${p.studentId}"`,
      `"${p.studentName.replace(/"/g, '""')}"`,
      `"${p.courseTitle.replace(/"/g, '""')}"`,
      p.amount,
      `"${p.txnId}"`,
      `"${p.status}"`,
      `"${new Date(p.submittedAt).toLocaleString("en-IN")}"`
    ])

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `payments_${filter}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filtered = filter === "all" ? payments : payments.filter(p => p.status === filter)
  const pendingCount = payments.filter(p => p.status === "pending").length

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Payment Ledger</h1>
          <p className="text-slate-500 mt-1 text-sm">Automated transactions powered by Razorpay</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold">
            <Zap className="w-4 h-4 fill-emerald-500" /> Auto-Verification Active
          </div>
          <Button 
            onClick={exportToCSV} 
            variant="outline" 
            className="gap-2 rounded-xl text-sm font-semibold border-slate-200 shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Date Filter & Status Tabs */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-sm font-semibold text-slate-500">Date:</span>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm font-medium outline-none bg-transparent text-slate-700"
          />
          {selectedDate && (
            <button onClick={() => setSelectedDate("")} className="text-xs text-red-500 hover:underline ml-2 font-medium">Clear</button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
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
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3 h-3 mr-1" /> Pending</span>
                        )}
                        {p.status === "approved" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</span>
                        )}
                        {p.status === "rejected" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>
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
