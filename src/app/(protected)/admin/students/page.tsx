"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

export default function AdminStudentsPage() {
  const STUDENTS: any[] = []

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Students</h1>
        <p className="text-slate-500 mt-1">Manage all registered students and their access.</p>
      </div>

      {STUDENTS.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No students registered</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Once students start signing up via Phone OTP, they will appear in this list.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {STUDENTS.map((student, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900">{student.name}</h3>
                  <p className="text-sm text-slate-500">{student.phone}</p>
                </div>
                <Button variant="outline">View Profile</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
