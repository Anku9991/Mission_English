"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  BookOpen, CheckCircle, Award, Target, Users, TrendingUp,
  Zap, Shield, Star, ArrowRight, Play, ChevronDown
} from "lucide-react"

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } })
}

const STATS = [
  { value: "10,000+", label: "Students Enrolled", icon: Users, color: "from-blue-500 to-blue-600" },
  { value: "98%", label: "Success Rate", icon: TrendingUp, color: "from-emerald-500 to-green-600" },
  { value: "500+", label: "Practice Tests", icon: Zap, color: "from-purple-500 to-indigo-600" },
  { value: "4.9★", label: "Average Rating", icon: Star, color: "from-amber-500 to-orange-500" },
]

const FEATURES = [
  {
    icon: Target,
    title: "Real CBT Experience",
    description: "Practice in an environment that exactly mimics real-world computer-based testing with timer, palette, and review system.",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: CheckCircle,
    title: "Instant Analytics",
    description: "Get detailed feedback on your performance — accuracy, time management, section-wise breakdown instantly.",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Award,
    title: "Premium Content",
    description: "Expertly curated English courses and test series for SSC CGL, NDA, CDS, and more. Crafted for success.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Your data and progress are protected with enterprise-grade security. Privacy-first approach.",
    color: "from-purple-500 to-indigo-600",
    bg: "bg-purple-50",
  },
  {
    icon: Zap,
    title: "Adaptive Learning",
    description: "Smart difficulty progression that adjusts to your performance to maximize your improvement curve.",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50",
  },
  {
    icon: BookOpen,
    title: "Expert Instructors",
    description: "Content designed by top English educators with years of competitive exam coaching experience.",
    color: "from-cyan-500 to-sky-600",
    bg: "bg-cyan-50",
  },
]

const COURSES = [
  { title: "SSC CGL Tier 1 English", type: "CBT Test Series", questions: 25, duration: "20 min/test", price: "₹499", badge: "Most Popular", badgeColor: "bg-blue-100 text-blue-700" },
  { title: "NDA Complete English", type: "Video Course + CBT", questions: 40, duration: "30 min/test", price: "₹799", badge: "Best Value", badgeColor: "bg-emerald-100 text-emerald-700" },
  { title: "CDS Grammar Mastery", type: "Notes + CBT", questions: 30, duration: "25 min/test", price: "₹599", badge: "New", badgeColor: "bg-purple-100 text-purple-700" },
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center gradient-bg-hero overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-blue-400/10 blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-purple-400/10 blur-3xl animate-float pointer-events-none" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-300/5 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 pt-24 pb-16 text-center relative z-10">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              India's Most Advanced English CBT Platform
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.05] mb-6"
          >
            Master English
            <br />
            <span className="gradient-text">with Confidence</span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            The most immersive Computer Based Testing experience for SSC, NDA, CDS &amp; more.
            Practice smart, analyze deep, and ace your exam.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="h-14 px-10 rounded-2xl gradient-bg border-0 text-white font-bold text-lg shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300 gap-2">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl bg-white/50 backdrop-blur-md border-slate-200 text-slate-700 font-bold text-lg hover:bg-white hover:-translate-y-1 transition-all duration-300">
                  View Courses
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="mt-12 flex items-center justify-center gap-6 flex-wrap"
          >
            <div className="flex -space-x-3">
              {["🧑‍💻", "👩‍🎓", "🧑‍🏫", "👩‍💼", "🧑‍🔬"].map((e, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-base border-2 border-white shadow-md">
                  {e}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600 font-medium">
              <span className="font-bold text-slate-900">10,000+</span> students already enrolled
            </p>
            <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
              {"★★★★★"} <span className="text-slate-600 ml-1 font-normal">4.9/5 rating</span>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={i}
                  variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                  className="stat-card p-6 text-center"
                >
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${stat.color} mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-4">
              Why Mission English?
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Everything you need to
              <span className="gradient-text"> succeed</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              A premium, end-to-end platform built specifically for English exam preparation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={i}
                  variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 3 * 0.1}
                >
                  <div className="glass-card rounded-3xl p-8 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border border-slate-200/60 bg-white/70">
                    <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{f.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== COURSES SECTION ===== */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-sm font-semibold mb-4">
              ✦ Premium Courses
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Top Courses for <span className="gradient-text-gold">Top Results</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {COURSES.map((course, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.15}
                className="premium-card p-0 overflow-hidden group"
              >
                <div className="h-3 gradient-bg" />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${course.badgeColor}`}>{course.badge}</span>
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900">{course.price}</div>
                      <div className="text-xs text-slate-400">one-time</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{course.title}</h3>
                  <p className="text-sm text-blue-600 font-semibold mb-4">{course.type}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                    <span>📝 {course.questions} Questions/set</span>
                    <span>⏱ {course.duration}</span>
                  </div>
                  <Link href="/login">
                    <Button className="w-full rounded-xl gradient-bg text-white border-0 group-hover:shadow-lg transition-all">
                      Enroll Now
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg animate-gradient opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Ready to crack your exam?
            </h2>
            <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto">
              Join thousands of students who are already mastering English with Mission English CBT.
            </p>
            <Link href="/login">
              <Button size="lg" className="h-14 px-10 text-lg rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-2xl">
                Get Started Today — It's Free!
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
