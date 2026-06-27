"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"

export default function StudentResultsPage() {
  const MOCK_RESULTS: any[] = []

  return (
    <div className="max-w-5xl mx-auto pt-4 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Results</h1>
        <p className="text-slate-500 mt-1">View your performance reports for completed CBTs.</p>
      </div>

      {MOCK_RESULTS.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No results yet</h2>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              You haven't completed any CBT tests yet. Once you finish a test, your detailed performance report will appear here.
            </p>
            <Button>Explore Tests</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_RESULTS.map((result, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">{result.title}</CardTitle>
                <CardDescription>Score: {result.score} / {result.total}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
