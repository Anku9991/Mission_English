"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Edit, Trash2, Clock, FileText, PlayCircle, BookOpen } from "lucide-react"

const MOCK_TESTS = [
  { id: 1, title: "SSC CGL English Tier 1", type: "cbt", price: "₹299", questions: 50, duration: "60 mins" },
  { id: 2, title: "NDA English Comprehensive", type: "course", price: "₹499", modules: 12, duration: "10 hours" },
  { id: 3, title: "CDS Grammar Rules PDF", type: "notes", price: "₹99", pages: 120, duration: "N/A" },
]

export default function TestsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Courses & Tests</h1>
          <p className="text-slate-500 mt-1">Manage your CBT tests, video courses, and study materials.</p>
        </div>
        <Link href="/admin/tests/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create New
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_TESTS.map((test) => (
          <Card key={test.id} className="border-0 shadow-sm relative overflow-hidden group">
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm">
                <Edit className="h-4 w-4 text-blue-600" />
              </Button>
              <Button size="icon" variant="destructive" className="h-8 w-8 shadow-sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <CardHeader>
              <div className="flex items-center space-x-2 mb-2">
                {test.type === 'cbt' && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-md">CBT Test</span>}
                {test.type === 'course' && <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase rounded-md">Video Course</span>}
                {test.type === 'notes' && <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase rounded-md">PDF Notes</span>}
              </div>
              <CardTitle className="text-xl leading-tight">{test.title}</CardTitle>
              <CardDescription className="text-primary font-semibold">{test.price}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 text-sm text-slate-500">
                <div className="flex items-center space-x-1">
                  {test.type === 'cbt' && <FileText className="w-4 h-4" />}
                  {test.type === 'course' && <PlayCircle className="w-4 h-4" />}
                  {test.type === 'notes' && <BookOpen className="w-4 h-4" />}
                  <span>{test.questions || test.modules || test.pages} {test.type === 'cbt' ? 'Qs' : test.type === 'course' ? 'Modules' : 'Pages'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{test.duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
