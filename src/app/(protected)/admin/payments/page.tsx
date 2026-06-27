"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"

const MOCK_PAYMENTS: any[] = []

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState(MOCK_PAYMENTS)

  const handleAction = (id: string, action: "approve" | "reject") => {
    if (confirm(`Are you sure you want to ${action} this payment?`)) {
      setPayments(payments.map(p => p.id === id ? { ...p, status: action === "approve" ? "approved" : "rejected" } : p))
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Payment Approvals</h1>
        <p className="text-slate-500 mt-1">Verify manual UPI transactions and unlock content for students.</p>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <Card key={payment.id} className="border-0 shadow-sm">
            <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-lg">{payment.amount}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-medium text-blue-600">{payment.student}</span>
                  {payment.status === 'pending' && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold uppercase rounded-md ml-2 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> Pending
                    </span>
                  )}
                  {payment.status === 'approved' && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-md ml-2 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                    </span>
                  )}
                  {payment.status === 'rejected' && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold uppercase rounded-md ml-2 flex items-center">
                      <XCircle className="w-3 h-3 mr-1" /> Rejected
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600">Item: {payment.item}</p>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-slate-500">Txn ID:</span>
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{payment.txnId}</span>
                  <span className="text-slate-400 text-xs ml-2">{payment.date}</span>
                </div>
              </div>

              {payment.status === 'pending' && (
                <div className="flex space-x-3 shrink-0">
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleAction(payment.id, 'reject')}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(payment.id, 'approve')}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
