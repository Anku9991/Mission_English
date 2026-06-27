"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export default function StudentSettingsPage() {
  const { profile } = useAuth()
  const studentProfile = profile?.role === 'student' ? profile : null;

  return (
    <div className="max-w-4xl pt-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your student profile and preferences.</p>
      </div>

      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="Your Name" defaultValue={studentProfile?.fullName || ""} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input disabled value={studentProfile?.phone || ""} />
              <p className="text-xs text-slate-500">Phone number cannot be changed as it is used for login.</p>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
