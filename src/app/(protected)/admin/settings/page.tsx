"use client"

import { useEffect, useState } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, QrCode, CreditCard, Link as LinkIcon } from "lucide-react"

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [upiId, setUpiId] = useState("")
  const [merchantName, setMerchantName] = useState("")
  const [qrUrl, setQrUrl] = useState("")

  useEffect(() => {
    async function loadSettings() {
      try {
        const docSnap = await getDoc(doc(db, "settings", "payment"))
        if (docSnap.exists()) {
          const data = docSnap.data()
          setUpiId(data.upiId || "")
          setMerchantName(data.merchantName || "")
          setQrUrl(data.qrUrl || "")
        }
      } catch (err) {
        console.error("Failed to load settings", err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, "settings", "payment"), {
        upiId: upiId.trim(),
        merchantName: merchantName.trim(),
        qrUrl: qrUrl.trim()
      }, { merge: true })
      alert("Settings saved successfully!")
    } catch (err: any) {
      alert("Error saving settings: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
  }

  return (
    <div className="max-w-4xl pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Platform Settings</h1>
        <p className="text-slate-500 mt-1">Manage global configurations for Mission English.</p>
      </div>

      <div className="space-y-8">
        <Card className="border-0 shadow-sm premium-card overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" /> Payment & Checkout
            </CardTitle>
            <CardDescription>Payment gateway configurations for Mission English.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-emerald-600">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Automated Payments Active</h3>
              <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                Your platform is fully integrated with **Razorpay**. 
                All payments, including UPI, Cards, and Netbanking, are processed automatically and securely.
              </p>
              <div className="mt-6 p-4 bg-white rounded-xl border border-emerald-100 inline-block text-sm font-medium text-slate-500">
                To manage payouts, refunds, or check transactions, please visit your <a href="https://dashboard.razorpay.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Razorpay Dashboard</a>.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
