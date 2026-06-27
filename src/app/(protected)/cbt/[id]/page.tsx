"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Info, CheckCircle2, Bookmark, ArrowRight, ArrowLeft } from "lucide-react"

const MOCK_QUESTIONS = [
  { id: 1, text: "Select the most appropriate synonym of the given word: 'ABUNDANT'", options: { A: "Plentiful", B: "Scarce", C: "Brief", D: "Tiny" } },
  { id: 2, text: "Choose the correctly spelt word.", options: { A: "Accomodation", B: "Accommodation", C: "Acomodation", D: "Accomoddation" } },
  { id: 3, text: "Select the most appropriate antonym of the given word: 'OPTIMISTIC'", options: { A: "Hopeful", B: "Pessimistic", C: "Joyful", D: "Radiant" } },
  { id: 4, text: "Identify the segment which contains the grammatical error: 'He is the bestest player in the team.'", options: { A: "He is", B: "the bestest player", C: "in the", D: "team" } },
  { id: 5, text: "Fill in the blank: The meeting has been ________ due to bad weather.", options: { A: "put off", B: "put on", C: "put out", D: "put in" } },
]

export default function CBTInterface() {
  const router = useRouter()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({})
  const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleOptionSelect = (opt: string) => {
    setAnswers({ ...answers, [currentQ]: opt })
  }

  const handleClear = () => {
    const newAnswers = { ...answers }
    delete newAnswers[currentQ]
    setAnswers(newAnswers)
  }

  const handleMarkReview = () => {
    setMarkedForReview({ ...markedForReview, [currentQ]: !markedForReview[currentQ] })
  }

  const handleSubmit = () => {
    if (confirm("Are you sure you want to submit the test?")) {
      router.push('/student')
    }
  }

  const q = MOCK_QUESTIONS[currentQ]

  return (
    <ProtectedRoute allowedRole="student">
      <div className="h-screen flex flex-col bg-slate-100 overflow-hidden font-sans">
        
        {/* Top Bar */}
        <header className="bg-slate-900 text-white p-3 flex justify-between items-center shrink-0">
          <div className="font-bold text-lg tracking-tight">Mission English CBT</div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-xl font-mono bg-slate-800 px-4 py-1.5 rounded-md">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className={timeLeft < 300 ? "text-red-400 font-bold animate-pulse" : "text-white"}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="flex items-center space-x-3 bg-slate-800 px-4 py-1.5 rounded-md text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">St</div>
              <span>Student User</span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Question Area */}
          <div className="flex-1 flex flex-col bg-white m-2 rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center shrink-0">
              <h2 className="font-semibold text-slate-800">Section: General English</h2>
              <div className="flex space-x-4 text-sm font-medium">
                <span className="text-green-600">Marks: +2.0</span>
                <span className="text-red-500">Negative: -0.5</span>
              </div>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="flex space-x-4 mb-6">
                <div className="w-10 h-10 shrink-0 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-700">
                  {currentQ + 1}
                </div>
                <div className="pt-2 text-lg text-slate-800 font-medium leading-relaxed">
                  {q.text}
                </div>
              </div>
              
              <div className="pl-14 space-y-3">
                {(Object.keys(q.options) as Array<keyof typeof q.options>).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(opt)}
                    className={`w-full flex items-center p-4 border rounded-xl transition-all text-left ${
                      answers[currentQ] === opt 
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center mr-4 text-xs font-bold ${
                      answers[currentQ] === opt
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 text-slate-500'
                    }`}>
                      {opt}
                    </div>
                    <span className="text-slate-700">{q.options[opt]}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="p-4 bg-slate-50 border-t flex justify-between shrink-0">
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleMarkReview} className={markedForReview[currentQ] ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300' : ''}>
                  <Bookmark className="w-4 h-4 mr-2" />
                  {markedForReview[currentQ] ? 'Unmark Review' : 'Mark for Review'}
                </Button>
                <Button variant="ghost" onClick={handleClear}>Clear Response</Button>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                  disabled={currentQ === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  onClick={() => setCurrentQ(Math.min(MOCK_QUESTIONS.length - 1, currentQ + 1))}
                  disabled={currentQ === MOCK_QUESTIONS.length - 1}
                >
                  Save & Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Palette */}
          <div className="w-80 bg-white m-2 ml-0 rounded-lg border shadow-sm flex flex-col shrink-0">
            <div className="p-4 border-b bg-slate-50">
              <h3 className="font-bold text-slate-800 text-center">Question Palette</h3>
            </div>
            
            <div className="p-4 grid grid-cols-2 gap-2 text-xs font-medium border-b shrink-0">
              <div className="flex items-center space-x-2"><div className="w-6 h-6 rounded-md bg-green-500 text-white flex justify-center items-center">{(Object.keys(answers).length)}</div> <span>Answered</span></div>
              <div className="flex items-center space-x-2"><div className="w-6 h-6 rounded-md bg-red-500 text-white flex justify-center items-center">{(currentQ + 1) - Object.keys(answers).length}</div> <span>Not Answered</span></div>
              <div className="flex items-center space-x-2"><div className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 flex justify-center items-center">{MOCK_QUESTIONS.length - (currentQ + 1)}</div> <span>Not Visited</span></div>
              <div className="flex items-center space-x-2"><div className="w-6 h-6 rounded-md bg-amber-500 text-white flex justify-center items-center">{Object.keys(markedForReview).filter(k => markedForReview[parseInt(k)]).length}</div> <span>Review</span></div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="grid grid-cols-4 gap-3">
                {MOCK_QUESTIONS.map((_, i) => {
                  let statusClass = "bg-slate-200 text-slate-700 border-transparent hover:bg-slate-300" // Not visited
                  if (i <= currentQ && !answers[i]) statusClass = "bg-red-500 text-white border-transparent hover:bg-red-600" // Visited, not answered
                  if (answers[i]) statusClass = "bg-green-500 text-white border-transparent hover:bg-green-600" // Answered
                  if (markedForReview[i]) {
                    if (answers[i]) statusClass = "bg-green-500 text-white border-amber-500 border-4 shadow-inner hover:bg-green-600" // Answered + Review
                    else statusClass = "bg-amber-500 text-white border-transparent hover:bg-amber-600" // Review
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentQ(i)}
                      className={`h-10 w-full rounded-md font-bold text-sm flex items-center justify-center transition-colors border-2 ${statusClass} ${currentQ === i ? 'ring-2 ring-blue-600 ring-offset-2' : ''}`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
            </div>
            
            <div className="p-4 border-t bg-slate-50 shrink-0">
              <Button onClick={handleSubmit} variant="default" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12">
                Submit Final Test
              </Button>
            </div>
          </div>
          
        </div>
      </div>
    </ProtectedRoute>
  )
}
