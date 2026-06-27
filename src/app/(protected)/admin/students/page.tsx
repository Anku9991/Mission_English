"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore"
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

  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as StudentProfile)
      setStudents(data)
    })
    return () => unsubscribe()
  }, [])

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
          <h1 className="text-3xl font-bold text-slate-900">Student Management</h1>
          <p className="text-slate-500 mt-1">Manage all registered students and their access.</p>
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
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
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
        <Card className="border-0 shadow-sm">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center bg-slate-50 rounded-xl">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">No students found</h2>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              Try adjusting your search filters or add a new student manually.
            </p>
            <Link href="/admin/students/add">
              <Button variant="outline">Add New Student</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Course & Batch</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Tests</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.studentId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {student.studentId}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{student.fullName}</p>
                          <p className="text-slate-500 text-xs">{student.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{student.course}</p>
                      <p className="text-slate-500 text-xs">{student.batch}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {student.paymentStatus}
                      </span>
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
        </div>
      )}
    </div>
  )
}
