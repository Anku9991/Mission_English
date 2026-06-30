"use client"

import { useEffect, useState, useRef } from "react"
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Bell, CheckCircle2, XCircle, Loader2, IndianRupee } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { PaymentRequest } from "@/types"

export default function NotificationPanel() {
  const [payments, setPayments] = useState<PaymentRequest[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  const panelRef = useRef<HTMLDivElement>(null)

  // Listen to pending payments
  useEffect(() => {
    const q = query(
      collection(db, "payment_requests"), 
      where("status", "==", "pending"),
      orderBy("submittedAt", "desc")
    )
    
    const unsub = onSnapshot(q, snap => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentRequest)))
    })
    return () => unsub()
  }, [])

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleApprove = async (p: PaymentRequest) => {
    setProcessingId(p.id)
    try {
      await updateDoc(doc(db, "students", p.studentId), {
        unlockedCourses: arrayUnion(p.courseId),
        paymentStatus: "Paid",
      })
      await updateDoc(doc(db, "payment_requests", p.id), {
        status: "approved",
        reviewedAt: Date.now(),
      })
    } catch (err: any) {
      alert("Error approving: " + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (p: PaymentRequest) => {
    setProcessingId(p.id)
    try {
      await updateDoc(doc(db, "payment_requests", p.id), {
        status: "rejected",
        reviewedAt: Date.now(),
      })
    } catch (err: any) {
      alert("Error rejecting: " + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 md:top-6 md:right-8" ref={panelRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-slate-50 focus:outline-none"
      >
        <Bell className="w-6 h-6 text-slate-700" />
        {payments.length > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {payments.length}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Notifications</h3>
              <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                {payments.length} Pending
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {payments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium">No pending approvals</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {payments.map(p => {
                    const isProcessing = processingId === p.id
                    return (
                      <li key={p.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{p.studentName}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{p.courseTitle}</p>
                          </div>
                          <span className="font-bold text-emerald-600 text-sm flex items-center bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                            <IndianRupee className="w-3 h-3 mr-0.5" />{p.amount}
                          </span>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleApprove(p)}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(p)}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                            Reject
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
