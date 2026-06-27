"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, FileText, PlayCircle, Clock, ShieldAlert } from "lucide-react"

const MOCK_CONTENT: any[] = []

export default function StudentDashboard() {
  const { profile } = useAuth()
  
  if (profile?.role === "student" && profile.paymentStatus === "Pending") {
    return (
      <div className="pb-20 flex flex-col items-center justify-center pt-24 min-h-[70vh]">
        <div className="bg-amber-100 p-6 rounded-full mb-6">
          <ShieldAlert className="w-16 h-16 text-amber-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4 text-center">Payment Pending</h1>
        <p className="text-slate-500 max-w-md text-center text-lg mb-8 leading-relaxed">
          Your account has been created successfully, but your payment is currently marked as <span className="font-bold text-amber-600">Pending</span>.
        </p>
        <Card className="w-full max-w-md border-0 shadow-lg bg-white overflow-hidden">
          <div className="bg-slate-900 text-white p-4 text-center">
            <h3 className="font-bold">How to activate your account?</h3>
          </div>
          <CardContent className="p-6">
            <ol className="list-decimal pl-5 space-y-4 text-slate-700">
              <li>Contact your administrator to complete the payment.</li>
              <li>Once payment is verified, the admin will approve your account.</li>
              <li>Refresh this page to access your courses and tests.</li>
            </ol>
            <Button className="w-full mt-6" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (profile?.role === "student" && profile.testUnlocked === false) {
    return (
      <div className="pb-20 flex flex-col items-center justify-center pt-24 min-h-[70vh]">
        <div className="bg-red-100 p-6 rounded-full mb-6">
          <Lock className="w-16 h-16 text-red-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4 text-center">Account Locked</h1>
        <p className="text-slate-500 max-w-md text-center text-lg mb-8 leading-relaxed">
          Your account is currently locked by the administrator. You cannot access tests or courses at this time.
        </p>
        <Button onClick={() => window.location.reload()} size="lg">
          Check Status Again
        </Button>
      </div>
    )
  }

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back!</h1>
        <p className="text-slate-500 mt-1">Continue your learning journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_CONTENT.map((item) => (
          <Card key={item.id} className={`border-0 shadow-sm relative overflow-hidden ${item.status === 'locked' ? 'bg-slate-50' : 'bg-white'}`}>
            {item.status === 'locked' && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-full shadow-lg mb-3">
                  <Lock className="h-6 w-6 text-slate-400" />
                </div>
                <Button className="shadow-lg">Unlock for {item.price}</Button>
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-center space-x-2 mb-2">
                {item.type === 'cbt' && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-md">CBT Test</span>}
                {item.type === 'course' && <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase rounded-md">Video Course</span>}
                {item.type === 'notes' && <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase rounded-md">PDF Notes</span>}
              </div>
              <CardTitle className="text-xl leading-tight">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 text-sm text-slate-500 mb-6">
                <div className="flex items-center space-x-1">
                  {item.type === 'cbt' && <FileText className="w-4 h-4" />}
                  {item.type === 'course' && <PlayCircle className="w-4 h-4" />}
                  {item.type === 'notes' && <FileText className="w-4 h-4" />}
                  <span>{item.questions || item.pages || "12"} {item.type === 'cbt' ? 'Qs' : 'Pages/Videos'}</span>
                </div>
                {item.duration && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{item.duration}</span>
                  </div>
                )}
              </div>
              
              {item.status === 'unlocked' && item.type === 'cbt' && (
                <Link href={`/cbt/${item.id}`}>
                  <Button className="w-full">Start Test</Button>
                </Link>
              )}
              {item.status === 'unlocked' && item.type !== 'cbt' && (
                <Button variant="outline" className="w-full">View Content</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
