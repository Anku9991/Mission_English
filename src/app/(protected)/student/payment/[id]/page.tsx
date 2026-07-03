"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Script from "next/script"
import { doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2, ShieldCheck, Loader2, IndianRupee, CreditCard, Lock, Clock, AlertCircle } from "lucide-react"
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
  const [submitting, setSubmitting] = useState(false)
  
  const [existingPayment, setExistingPayment] = useState<PaymentRequest | null>(null)

  // Load razorpay env directly or via API config if needed, we'll just check if script loads


  useEffect(() => {
    async function loadData() {
      if (!profile) return
      try {
        const studentProfile = profile as any
        // Parallelize network requests
        const [docSnap, paymentDocs] = await Promise.all([
          getDoc(doc(db, "courses", courseId)),
          getDocs(query(
            collection(db, "payment_requests"),
            where("studentId", "==", studentProfile.studentId)
          ))
        ])

        if (!docSnap.exists()) throw new Error("Course not found")
        const courseData = { id: docSnap.id, ...docSnap.data() } as Course
        setCourse(courseData)

        // Find latest pending or approved for THIS specific course
        const activePayment = paymentDocs.docs
          .map(d => ({ id: d.id, ...d.data() } as PaymentRequest))
          .find(p => p.courseId === courseId && (p.status === "pending" || p.status === "approved"))
        
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

  const handlePayNow = async () => {
    if (!course || !profile) return
    setSubmitting(true)
    
    try {
      const studentProfile = profile as any
      
      // 1. Create Razorpay order on server
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: course.price,
          courseId: course.id,
          courseTitle: course.title,
          studentId: studentProfile.studentId
        })
      });
      
      const orderData = await res.json();
      
      if (!res.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // 2. Open Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "", 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Mission English Academy",
        description: `Payment for ${course.title}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            setSubmitting(true)
            // 3. Verify signature on server
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            });
            
            const verifyData = await verifyRes.json();
            
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }
            
            // 4. Save to Firebase directly (since verified and client has update permission)
            const paymentData: Omit<PaymentRequest, "id"> = {
              studentId: studentProfile.studentId,
              studentName: studentProfile.fullName,
              courseId: course.id,
              courseTitle: course.title,
              amount: course.price,
              txnId: response.razorpay_payment_id,
              status: "approved", // instantly approved!
              submittedAt: Date.now(),
              reviewedAt: Date.now()
            };
            
            const docRef = await addDoc(collection(db, "payment_requests"), paymentData);
            
            // Unlock course
            await updateDoc(doc(db, "students", studentProfile.studentId), {
              unlockedCourses: arrayUnion(course.id),
              paymentStatus: "Paid",
            });
            
            setExistingPayment({ id: docRef.id, ...paymentData });
            
          } catch (err: any) {
            alert(err.message);
          } finally {
            setSubmitting(false)
          }
        },
        prefill: {
          name: studentProfile.fullName,
          email: studentProfile.email,
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [
                  {
                    method: "upi"
                  }
                ]
              },
              other: {
                name: "Other Payment Modes",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" }
                ]
              }
            },
            sequence: ["block.upi", "block.other"],
            preferences: {
              show_default_blocks: false
            }
          }
        },
        theme: {
          color: "#2563eb"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        alert("Payment Failed: " + response.error.description);
        setSubmitting(false);
      });
      rzp.open();

    } catch (err: any) {
      alert(err.message)
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
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
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
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Pay Securely Online</h2>
                  <p className="text-sm text-slate-500">UPI, Cards, NetBanking, Wallets supported</p>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center mb-8">
                <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">Automated Instant Unlock</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                  Complete the payment via Razorpay. Once successful, your course will be unlocked immediately without waiting for admin approval!
                </p>
                
                <Button 
                  onClick={handlePayNow} 
                  disabled={submitting}
                  className="w-full sm:w-auto px-10 h-14 rounded-2xl gradient-bg border-0 text-white font-bold text-lg btn-glow gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  {submitting ? "Processing..." : `Pay ₹${course.price} Now`}
                </Button>
              </div>

            </div>
          </Card>
        </div>
      </div>
    </div>
    </>
  )
}
