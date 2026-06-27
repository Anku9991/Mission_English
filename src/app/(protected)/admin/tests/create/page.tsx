"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Plus, Save, Trash2, GripVertical, UploadCloud, FileText, QrCode, PlayCircle, Loader2, Wand2 } from "lucide-react"
import Link from "next/link"

type Question = {
  id: string;
  text: string;
  options: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  marks: number;
}

type Lesson = { id: string; title: string; duration: string; url: string }
type Module = { id: string; title: string; lessons: Lesson[] }

export default function CreateTestPage() {
  const [type, setType] = useState<"cbt" | "course" | "notes">("cbt")
  
  // CBT State
  const [questions, setQuestions] = useState<Question[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Course State
  const [modules, setModules] = useState<Module[]>([])

  // UI Handlers for CBT
  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now().toString(), text: "", options: { A: "", B: "", C: "", D: "" }, correct: "A", marks: 1 }])
  }
  const removeQuestion = (id: string) => setQuestions(questions.filter(q => q.id !== id))
  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => {
      if (q.id !== id) return q
      if (field.startsWith('option_')) return { ...q, options: { ...q.options, [field.split('_')[1]]: value } }
      return { ...q, [field]: value }
    }))
  }

  // AI Generation Simulation
  const handleAutoGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setQuestions([
        ...questions,
        { id: Date.now().toString() + "1", text: "What is the synonym of 'Abundant'?", options: { A: "Scarce", B: "Plentiful", C: "Rare", D: "Empty" }, correct: "B", marks: 2 },
        { id: Date.now().toString() + "2", text: "Choose the correct spelling:", options: { A: "Accommodate", B: "Acommodate", C: "Accomodate", D: "Acomodate" }, correct: "A", marks: 2 },
        { id: Date.now().toString() + "3", text: "Identify the antonym for 'Obscure':", options: { A: "Clear", B: "Hidden", C: "Vague", D: "Dark" }, correct: "A", marks: 2 },
      ])
      setIsGenerating(false)
    }, 2500)
  }

  // UI Handlers for Courses
  const addModule = () => setModules([...modules, { id: Date.now().toString(), title: "New Module", lessons: [] }])
  const removeModule = (mId: string) => setModules(modules.filter(m => m.id !== mId))
  const updateModuleTitle = (mId: string, title: string) => setModules(modules.map(m => m.id === mId ? { ...m, title } : m))
  
  const addLesson = (mId: string) => setModules(modules.map(m => m.id === mId ? { ...m, lessons: [...m.lessons, { id: Date.now().toString(), title: "", duration: "", url: "" }] } : m))
  const removeLesson = (mId: string, lId: string) => setModules(modules.map(m => m.id === mId ? { ...m, lessons: m.lessons.filter(l => l.id !== lId) } : m))
  const updateLesson = (mId: string, lId: string, field: keyof Lesson, value: string) => setModules(modules.map(m => m.id === mId ? { ...m, lessons: m.lessons.map(l => l.id === lId ? { ...l, [field]: value } : l) } : m))

  return (
    <div className="pb-20">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/admin/tests">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create Advanced Content</h1>
          <p className="text-slate-500 mt-1">Build professional CBT tests, video courses, or upload notes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Details & Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Content Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <div className="flex p-1 bg-slate-100 rounded-lg">
                  {(['cbt', 'course', 'notes'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`flex-1 py-1.5 text-xs font-semibold uppercase rounded-md transition-all ${
                        type === t ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="e.g. Complete English Grammar" />
              </div>

              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input type="number" placeholder="e.g. 499" />
                <p className="text-xs text-slate-500">Set to 0 for free access.</p>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <textarea 
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
                  placeholder="Enter detailed description..."
                />
              </div>

              {/* QR Code Uploader */}
              <div className="space-y-2 pt-4 border-t">
                <Label className="flex items-center gap-2"><QrCode className="w-4 h-4" /> Custom Payment QR Code</Label>
                <p className="text-xs text-slate-500 mb-2">Upload a specific QR code for this content (Optional)</p>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors mb-2" />
                  <span className="text-sm font-medium text-slate-600">Click to upload QR Image</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Dynamic Builder */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CBT BUILDER */}
          {type === 'cbt' && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b mb-4 bg-slate-50 rounded-t-xl">
                <div>
                  <CardTitle>Test Builder</CardTitle>
                  <CardDescription>Add questions manually or extract from PDF.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={handleAutoGenerate} 
                    disabled={isGenerating}
                    className="gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-0"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    {isGenerating ? "Scanning PDF..." : "Auto-Generate from PDF"}
                  </Button>
                  <Button onClick={addQuestion} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed rounded-xl border-slate-200">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-700 mb-1">No Questions Yet</h3>
                    <p className="text-slate-500 mb-6 text-sm">Create questions manually or upload a PDF to auto-extract them using AI.</p>
                  </div>
                ) : (
                  questions.map((q, index) => (
                    <div key={q.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm relative group">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)} className="text-red-500 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="cursor-move pt-2 text-slate-300 hover:text-slate-500">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3 pr-10">
                            <span className="font-bold text-slate-400 bg-slate-100 w-8 h-8 flex items-center justify-center rounded-lg">{index + 1}</span>
                            <Input value={q.text} onChange={(e) => updateQuestion(q.id, 'text', e.target.value)} placeholder="Question text..." className="font-medium bg-slate-50" />
                            <Input type="number" value={q.marks} onChange={(e) => updateQuestion(q.id, 'marks', Number(e.target.value))} className="w-20 text-center" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                            {(['A', 'B', 'C', 'D'] as const).map(opt => (
                              <div key={opt} className="flex items-center space-x-2">
                                <button 
                                  onClick={() => updateQuestion(q.id, 'correct', opt)}
                                  className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                                    q.correct === opt ? "bg-green-500 border-green-500 text-white shadow-sm" : "border-slate-300 text-slate-400 hover:border-slate-400"
                                  }`}
                                >{opt}</button>
                                <Input value={q.options[opt]} onChange={(e) => updateQuestion(q.id, `option_${opt}`, e.target.value)} placeholder={`Option ${opt}`} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* COURSE BUILDER */}
          {type === 'course' && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b mb-4 bg-slate-50 rounded-t-xl">
                <div>
                  <CardTitle>Curriculum Builder</CardTitle>
                  <CardDescription>Structure your video course with modules and lessons.</CardDescription>
                </div>
                <Button onClick={addModule} className="gap-2">
                  <Plus className="w-4 h-4" /> Add Module
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {modules.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed rounded-xl border-slate-200">
                    <PlayCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-700 mb-1">Empty Curriculum</h3>
                    <p className="text-slate-500 mb-6 text-sm">Start building your course by adding your first module.</p>
                  </div>
                ) : (
                  modules.map((m, mIndex) => (
                    <div key={m.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-slate-100 p-4 flex items-center justify-between border-b">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="font-bold text-slate-500">Module {mIndex + 1}:</span>
                          <Input value={m.title} onChange={(e) => updateModuleTitle(m.id, e.target.value)} className="bg-white max-w-sm" />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => addLesson(m.id)} className="gap-1"><Plus className="w-3 h-3" /> Lesson</Button>
                          <Button variant="ghost" size="icon" onClick={() => removeModule(m.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                      <div className="p-4 space-y-3 bg-white">
                        {m.lessons.length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-4">No lessons in this module. Add a lesson to get started.</p>
                        ) : (
                          m.lessons.map((l, lIndex) => (
                            <div key={l.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50 group">
                              <span className="text-slate-400 font-medium text-sm w-6">{lIndex + 1}.</span>
                              <div className="flex-1 grid grid-cols-12 gap-3">
                                <Input value={l.title} onChange={(e) => updateLesson(m.id, l.id, 'title', e.target.value)} placeholder="Lesson Title" className="col-span-5 bg-white" />
                                <Input value={l.url} onChange={(e) => updateLesson(m.id, l.id, 'url', e.target.value)} placeholder="Video URL (YouTube/Vimeo)" className="col-span-5 bg-white" />
                                <Input value={l.duration} onChange={(e) => updateLesson(m.id, l.id, 'duration', e.target.value)} placeholder="Duration (e.g. 15m)" className="col-span-2 bg-white" />
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeLesson(m.id, l.id)} className="opacity-0 group-hover:opacity-100 text-red-500"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* NOTES UPLOADER */}
          {type === 'notes' && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-slate-50 rounded-t-xl border-b pb-4 mb-4">
                <CardTitle>Upload PDF Notes</CardTitle>
                <CardDescription>Upload high-quality study materials for students.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-1">Drag & Drop PDF Here</h3>
                  <p className="text-sm text-slate-500 mb-6">or click to browse from your computer (Max size: 50MB)</p>
                  <Button className="gap-2"><UploadCloud className="w-4 h-4" /> Select PDF File</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* GLOBAL SAVE BUTTON */}
          <div className="flex justify-end pt-4">
            <Button size="lg" className="gap-2 px-8 shadow-md">
              <Save className="w-5 h-5" />
              Publish Content
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}
