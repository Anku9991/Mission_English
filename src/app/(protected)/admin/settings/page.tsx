"use client"

import { useEffect, useState } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, QrCode, CreditCard, Link as LinkIcon, Trash2 } from "lucide-react"
import { collection, getDocs, deleteDoc } from "firebase/firestore"

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

  const handleClearData = async () => {
    if (!window.confirm("WARNING: This will permanently delete ALL students, results, and payments. Your admin account will not be affected. Are you 100% sure?")) return;
    setSaving(true)
    try {
      // Clear Students
      const studentSnap = await getDocs(collection(db, "students"))
      for (const doc of studentSnap.docs) await deleteDoc(doc.ref)
      
      // Clear Results
      const resultsSnap = await getDocs(collection(db, "results"))
      for (const doc of resultsSnap.docs) await deleteDoc(doc.ref)
      
      // Clear Payments
      const paymentsSnap = await getDocs(collection(db, "payment_requests"))
      for (const doc of paymentsSnap.docs) await deleteDoc(doc.ref)
      
      alert("All student data has been successfully cleared.")
    } catch (err: any) {
      alert("Error clearing data: " + err.message)
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
        <h1 className="text-3xl font-black text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">Manage global configurations for Mission English.</p>
      </div>

      <div className="space-y-8">
        <Card className="border-0 shadow-sm premium-card overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <CardHeader className="bg-secondary/50 border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" /> Payment & Checkout
            </CardTitle>
            <CardDescription>Payment gateway configurations for Mission English.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-emerald-600">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Automated Payments Active</h3>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                Your platform is fully integrated with **Razorpay**. 
                All payments, including UPI, Cards, and Netbanking, are processed automatically and securely.
              </p>
              <div className="mt-6 p-4 bg-card rounded-xl border border-border inline-block text-sm font-medium text-muted-foreground">
                To manage payouts, refunds, or check transactions, please visit your <a href="https://dashboard.razorpay.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Razorpay Dashboard</a>.
              </div>
            </div>
          </CardContent>
        <Card className="border-0 shadow-sm premium-card overflow-hidden border-red-200 dark:border-red-900/50">
          <div className="h-2 bg-gradient-to-r from-red-500 to-rose-600" />
          <CardHeader className="bg-secondary/50 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="w-5 h-5" /> Danger Zone
            </CardTitle>
            <CardDescription>Permanently remove data from the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="p-4 border border-red-200 dark:border-red-900/50 rounded-xl bg-red-50 dark:bg-red-950/20">
              <h3 className="font-bold text-red-600 dark:text-red-400 mb-2">Clear All Student Data</h3>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                This action will permanently delete all students, their test results, and payment histories. This cannot be undone. 
                Your courses, tests, and admin account will remain safe.
              </p>
              <Button 
                variant="destructive" 
                onClick={handleClearData} 
                disabled={saving}
                className="font-bold rounded-xl"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                {saving ? "Deleting..." : "Permanently Delete Data"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
