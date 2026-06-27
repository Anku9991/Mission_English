import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, CheckCircle, Award, Target } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white dark:from-blue-900/20 dark:via-slate-900 dark:to-slate-900"></div>
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-blue-100 dark:border-blue-800">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Next Generation CBT Platform</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-8">
            Master English with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Confidence
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience the most advanced Computer Based Testing platform designed specifically for English language mastery. Practice, analyze, and succeed.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-blue-500/20 w-full sm:w-auto">
                Start Learning Now
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto bg-white/50 backdrop-blur-sm">
                Explore Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">Why Choose Mission English?</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">We provide a premium, seamless, and highly effective environment for your exam preparation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 dark:bg-blue-900/50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Real CBT Experience</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Practice in an environment that exactly mimics real-world computer-based testing interfaces.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Instant Analytics</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Get immediate, detailed feedback on your performance with accuracy and time management metrics.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <div className="bg-amber-100 dark:bg-amber-900/50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Premium Content</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Access high-quality, expertly curated English courses and test series designed for success.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
