"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc, limit } from "firebase/firestore"
import { signInWithEmailAndPassword, updatePassword, signOut } from "firebase/auth"
import { db, secondaryAuth } from "@/lib/firebase"
import { StudentProfile } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Search, Plus, MoreVertical, ShieldCheck, ShieldAlert, KeyRound, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react"

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [pageLimit, setPageLimit] = useState(50)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("createdAt", "desc"), limit(pageLimit))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as StudentProfile)
      setStudents(data)
      setHasMore(snapshot.docs.length === pageLimit)
    })
    return () => unsubscribe()
  }, [pageLimit])

  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.course.toLowerCase().includes(search.toLowerCase()) ||
      s.batch.toLowerCase().includes(search.toLowerCase());
      
    if (filterStatus === "All") return matchesSearch;
    if (filterStatus === "Active") return matchesSearch && s.status === "Active";
    if (filterStatus === "Inactive") return matchesSearch && s.status === "Inactive";
    if (filterStatus === "Paid") return matchesSearch && s.paymentStatus === "Paid";
    if (filterStatus === "Pending") return matchesSearch && s.paymentStatus === "Pending";
    if (filterStatus === "Unlocked") return matchesSearch && s.testUnlocked === true;
    if (filterStatus === "Locked") return matchesSearch && s.testUnlocked === false;
    return matchesSearch;
  })

  // Actions
  const handleToggleStatus = async (studentId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active"
    await updateDoc(doc(db, "students", studentId), { status: newStatus })
  }

  const handleTogglePayment = async (studentId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Paid" ? "Pending" : "Paid"
    await updateDoc(doc(db, "students", studentId), { paymentStatus: newStatus })
  }

  const handleToggleTestAccess = async (studentId: string, currentAccess: boolean) => {
    await updateDoc(doc(db, "students", studentId), { testUnlocked: !currentAccess })
  }

  const handleDelete = async (studentId: string) => {
    if (confirm(`Are you sure you want to completely delete ${studentId}? This cannot be undone.`)) {
      await deleteDoc(doc(db, "students", studentId))
      await deleteDoc(doc(db, "secure_pins", studentId))
    }
  }

  const handleResetPin = async (studentId: string) => {
    const newPin = prompt(`Enter new 4-digit PIN for ${studentId}:`)
    if (!newPin || newPin.length !== 4 || isNaN(Number(newPin))) {
      alert("Invalid PIN. Must be exactly 4 digits.")
      return
    }
    
    try {
      // 1. Get Old PIN from secure_pins
      const pinDoc = await getDoc(doc(db, "secure_pins", studentId))
      if (!pinDoc.exists()) {
        alert("Could not find previous PIN securely.")
        return
      }
      const oldPin = pinDoc.data().pin
      
      // 2. Authenticate silently with secondary app
      const mappedEmail = `${studentId.toUpperCase()}@me.com`
      const userCredential = await signInWithEmailAndPassword(secondaryAuth, mappedEmail, `${oldPin}ME`)
      
      // 3. Update password in Firebase Auth
      await updatePassword(userCredential.user, `${newPin}ME`)
      
      // 4. Update the secure_pins collection
      await updateDoc(doc(db, "secure_pins", studentId), {
        pin: newPin,
        updatedAt: Date.now()
      })
      
      // 5. Sign out of secondary app
      await signOut(secondaryAuth)
      
      alert(`PIN successfully updated to: ${newPin}`)
    } catch (err: any) {
      console.error(err)
      alert(`Error updating PIN: ${err.message}`)
    }
  }

  return (
    <div className="max-w-7xl pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
          <p className="text-muted-foreground mt-1">Manage all registered students and their access.</p>
        </div>
        <Link href="/admin/students/add">
          <Button size="lg" className="gap-2 shadow-md">
            <Plus className="w-5 h-5" /> Add Student
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by ID, Name, Phone, Course, Batch..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="flex h-10 w-full md:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Students</option>
            <option value="Active">Status: Active</option>
            <option value="Inactive">Status: Inactive</option>
            <option value="Paid">Payment: Paid</option>
            <option value="Pending">Payment: Pending</option>
            <option value="Unlocked">Tests: Unlocked</option>
            <option value="Locked">Tests: Locked</option>
          </select>
        </CardContent>
      </Card>

      {filteredStudents.length === 0 ? (
        <Card className="premium-card">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center bg-secondary/50 rounded-3xl">
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Users className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No students found</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Try adjusting your search filters or add a new student manually.
            </p>
            <Link href="/admin/students/add">
              <Button variant="outline" className="text-foreground border-border hover:bg-secondary">Add New Student</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-premium">
              <thead>
                <tr>
                  <th className="pl-6">Student</th>
                  <th>Course & Batch</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Tests</th>
                  <th className="pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map((student) => (
                  <tr key={student.studentId} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {student.studentId}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{student.fullName}</p>
                          <p className="text-muted-foreground text-xs">{student.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{student.course}</p>
                      <p className="text-muted-foreground text-xs">{student.batch}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleTogglePayment(student.studentId, student.paymentStatus)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors cursor-pointer hover:shadow-sm ${
                          student.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title="Click to toggle Payment Status"
                      >
                        {student.paymentStatus}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {student.testUnlocked ? (
                        <span className="flex items-center text-green-600 font-medium text-xs gap-1"><ShieldCheck className="w-3 h-3" /> Unlocked</span>
                      ) : (
                        <span className="flex items-center text-red-500 font-medium text-xs gap-1"><ShieldAlert className="w-3 h-3" /> Locked</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleToggleTestAccess(student.studentId, student.testUnlocked)} title="Toggle Test Access">
                          {student.testUnlocked ? <ShieldAlert className="w-4 h-4 text-red-500" /> : <ShieldCheck className="w-4 h-4 text-green-500" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(student.studentId, student.status)} title="Toggle Account Status">
                          {student.status === 'Active' ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleResetPin(student.studentId)} title="Reset PIN">
                          <KeyRound className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(student.studentId)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="p-4 flex justify-center border-t border-border bg-secondary/50">
              <Button 
                variant="outline" 
                onClick={() => setPageLimit(prev => prev + 50)}
                className="rounded-xl font-bold text-foreground border-border hover:bg-secondary"
              >
                Load More Students
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
