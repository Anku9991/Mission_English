"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, CreditCard, Activity } from "lucide-react"

export default function AdminDashboard() {
  const { profile } = useAuth()

  const stats = [
    { title: "Total Students", value: "1,245", icon: Users, trend: "+12% from last month" },
    { title: "Active Tests", value: "48", icon: BookOpen, trend: "+4 new this week" },
    { title: "Total Revenue", value: "₹45,230", icon: CreditCard, trend: "+8% from last month" },
    { title: "Avg. Accuracy", value: "68%", icon: Activity, trend: "-2% from last month" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your platform's performance.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Icon className="w-4 h-4 text-slate-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <p className="text-xs text-slate-400 mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Student list will be connected to Firestore in the next phase.</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Manual UPI payments will appear here for approval.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
