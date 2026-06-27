"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Plus, Save, Trash2, FileText, PlayCircle, Loader2, Lock } from "lucide-react"
import type { Question, Module, Lesson, Course } from "@/types"
import { motion, AnimatePresence } from "framer-motion"

export default function EditTestPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const courseId = resolvedParams.id
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [type, setType] = useState<"cbt" | "course" | "notes">("cbt")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<number>(0)
  const [duration, setDuration] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [modules, setModules] = useState<Module[]>([])

  useEffect(() => {
    async function loadCourse() {
      try {
        // 1. Fetch course
        const docSnap = await getDoc(doc(db, "courses", courseId))
        if (!docSnap.exists()) throw new Error("Course not found")
        
        const data = docSnap.data() as Course
        setType(data.type)
        setTitle(data.title)
        setDescription(data.description || "")
        setPrice(data.price)
        setDuration(data.duration || "")
        if (data.questions) setQuestions(data.questions)
        if (data.modules) setModules(data.modules)

        // 2. Check if any payments exist for this course
        const q = query(collection(db, "payment_requests"), where("courseId", "==", courseId))
        const paymentDocs = await getDocs(q)
        if (!paymentDocs.empty) {
          setLocked(true)
        }
      } catch (err: any) {
        alert(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadCourse()
  }, [courseId])

  // CBT Handlers
  const addQuestion = () => setQuestions([...questions, { id: Date.now().toString(), text: "", options: { A: "", B: "", C: "", D: "" }, correct: "A", marks: 2 }])
  const removeQuestion = (id: string) => setQuestions(questions.filter(q => q.id !== id))
  const updateQuestion = (id: string, field: string, value: any) => setQuestions(questions.map(q => {
    if (q.id !== id) return q
    if (field.startsWith("option_")) return { ...q, options: { ...q.options, [field.split("_")[1]]: value } }
    return { ...q, [field]: value }
  }))

  // Course Handlers
  const addModule = () => setModules([...modules, { id: Date.now().toString(), title: "New Module", lessons: [] }])
  const removeModule = (mId: string) => setModules(modules.filter(m => m.id !== mId))
  const updateModuleTitle = (mId: string, t: string) => setModules(modules.map(m => m.id === mId ? { ...m, title: t } : m))
  const addLesson = (mId: string) => setModules(modules.map(m => m.id === mId ? { ...m, lessons: [...m.lessons, { id: Date.now().toString(), title: "", duration: "", url: "" }] } : m))
  const removeLesson = (mId: string, lId: string) => setModules(modules.map(m => m.id === mId ? { ...m, lessons: m.lessons.filter(l => l.id !== lId) } : m))
  const updateLesson = (mId: string, lId: string, field: keyof Lesson, val: string) => setModules(modules.map(m => m.id === mId ? { ...m, lessons: m.lessons.map(l => l.id === lId ? { ...l, [field]: val } : l) } : m))

  const handleUpdate = async () => {
    if (locked) return
    if (!title.trim()) { alert("Please enter a title."); return }
    setIsSaving(true)
    try {
      const data: any = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        duration,
      }
      if (type === "cbt") data.questions = questions
      if (type === "course") data.modules = modules

      await updateDoc(doc(db, "courses", courseId), data)
      alert("Updated successfully!")
      router.push("/admin/tests")
    } catch (err: any) {
      alert("Error saving: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
  }

  return (
    <div className="pb-20 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/tests">
          <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 border border-slate-200">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Edit Content</h1>
          <p className="text-slate-500 text-sm mt-0.5">Modify existing courses or tests</p>
        </div>
      </div>

      {locked && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 text-red-700">
          <Lock className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">Editing Locked</h3>
            <p className="text-sm">This course cannot be modified because one or more students have already submitted a payment for it. Editing it now would unfairly change the content they paid for.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Settings */}
        <div className="lg:col-span-1 space-y-5">
          <Card className={`border-0 shadow-sm rounded-2xl overflow-hidden ${locked ? 'opacity-70 pointer-events-none' : ''}`}>
            <div className="h-1 gradient-bg" />
            <CardHeader>
              <CardTitle className="text-lg">Content Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="font-semibold">Type (Cannot change)</Label>
                <Input value={type.toUpperCase()} disabled className="rounded-xl bg-slate-100" />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl input-premium" />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Price (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <Input type="number" className="pl-8 rounded-xl input-premium" value={price} onChange={e => setPrice(Number(e.target.value))} min={0} />
                </div>
              </div>

              {type === "cbt" && (
                <div className="space-y-2">
                  <Label className="font-semibold">Duration</Label>
                  <Input value={duration} onChange={e => setDuration(e.target.value)} className="rounded-xl input-premium" />
                </div>
              )}

              <div className="space-y-2">
                <Label className="font-semibold">Description</Label>
                <textarea
                  className="flex w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 min-h-[90px]"
                  value={description} onChange={e => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Builder */}
        <div className={`lg:col-span-2 space-y-5 ${locked ? 'opacity-70 pointer-events-none' : ''}`}>
          {/* CBT Builder */}
          {type === "cbt" && (
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 pb-4">
                <div>
                  <CardTitle className="text-lg">Test Builder</CardTitle>
                  <CardDescription className="text-xs mt-0.5">{questions.length} question(s)</CardDescription>
                </div>
                <Button onClick={addQuestion} className="gap-2 rounded-xl text-xs h-9">
                  <Plus className="w-3 h-3" /> Add Q
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <AnimatePresence>
                  {questions.map((q, idx) => (
                    <motion.div key={q.id} className="p-4 border border-slate-200 rounded-xl bg-white relative group">
                      <button onClick={() => removeQuestion(q.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-bold mt-0.5">{idx + 1}</div>
                        <div className="flex-1 space-y-3 pr-6">
                          <div className="flex gap-2">
                            <Input value={q.text} onChange={e => updateQuestion(q.id, "text", e.target.value)} placeholder="Question text..." className="rounded-lg text-sm" />
                            <Input type="number" value={q.marks} onChange={e => updateQuestion(q.id, "marks", Number(e.target.value))} className="w-16 rounded-lg text-center text-sm" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {(["A", "B", "C", "D"] as const).map(opt => (
                              <div key={opt} className="flex items-center gap-2">
                                <button type="button" onClick={() => updateQuestion(q.id, "correct", opt)} className={`w-6 h-6 shrink-0 rounded-full border-2 text-xs font-bold ${q.correct === opt ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 text-slate-400"}`}>{opt}</button>
                                <Input value={q.options[opt]} onChange={e => updateQuestion(q.id, `option_${opt}`, e.target.value)} className="rounded-lg text-xs h-8" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          )}

          {/* Course Builder */}
          {type === "course" && (
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
                <CardTitle className="text-lg">Curriculum Builder</CardTitle>
                <Button onClick={addModule} className="gap-2 rounded-xl text-xs h-9"><Plus className="w-3 h-3" /> Module</Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {modules.map((m, mIdx) => (
                  <div key={m.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">M{mIdx + 1}</span>
                        <Input value={m.title} onChange={e => updateModuleTitle(m.id, e.target.value)} className="h-8 text-sm max-w-xs" />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => addLesson(m.id)} className="gap-1 h-7 text-xs rounded-lg"><Plus className="w-3 h-3" /> Lesson</Button>
                        <Button variant="ghost" size="icon" onClick={() => removeModule(m.id)} className="h-7 w-7 text-red-400"><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                    <div className="p-3 space-y-2 bg-white">
                      {m.lessons.map((l, lIdx) => (
                        <div key={l.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg group">
                          <span className="text-slate-400 text-xs w-5 text-center">{lIdx + 1}.</span>
                          <Input value={l.title} onChange={e => updateLesson(m.id, l.id, "title", e.target.value)} placeholder="Title" className="h-7 text-xs flex-1" />
                          <Input value={l.url} onChange={e => updateLesson(m.id, l.id, "url", e.target.value)} placeholder="URL" className="h-7 text-xs flex-1" />
                          <Input value={l.duration} onChange={e => updateLesson(m.id, l.id, "duration", e.target.value)} placeholder="Time" className="h-7 text-xs w-16" />
                          <button onClick={() => removeLesson(m.id, l.id)} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Notes Builder */}
          {type === "notes" && (
            <div className="text-center p-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Notes PDF editing coming soon.</p>
            </div>
          )}

          {!locked && (
            <div className="flex justify-end pt-2">
              <Button size="lg" onClick={handleUpdate} disabled={isSaving} className="gap-2 px-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
