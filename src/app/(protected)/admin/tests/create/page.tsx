"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Plus, Save, Trash2, GripVertical, UploadCloud, FileText, PlayCircle, Loader2, Wand2, CheckCircle2, Upload } from "lucide-react"
import type { Question, Module, Lesson } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import { useRef } from "react"

export default function CreateTestPage() {
  const router = useRouter()
  const [type, setType] = useState<"cbt" | "course" | "notes">("cbt")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<number>(0)
  const [duration, setDuration] = useState("60 minutes")
  const [questions, setQuestions] = useState<Question[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pdfUrlInput, setPdfUrlInput] = useState("")
  const [fileNameInput, setFileNameInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CSV Parser
  const parseCSVRow = (str: string) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '"' && str[i+1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return
      
      const rows = text.split('\n').filter(r => r.trim() !== '')
      const startIndex = rows[0].toLowerCase().includes('question') ? 1 : 0
      
      const newQuestions: Question[] = []
      for (let i = startIndex; i < rows.length; i++) {
        const cols = parseCSVRow(rows[i])
        if (cols.length >= 6 && cols[0].trim() !== '') {
          newQuestions.push({
            id: Date.now().toString() + i,
            text: cols[0],
            options: {
              A: cols[1],
              B: cols[2],
              C: cols[3],
              D: cols[4]
            },
            correct: (cols[5].toUpperCase().replace(/[^A-D]/g, '') || 'A') as "A" | "B" | "C" | "D",
            marks: cols.length >= 7 ? Number(cols[6]) : 2
          })
        }
      }
      if (newQuestions.length > 0) {
        setQuestions(prev => [...prev, ...newQuestions])
        alert(`Successfully imported ${newQuestions.length} questions!`)
      } else {
        alert("Could not parse CSV. Please ensure format: Question, OptA, OptB, OptC, OptD, CorrectAns(A/B/C/D), Marks")
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // CBT Handlers
  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now().toString(),
      text: "",
      options: { A: "", B: "", C: "", D: "" },
      correct: "A",
      marks: 2
    }])
  }
  const removeQuestion = (id: string) => setQuestions(questions.filter(q => q.id !== id))
  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => {
      if (q.id !== id) return q
      if (field.startsWith("option_")) return { ...q, options: { ...q.options, [field.split("_")[1]]: value } }
      return { ...q, [field]: value }
    }))
  }

  const handleAutoGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setQuestions(prev => [...prev,
        { id: Date.now() + "1", text: "Select the synonym of 'ABUNDANT':", options: { A: "Scarce", B: "Plentiful", C: "Rare", D: "Empty" }, correct: "B", marks: 2 },
        { id: Date.now() + "2", text: "Choose the correctly spelt word:", options: { A: "Accommodate", B: "Acommodate", C: "Accomodate", D: "Acomodate" }, correct: "A", marks: 2 },
        { id: Date.now() + "3", text: "Identify the antonym for 'OBSCURE':", options: { A: "Clear", B: "Hidden", C: "Vague", D: "Dark" }, correct: "A", marks: 2 },
        { id: Date.now() + "4", text: "Fill in the blank: The meeting has been ______ due to rain.", options: { A: "put off", B: "put on", C: "put out", D: "put in" }, correct: "A", marks: 2 },
        { id: Date.now() + "5", text: "He is the ______ player in the team. (Error detection)", options: { A: "bestest", B: "most best", C: "best", D: "better" }, correct: "C", marks: 2 },
      ])
      setIsGenerating(false)
    }, 2000)
  }

  // Course Handlers
  const addModule = () => setModules([...modules, { id: Date.now().toString(), title: "New Module", lessons: [] }])
  const removeModule = (mId: string) => setModules(modules.filter(m => m.id !== mId))
  const updateModuleTitle = (mId: string, t: string) => setModules(modules.map(m => m.id === mId ? { ...m, title: t } : m))
  const addLesson = (mId: string) => setModules(modules.map(m => m.id === mId ? { ...m, lessons: [...m.lessons, { id: Date.now().toString(), title: "", duration: "", url: "" }] } : m))
  const removeLesson = (mId: string, lId: string) => setModules(modules.map(m => m.id === mId ? { ...m, lessons: m.lessons.filter(l => l.id !== lId) } : m))
  const updateLesson = (mId: string, lId: string, field: keyof Lesson, val: string) => setModules(modules.map(m => m.id === mId ? { ...m, lessons: m.lessons.map(l => l.id === lId ? { ...l, [field]: val } : l) } : m))

  const handlePublish = async () => {
    if (!title.trim()) { alert("Please enter a title."); return }
    if (type === "cbt" && questions.length === 0) { alert("Please add at least one question."); return }
    if (type === "notes" && !pdfUrlInput.trim()) { alert("Please enter a PDF link."); return }
    setIsSaving(true)
    try {
      const data: any = {
        title: title.trim(),
        description: description.trim(),
        type,
        price: Number(price),
        duration,
        isPublished: true,
        createdAt: Date.now(),
      }
      
      if (type === "cbt") data.questions = questions
      if (type === "course") data.modules = modules
      if (type === "notes") {
        data.pdfUrl = pdfUrlInput.trim()
        data.fileName = fileNameInput.trim() || title.trim()
      }

      await addDoc(collection(db, "courses"), data)
      setSaved(true)
      setTimeout(() => router.push("/admin/tests"), 1500)
    } catch (err: any) {
      alert("Error saving: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="pb-20 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/tests">
          <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 border border-slate-200">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Create Content</h1>
          <p className="text-slate-500 text-sm mt-0.5">Build CBT tests, video courses, or upload notes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Settings */}
        <div className="lg:col-span-1 space-y-5">
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <div className="h-1 gradient-bg" />
            <CardHeader>
              <CardTitle className="text-lg">Content Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Type Selector */}
              <div className="space-y-2">
                <Label className="font-semibold">Content Type</Label>
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  {(["cbt", "course", "notes"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${type === t ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      {t === "cbt" ? "📝 CBT" : t === "course" ? "🎬 Course" : "📄 Notes"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Title *</Label>
                <Input
                  placeholder="e.g. SSC CGL English Practice Set 1"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="rounded-xl input-premium"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Price (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <Input
                    type="number"
                    placeholder="0 = Free"
                    className="pl-8 rounded-xl input-premium"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    min={0}
                  />
                </div>
                <p className="text-xs text-slate-400">Set 0 for free access without payment</p>
              </div>

              {type === "cbt" && (
                <div className="space-y-2">
                  <Label className="font-semibold">Duration</Label>
                  <Input
                    placeholder="e.g. 60 minutes"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="rounded-xl input-premium"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="font-semibold">Description</Label>
                <textarea
                  className="flex w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 min-h-[90px] transition-all"
                  placeholder="Brief description of this content..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Builder */}
        <div className="lg:col-span-2 space-y-5">
          {/* CBT Builder */}
          {type === "cbt" && (
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 pb-4">
                <div>
                  <CardTitle className="text-lg">Test Builder</CardTitle>
                  <CardDescription className="text-xs mt-0.5">{questions.length} question{questions.length !== 1 ? "s" : ""} added</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleAutoGenerate} disabled={isGenerating} className="gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border-0 rounded-xl text-xs">
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                    {isGenerating ? "Generating..." : "Auto-Generate"}
                  </Button>
                  
                  <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleCSVUpload} />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2 rounded-xl text-xs h-9 border-slate-200">
                    <Upload className="w-3 h-3" /> Upload CSV
                  </Button>

                  <Button onClick={addQuestion} className="gap-2 rounded-xl text-xs h-9">
                    <Plus className="w-3 h-3" /> Add Q
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {questions.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-semibold text-slate-600 text-sm">No questions yet</p>
                    <p className="text-slate-400 text-xs mt-1 mb-4">Click "Add Q", use Auto-Generate, or upload a CSV file.</p>
                    <div className="bg-slate-50 p-4 rounded-xl text-left text-xs text-slate-500 max-w-sm mx-auto border border-slate-100">
                      <strong className="block text-slate-700 mb-1">CSV Format Required:</strong>
                      Question, OptionA, OptionB, OptionC, OptionD, CorrectAnswer(A/B/C/D), Marks
                    </div>
                  </div>
                ) : (
                  <AnimatePresence>
                    {questions.map((q, idx) => (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-4 border border-slate-200 rounded-xl bg-white group relative"
                      >
                        <button
                          onClick={() => removeQuestion(q.id)}
                          className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-bold mt-0.5">
                            {idx + 1}
                          </div>
                          <div className="flex-1 space-y-3 pr-6">
                            <div className="flex gap-2">
                              <Input value={q.text} onChange={e => updateQuestion(q.id, "text", e.target.value)} placeholder="Question text..." className="rounded-lg text-sm" />
                              <Input type="number" value={q.marks} onChange={e => updateQuestion(q.id, "marks", Number(e.target.value))} className="w-16 rounded-lg text-center text-sm" title="Marks" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {(["A", "B", "C", "D"] as const).map(opt => (
                                <div key={opt} className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updateQuestion(q.id, "correct", opt)}
                                    className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${q.correct === opt ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 text-slate-400 hover:border-slate-400"}`}
                                  >{opt}</button>
                                  <Input value={q.options[opt]} onChange={e => updateQuestion(q.id, `option_${opt}`, e.target.value)} placeholder={`Option ${opt}`} className="rounded-lg text-xs h-8" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          )}

          {/* Course Builder */}
          {type === "course" && (
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
                <div>
                  <CardTitle className="text-lg">Curriculum Builder</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Structure your course modules and lessons</CardDescription>
                </div>
                <Button onClick={addModule} className="gap-2 rounded-xl text-xs h-9">
                  <Plus className="w-3 h-3" /> Module
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {modules.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                    <PlayCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-semibold text-slate-600 text-sm">Empty Curriculum</p>
                    <p className="text-slate-400 text-xs mt-1">Add modules to build your course</p>
                  </div>
                ) : modules.map((m, mIdx) => (
                  <div key={m.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">M{mIdx + 1}</span>
                        <Input value={m.title} onChange={e => updateModuleTitle(m.id, e.target.value)} className="h-8 text-sm max-w-xs" />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => addLesson(m.id)} className="gap-1 h-7 text-xs rounded-lg"><Plus className="w-3 h-3" /> Lesson</Button>
                        <Button variant="ghost" size="icon" onClick={() => removeModule(m.id)} className="h-7 w-7 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                    <div className="p-3 space-y-2 bg-white">
                      {m.lessons.length === 0 ? <p className="text-xs text-slate-400 text-center py-3">No lessons yet</p>
                        : m.lessons.map((l, lIdx) => (
                          <div key={l.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg group">
                            <span className="text-slate-400 text-xs w-5 text-center">{lIdx + 1}.</span>
                            <Input value={l.title} onChange={e => updateLesson(m.id, l.id, "title", e.target.value)} placeholder="Lesson title" className="h-7 text-xs flex-1" />
                            <Input value={l.url} onChange={e => updateLesson(m.id, l.id, "url", e.target.value)} placeholder="YouTube URL" className="h-7 text-xs flex-1" />
                            <Input value={l.duration} onChange={e => updateLesson(m.id, l.id, "duration", e.target.value)} placeholder="15m" className="h-7 text-xs w-16" />
                            <button onClick={() => removeLesson(m.id, l.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Notes Upload Alternative */}
          {type === "notes" && (
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b">
                <CardTitle className="text-lg">Link PDF Notes</CardTitle>
                <CardDescription className="text-xs">Paste a link to your Google Drive PDF or other hosted file.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">PDF URL (Google Drive Link) *</Label>
                  <Input 
                    placeholder="https://drive.google.com/file/d/.../view" 
                    value={pdfUrlInput}
                    onChange={(e) => setPdfUrlInput(e.target.value)}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-slate-500">
                    Make sure the Google Drive link is set to "Anyone with the link can view".
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-700">File Name (Optional)</Label>
                  <Input 
                    placeholder="e.g. Chapter 1 Notes" 
                    value={fileNameInput}
                    onChange={(e) => setFileNameInput(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Publish Button */}
          <div className="flex justify-end pt-2">
            <Button
              size="lg"
              onClick={handlePublish}
              disabled={isSaving || saved}
              className="gap-2 px-10 rounded-xl gradient-bg border-0 text-white font-bold shadow-lg btn-glow"
            >
              {saved ? <><CheckCircle2 className="w-5 h-5" /> Published!</> :
                isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</> :
                  <><Save className="w-5 h-5" /> Publish Content</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
