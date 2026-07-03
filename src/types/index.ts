// ============================================================
//  Mission English — Shared Types
// ============================================================

export type CourseType = "cbt" | "course" | "notes"

export interface Question {
  id: string
  text: string
  options: { A: string; B: string; C: string; D: string }
  correct: "A" | "B" | "C" | "D"
  marks: number
}

export interface Lesson {
  id: string
  title: string
  duration: string
  url: string
}

export interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

export interface Course {
  id: string
  title: string
  description: string
  type: CourseType
  price: number
  duration?: string
  questions?: Question[]
  modules?: Module[]
  richTextNotes?: string
  category?: string
  pdfUrl?: string
  thumbnail?: string
  createdAt: number
  isPublished: boolean
}

export type PaymentStatus = "pending" | "approved" | "rejected"

export interface PaymentRequest {
  id: string
  studentId: string
  studentName: string
  courseId: string
  courseTitle: string
  amount: number
  txnId: string
  upiId?: string
  status: PaymentStatus
  submittedAt: number
  reviewedAt?: number
}

export interface CBTResult {
  id: string
  studentId: string
  studentName: string
  courseId: string
  courseTitle: string
  answers: Record<number, string>
  score: number
  totalMarks: number
  totalQuestions: number
  correctCount: number
  wrongCount: number
  skippedCount: number
  accuracy: number
  submittedAt: number
  timeTaken: number // seconds
  isPublished?: boolean
}
