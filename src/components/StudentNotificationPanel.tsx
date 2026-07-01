"use client"

import { useEffect, useState, useRef } from "react"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Bell, CheckCircle2, XCircle, Clock, IndianRupee } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { PaymentRequest } from "@/types"
import { useAuth } from "@/lib/auth-context"

export default function StudentNotificationPanel() {
  const { user, profile } = useAuth()
  const [payments, setPayments] = useState<PaymentRequest[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  const panelRef = useRef<HTMLDivElement>(null)
  const isInitialLoad = useRef(true)

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      osc.type = "sine"
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime) // C6 note
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
      
      osc.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
      
      setTimeout(() => {
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.frequency.setValueAtTime(1318.51, ctx.currentTime) // E6 note
        gain2.gain.setValueAtTime(0.1, ctx.currentTime)
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.start()
        osc2.stop(ctx.currentTime + 0.3)
      }, 200)
    } catch (e) {
      console.log("Audio play blocked", e)
    }
  }

  useEffect(() => {
    if (!user || !profile || profile.role !== "student") return

    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission()
    }

    const q = query(
      collection(db, "payment_requests"), 
      where("studentId", "==", (profile as any).studentId),
      orderBy("submittedAt", "desc")
    )
    
    const unsub = onSnapshot(q, snap => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentRequest)))

      if (!isInitialLoad.current) {
        snap.docChanges().forEach((change) => {
          if (change.type === "modified") {
            const data = change.doc.data() as PaymentRequest
            
            // Only alert if status changed to approved or rejected
            if (data.status === "approved" || data.status === "rejected") {
              setUnreadCount(prev => prev + 1)
              playNotificationSound()
              
              if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200])
              }

              if ("Notification" in window && Notification.permission === "granted") {
                new Notification(`Payment ${data.status.toUpperCase()}!`, {
                  body: `Your payment for ${data.courseTitle} has been ${data.status}.`,
                  icon: "/logo.jpeg"
                })
              }
            }
          }
        })
      }
      isInitialLoad.current = false
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!user) return null

  return (
    <div className="fixed top-3 right-16 z-50 md:top-6 md:right-8" ref={panelRef}>
      <button 
        onClick={() => { setIsOpen(!isOpen); setUnreadCount(0); }}
        className="relative p-3 bg-white border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-slate-50 focus:outline-none"
      >
        <Bell className="w-6 h-6 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

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
              <h3 className="font-bold text-slate-800">Your Notifications</h3>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {payments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium">No recent notifications</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {payments.map(p => {
                    return (
                      <li key={p.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-bold text-slate-900 line-clamp-1">{p.courseTitle}</p>
                            <span className="font-bold text-slate-600 text-sm flex items-center bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                              <IndianRupee className="w-3 h-3 mr-0.5" />{p.amount}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            {p.status === "pending" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3 h-3 mr-1" /> Pending Review</span>
                            )}
                            {p.status === "approved" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Payment Approved</span>
                            )}
                            {p.status === "rejected" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200"><XCircle className="w-3 h-3 mr-1" /> Payment Rejected</span>
                            )}
                          </div>
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
