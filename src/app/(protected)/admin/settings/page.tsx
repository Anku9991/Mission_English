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
          <div className="h-2 gradient-bg" />
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" /> Payment & Checkout
            </CardTitle>
            <CardDescription>Configure the UPI details that students will see on the payment page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">UPI ID</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="e.g. yourname@upi" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="pl-9 h-11 rounded-xl input-premium"
                  />
                </div>
                <p className="text-xs text-slate-500">The UPI ID where payments should be sent.</p>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Merchant/Business Name</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="e.g. Mission English Academy" 
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="pl-9 h-11 rounded-xl input-premium"
                  />
                </div>
                <p className="text-xs text-slate-500">The name displayed on the checkout page.</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <Label className="font-bold text-slate-700">Custom QR Code Image URL (Optional)</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="https://example.com/my-qr-code.png" 
                  value={qrUrl}
                  onChange={(e) => setQrUrl(e.target.value)}
                  className="pl-9 h-11 rounded-xl input-premium"
                />
              </div>
              <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                If provided, this image will be displayed on the checkout page. If left blank, the system will automatically generate a dynamic QR code using your UPI ID.
              </p>
            </div>

            {qrUrl && (
              <div className="mt-4 p-4 border rounded-xl bg-slate-50 inline-block">
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">QR Preview</p>
                <img src={qrUrl} alt="QR Preview" className="w-32 h-32 object-contain rounded-lg shadow-sm" />
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="h-11 px-8 rounded-xl gradient-bg border-0 btn-glow font-bold text-white gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Payment Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
