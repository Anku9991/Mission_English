"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Plus, Save, Trash2, GripVertical } from "lucide-react"
import Link from "next/link"

type Question = {
  id: string;
  text: string;
  options: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  marks: number;
}

export default function CreateTestPage() {
  const [type, setType] = useState<"cbt" | "course" | "notes">("cbt")
  const [questions, setQuestions] = useState<Question[]>([])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: "",
        options: { A: "", B: "", C: "", D: "" },
        correct: "A",
        marks: 1
      }
    ])
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => {
      if (q.id !== id) return q
      if (field.startsWith('option_')) {
        const opt = field.split('_')[1]
        return { ...q, options: { ...q.options, [opt]: value } }
      }
      return { ...q, [field]: value }
    }))
  }

  return (
    <div className="pb-20">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/admin/tests">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create Content</h1>
          <p className="text-slate-500 mt-1">Add a new CBT Test, Video Course, or PDF Notes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Input placeholder="e.g. SSC CGL Mock Test 1" />
              </div>
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input type="number" placeholder="e.g. 299" />
                <p className="text-xs text-slate-500">Set to 0 for free content.</p>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea 
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px]"
                  placeholder="Enter details..."
                />
              </div>

              {type !== 'cbt' && (
                <div className="space-y-2 pt-4 border-t">
                  <Label>Upload File (Video / PDF)</Label>
                  <Input type="file" className="cursor-pointer" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {type === 'cbt' ? (
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b mb-4">
                <div>
                  <CardTitle>Manual Question Entry</CardTitle>
                  <CardDescription>Add multiple choice questions for the CBT.</CardDescription>
                </div>
                <Button onClick={addQuestion} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Add Question
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl border-slate-200">
                    <p className="text-slate-500 mb-4">No questions added yet.</p>
                    <Button onClick={addQuestion} variant="outline" className="gap-2">
                      <Plus className="w-4 h-4" /> Add First Question
                    </Button>
                  </div>
                ) : (
                  questions.map((q, index) => (
                    <div key={q.id} className="p-4 border rounded-xl bg-slate-50 relative group">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="cursor-move pt-2 text-slate-400">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-slate-500">Q{index + 1}.</span>
                            <Input 
                              value={q.text} 
                              onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                              placeholder="Enter question text..." 
                              className="bg-white font-medium"
                            />
                            <div className="w-24">
                              <Input 
                                type="number" 
                                value={q.marks} 
                                onChange={(e) => updateQuestion(q.id, 'marks', Number(e.target.value))}
                                placeholder="Marks" 
                                className="bg-white text-center"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                            {(['A', 'B', 'C', 'D'] as const).map(opt => (
                              <div key={opt} className="flex items-center space-x-2">
                                <button 
                                  onClick={() => updateQuestion(q.id, 'correct', opt)}
                                  className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                                    q.correct === opt 
                                      ? "bg-green-500 border-green-500 text-white" 
                                      : "border-slate-300 text-slate-400 hover:border-slate-400"
                                  }`}
                                >
                                  {opt}
                                </button>
                                <Input 
                                  value={q.options[opt]}
                                  onChange={(e) => updateQuestion(q.id, `option_${opt}`, e.target.value)}
                                  placeholder={`Option ${opt}`}
                                  className="bg-white" 
                                />
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
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed rounded-xl border-slate-200 bg-slate-50">
              <div className="text-center">
                <h3 className="font-medium text-slate-900 mb-1">File Upload Required</h3>
                <p className="text-sm text-slate-500">Upload your file from the basic details panel.</p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button size="lg" className="gap-2 px-8">
              <Save className="w-5 h-5" />
              Save Content
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
