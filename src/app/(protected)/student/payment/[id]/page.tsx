"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Copy, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react"

import { use } from "react"

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [transactionId, setTransactionId] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)

  const upiId = "missionenglish@upi"
  const price = "₹299"
  const itemName = "SSC CGL English Tier 1 (Mock Test)"

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (transactionId.length > 5) {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto pt-10">
        <Card className="text-center py-12 border-0 shadow-lg">
          <CardContent className="space-y-6 flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Payment Sent for Verification</h2>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">
                Thank you! We have received your Transaction ID. An admin will verify the payment and unlock your course shortly.
              </p>
            </div>
            <Link href="/student">
              <Button className="mt-4">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto pt-4 pb-20">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/student">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Complete Purchase</h1>
          <p className="text-slate-500 mt-1">Unlock {itemName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Payment Details */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-blue-900 text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center py-3 border-b border-blue-100">
                <span className="text-slate-600">Item</span>
                <span className="font-semibold text-slate-900 text-right max-w-[200px] truncate">{itemName}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-blue-100">
                <span className="text-slate-600">Total Amount</span>
                <span className="text-2xl font-bold text-blue-700">{price}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-700 mt-4 bg-blue-100/50 p-3 rounded-lg">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>100% Secure Manual Verification</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Submit Transaction ID</CardTitle>
              <CardDescription>After paying, enter the 12-digit UTR/Transaction ID below.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="txnId">Transaction ID / UTR Number</Label>
                  <Input 
                    id="txnId" 
                    placeholder="e.g. 312345678901" 
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                    className="font-mono"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={transactionId.length < 5}>
                  Submit Payment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* QR Code & Instructions */}
        <div>
          <Card className="border-0 shadow-sm overflow-hidden h-full">
            <div className="bg-slate-900 p-6 text-center text-white">
              <QrCode className="w-12 h-12 mx-auto mb-3 text-blue-400" />
              <h3 className="text-xl font-bold">Scan & Pay</h3>
              <p className="text-slate-400 text-sm mt-1">Use Google Pay, PhonePe, or Paytm</p>
            </div>
            <CardContent className="p-8 flex flex-col items-center">
              {/* Fake QR Code box */}
              <div className="w-48 h-48 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center mb-6">
                <span className="text-slate-400 font-medium text-center px-4">Upload Admin QR Code Image Here</span>
              </div>
              
              <div className="text-center w-full">
                <p className="text-sm text-slate-500 mb-2">Or pay to this UPI ID:</p>
                <div className="flex items-center justify-center space-x-2 bg-slate-100 p-3 rounded-lg w-full">
                  <span className="font-mono font-bold text-slate-800">{upiId}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200" onClick={handleCopy}>
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
