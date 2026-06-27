"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, getDocs, collection, query, orderBy, limit } from "firebase/firestore"
import { db, secondaryAuth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Save, RefreshCw, Loader2, AlertCircle } from "lucide-react"

export default function AddStudentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState("")

  // Form State
  const [fullName, setFullName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [pin, setPin] = useState("")
  const [course, setCourse] = useState("SSC CGL Tier 1")
  const [batch, setBatch] = useState("Morning Batch")
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending">("Pending")
  const [status, setStatus] = useState<"Active" | "Inactive">("Active")
  const [testUnlocked, setTestUnlocked] = useState<boolean>(false)

  // Auto-generate ID and PIN on load
  useEffect(() => {
    const generateInitialData = async () => {
      try {
        // Generate PIN
        generatePin()
        
        // Fetch latest Student ID to increment
        const q = query(collection(db, "students"), orderBy("studentId", "desc"), limit(1))
        const snapshot = await getDocs(q)
        
        if (snapshot.empty) {
          setStudentId("ME001")
        } else {
          const lastId = snapshot.docs[0].data().studentId as string
          const numStr = lastId.replace("ME", "")
          const nextNum = parseInt(numStr, 10) + 1
          setStudentId(`ME${nextNum.toString().padStart(3, '0')}`)
        }
      } catch (err) {
        console.error("Failed to generate ID:", err)
        setError("Failed to auto-generate Student ID. You can enter it manually.")
      } finally {
        setInitializing(false)
      }
    }
    
    generateInitialData()
  }, [])

  const generatePin = () => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString()
    setPin(newPin)
  }

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !studentId || !phone || !pin) {
      setError("Please fill all required fields (Name, Student ID, Phone, PIN)")
      return
    }
    
    setError("")
    setLoading(true)

    try {
      const formattedStudentId = studentId.toUpperCase().trim()
      const mappedEmail = `${formattedStudentId}@me.com`
      
      // 1. Create user in Firebase Auth using SECONDARY APP (so admin stays logged in)
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, mappedEmail, pin)
      
      // 2. Save student profile to Firestore
      const studentData = {
        uid: userCredential.user.uid,
        studentId: formattedStudentId,
        fullName,
        phone,
        email: email || "",
        course,
        batch,
        paymentStatus,
        status,
        testUnlocked,
        createdAt: Date.now(),
        role: "student"
      }
      
      await setDoc(doc(db, "students", formattedStudentId), studentData)
      
      // 3. Save the plain text PIN in a highly secured admin-only collection for PIN Resets
      await setDoc(doc(db, "secure_pins", formattedStudentId), {
        studentId: formattedStudentId,
        pin: pin,
        uid: userCredential.user.uid,
        updatedAt: Date.now()
      })

      // Success! Redirect back to student list
      router.push("/admin/students")
      
    } catch (err: any) {
      console.error(err)
      setError(err.message.replace("Firebase: ", "") || "Failed to create student")
    } finally {
      setLoading(false)
    }
  }

  if (initializing) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="pb-20 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/admin/students">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Add New Student</h1>
          <p className="text-slate-500 mt-1">Create a new student account with ID and PIN.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-center gap-3 border border-red-100 font-medium">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      <form onSubmit={handleSaveStudent}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Card className="border-0 shadow-sm md:col-span-2">
            <CardHeader className="bg-slate-50 border-b rounded-t-xl">
              <CardTitle>Login Credentials</CardTitle>
              <CardDescription>These will be used by the student to log in.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Student ID (Auto-Generated)</Label>
                <Input 
                  value={studentId} 
                  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                  className="font-bold text-lg uppercase bg-slate-50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>4-Digit PIN</Label>
                <div className="flex gap-2">
                  <Input 
                    value={pin} 
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0,4))}
                    className="font-bold text-lg tracking-widest bg-slate-50"
                    maxLength={4}
                    required
                  />
                  <Button type="button" variant="outline" onClick={generatePin} className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Regenerate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Rahul Kumar" required />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9876543210" required />
              </div>
              <div className="space-y-2">
                <Label>Email (Optional)</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="rahul@example.com" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Enrollment & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Course</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={course} onChange={e => setCourse(e.target.value)}
                >
                  <option value="SSC CGL Tier 1">SSC CGL Tier 1</option>
                  <option value="NDA Complete English">NDA Complete English</option>
                  <option value="CDS Grammar">CDS Grammar</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Batch</Label>
                <Input value={batch} onChange={e => setBatch(e.target.value)} placeholder="e.g. Morning Batch" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>Payment</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as any)}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={status} onChange={e => setStatus(e.target.value as any)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label>Test Access</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={testUnlocked ? "Unlocked" : "Locked"} 
                  onChange={e => setTestUnlocked(e.target.value === "Unlocked")}
                >
                  <option value="Unlocked">Unlocked (Can take tests)</option>
                  <option value="Locked">Locked (Awaiting Approval)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Link href="/admin/students">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
          <Button type="submit" size="lg" className="gap-2 px-8 shadow-md" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Student
          </Button>
        </div>
      </form>
    </div>
  )
}
