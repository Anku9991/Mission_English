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
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your student profile and preferences.</p>
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
              <p className="text-xs text-muted-foreground">Phone number cannot be changed as it is used for login.</p>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Legal & Policies for Razorpay Compliance */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Legal & Policies</CardTitle>
            <CardDescription>Information regarding our services and policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <details className="group border border-border rounded-lg p-4 bg-card cursor-pointer">
              <summary className="font-semibold text-foreground outline-none list-none flex justify-between items-center">
                About Us
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p>Welcome to Mission English! We are dedicated to providing the best online learning platform for students preparing for competitive exams.</p>
                <p>Our mission is to make quality education accessible and affordable to everyone.</p>
              </div>
            </details>

            <details className="group border border-border rounded-lg p-4 bg-card cursor-pointer">
              <summary className="font-semibold text-foreground outline-none list-none flex justify-between items-center">
                Contact Us
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p>If you have any questions or concerns, feel free to reach out to our support team.</p>
                <p><strong>Email:</strong> ajaydbg121@gmail.com</p>
                <p><strong>Phone:</strong> +91 8709823853</p>
              </div>
            </details>

            <details className="group border border-border rounded-lg p-4 bg-card cursor-pointer">
              <summary className="font-semibold text-foreground outline-none list-none flex justify-between items-center">
                Cancellation & Refund Policy
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p>1. Since our courses and digital products (PDFs, CBTs) are instantly accessible upon purchase, we generally do not offer refunds.</p>
                <p>2. However, if you experience a technical failure where money was deducted but the course was not unlocked, please contact our support team within 7 days.</p>
                <p>3. Cancellations are only applicable if requested before accessing any course material.</p>
              </div>
            </details>

            <details className="group border border-border rounded-lg p-4 bg-card cursor-pointer">
              <summary className="font-semibold text-foreground outline-none list-none flex justify-between items-center">
                Terms & Conditions
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p>1. By accessing our platform, you agree to abide by these terms and conditions.</p>
                <p>2. Course contents are strictly for personal use and cannot be distributed, resold, or reproduced.</p>
                <p>3. We reserve the right to suspend or terminate accounts found violating our policies or engaging in suspicious activities.</p>
              </div>
            </details>

            <details className="group border border-border rounded-lg p-4 bg-card cursor-pointer">
              <summary className="font-semibold text-foreground outline-none list-none flex justify-between items-center">
                Privacy Policy
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p>1. We collect basic user information (name, phone number) for account creation and personalized experience.</p>
                <p>2. We do not store your payment credentials. All payments are securely processed by Razorpay.</p>
                <p>3. We do not sell or share your personal data with third-party marketing agencies.</p>
              </div>
            </details>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
