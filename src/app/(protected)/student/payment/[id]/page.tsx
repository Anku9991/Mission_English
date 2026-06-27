"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2, ShieldCheck, Loader2, IndianRupee, QrCode, Upload, Clock, AlertCircle, Hash } from "lucide-react"
import type { Course, PaymentRequest } from "@/types"
import { motion } from "framer-motion"
import Image from "next/image"

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const courseId = resolvedParams.id
  
  const router = useRouter()
  const { profile } = useAuth()
  
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [txnId, setTxnId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  
  const [existingPayment, setExistingPayment] = useState<PaymentRequest | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!profile) return
      try {
        // Fetch course
        const docSnap = await getDoc(doc(db, "courses", courseId))
        if (!docSnap.exists()) throw new Error("Course not found")
        const courseData = { id: docSnap.id, ...docSnap.data() } as Course
        setCourse(courseData)

        // Check if already submitted a pending payment
        const studentProfile = profile as any
        const q = query(
          collection(db, "payment_requests"),
          where("studentId", "==", studentProfile.studentId),
          where("courseId", "==", courseId)
        )
        const paymentDocs = await getDocs(q)
        // Find latest pending or approved
        const activePayment = paymentDocs.docs
          .map(d => ({ id: d.id, ...d.data() } as PaymentRequest))
          .find(p => p.status === "pending" || p.status === "approved")
        
        if (activePayment) {
          setExistingPayment(activePayment)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [courseId, profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txnId.trim() || !course || !profile) return
    setSubmitting(true)
    try {
      const studentProfile = profile as any
      const data: Omit<PaymentRequest, "id"> = {
        studentId: studentProfile.studentId,
        studentName: studentProfile.fullName,
        courseId: course.id,
        courseTitle: course.title,
        amount: course.price,
        txnId: txnId.trim().toUpperCase(),
        status: "pending",
        submittedAt: Date.now()
      }
      const docRef = await addDoc(collection(db, "payment_requests"), data)
      setExistingPayment({ id: docRef.id, ...data })
    } catch (err: any) {
      alert("Error submitting payment proof: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-500 font-medium">Loading payment details...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Course not found</h2>
        <Link href="/student"><Button className="mt-4">Back to Dashboard</Button></Link>
      </div>
    )
  }

  // Already paid / pending approval
  if (existingPayment) {
    return (
      <div className="max-w-2xl mx-auto pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="p-8 text-center">
            {existingPayment.status === "approved" ? (
              <>
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-200">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Payment Approved!</h1>
                <p className="text-slate-600 mb-8">Your access to <strong>{course.title}</strong> has been unlocked.</p>
                <Link href="/student">
                  <Button className="w-full sm:w-auto px-10 h-14 rounded-2xl gradient-bg border-0 btn-glow font-bold text-lg text-white">
                    Start Learning Now
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-amber-200">
                  <Clock className="w-10 h-10 animate-pulse" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Verification Pending</h1>
                <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                  We've received your transaction details (<strong className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">{existingPayment.txnId}</strong>). 
                  Our admin is verifying the payment and will unlock the course shortly.
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-left mb-8">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 font-medium leading-relaxed">
                    Verification usually takes 15-30 minutes during working hours. 
                    You can close this page; the course will automatically unlock in your dashboard once approved.
                  </p>
                </div>
                <Link href="/student">
                  <Button variant="outline" className="px-8 h-12 rounded-xl border-slate-200 font-bold">
                    Return to Dashboard
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/student">
          <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 border border-slate-200">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Checkout</h1>
          <p className="text-slate-500 mt-1 font-medium">Complete your payment to unlock access</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6 lg:order-2">
          <Card className="border-0 shadow-sm rounded-3xl overflow-hidden premium-card">
            <div className="p-6 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 mb-1">Order Summary</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
                  {course.type.toUpperCase()}
                </span>
                <h4 className="font-bold text-slate-900 leading-tight mb-2">{course.title}</h4>
                <p className="text-sm text-slate-500 line-clamp-2">{course.description}</p>
              </div>
              
              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600 font-medium">Price</span>
                  <span className="font-semibold text-slate-900 flex items-center">
                    <IndianRupee className="w-3.5 h-3.5" />{course.price}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 mb-4">
                  <span className="font-medium">Internet Handling Fee</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="font-bold text-slate-900 text-lg">Total Amount</span>
                  <span className="font-black text-2xl text-slate-900 flex items-center">
                    <IndianRupee className="w-5 h-5" />{course.price}
                  </span>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-emerald-900 text-sm mb-1">100% Secure Payment</h5>
              <p className="text-xs text-emerald-700">Your transaction is secured and verified manually by our team to prevent fraud.</p>
            </div>
          </div>
        </div>

        {/* Payment Flow */}
        <div className="lg:col-span-3 lg:order-1">
          <Card className="border-0 shadow-sm rounded-3xl premium-card h-full">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Scan & Pay via UPI</h2>
                  <p className="text-sm text-slate-500">Pay using GPay, PhonePe, Paytm or any UPI app</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                {/* QR Code Placeholder - In real app, generate from UPI ID dynamically */}
                <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 relative shrink-0">
                  <Image src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=missionenglish@upi&pn=Mission%20English&am=499" alt="UPI QR Code" width={168} height={168} className="w-full h-full object-contain opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center flex-col text-center p-4 bg-white/90 backdrop-blur-[2px] rounded-2xl">
                    <QrCode className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Demo QR Code</p>
                  </div>
                </div>
                
                <div className="space-y-4 w-full">
                  <div>
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">UPI ID</Label>
                    <div className="font-mono text-lg font-bold text-slate-900 mt-1">missionenglish@upi</div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Merchant Name</Label>
                    <div className="font-semibold text-slate-800 mt-1">Mission English Academy</div>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount to Pay</Label>
                    <div className="text-2xl font-black text-blue-600 mt-1 flex items-center">
                      <IndianRupee className="w-5 h-5" />{course.price}
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-800">Enter Transaction ID / UTR Number *</Label>
                  <p className="text-xs text-slate-500 mb-2">After paying, find the 12-digit UTR/Txn ID in your UPI app and enter it below.</p>
                  <div className="relative">
                    <Hash className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <Input
                      required
                      placeholder="e.g. 312345678901"
                      className="pl-12 h-14 rounded-2xl input-premium font-mono text-lg font-bold uppercase placeholder:normal-case placeholder:font-sans"
                      value={txnId}
                      onChange={(e) => setTxnId(e.target.value.replace(/\s/g, ""))}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={submitting || txnId.length < 8}
                  className="w-full h-14 rounded-2xl gradient-bg border-0 text-white font-bold text-lg btn-glow gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {submitting ? "Submitting Proof..." : "Submit Payment Proof"}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
