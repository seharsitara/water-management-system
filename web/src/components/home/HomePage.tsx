"use client"

import Link from "next/link"
import { Droplets, BarChart3, Leaf, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#f6f7f8] text-slate-900 antialiased">
      <header className="sticky top-0 z-50 w-full border-b border-sky-500/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-2 text-sky-500">
            <Droplets className="size-8" strokeWidth={2.5} />
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">WaterTrack</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-sky-500 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/dashboard"
              className="rounded-lg bg-sky-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-500/90 transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative overflow-hidden px-6 pt-16 pb-24 text-center lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 flex justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-sky-500/5">
                <Droplets className="size-16 text-sky-500/40" strokeWidth={1.5} />
                <div className="absolute inset-0 animate-pulse rounded-full border-2 border-sky-500/10"></div>
              </div>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
              Every Drop Counts. <br />
              <span className="text-sky-500">Track your daily water usage with ease.</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-600">
              Stay hydrated and manage your water footprint with our minimalist tracking system.
              Designed for individuals and organizations committed to sustainability.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Link 
                href="/login"
                className="w-full rounded-xl bg-sky-500 px-10 py-4 text-lg font-bold text-white shadow-xl shadow-sky-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all sm:w-auto"
              >
                Get Started
              </Link>
              <Link 
                href="/dashboard"
                className="w-full rounded-xl border border-slate-200 bg-white px-10 py-4 text-lg font-semibold text-slate-700 hover:bg-slate-50 transition-all sm:w-auto"
              >
                View Demo
              </Link>
            </div>
          </div>

    
          <div className="absolute -top-24 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 bg-sky-500/5 blur-[120px] rounded-full"></div>
        </section>

       
        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Smart Water Management
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Our platform provides the tools you need to monitor consumption and reduce waste efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="group relative flex flex-col gap-6 rounded-2xl border border-sky-500/10 bg-white p-8 transition-all hover:shadow-xl hover:shadow-sky-500/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                <Droplets className="size-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Real-time Tracking</h3>
                <p className="mt-2 text-slate-600">
                  Monitor your daily intake as it happens with our intuitive mobile-responsive interface.
                </p>
              </div>
            </div>

            
            <div className="group relative flex flex-col gap-6 rounded-2xl border border-sky-500/10 bg-white p-8 transition-all hover:shadow-xl hover:shadow-sky-500/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                <BarChart3 className="size-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Usage Analytics</h3>
                <p className="mt-2 text-slate-600">
                  Detailed reports on your weekly and monthly trends to help you identify patterns.
                </p>
              </div>
            </div>

           
            <div className="group relative flex flex-col gap-6 rounded-2xl border border-sky-500/10 bg-white p-8 transition-all hover:shadow-xl hover:shadow-sky-500/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                <Leaf className="size-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Sustainability Goals</h3>
                <p className="mt-2 text-slate-600">
                  Set targets to reduce your environmental impact and earn badges for consistency.
                </p>
              </div>
            </div>
          </div>
        </section>


        <section className="bg-sky-500/5 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <div className="rounded-3xl bg-gradient-to-br from-sky-500/20 to-sky-500/40 p-1">
                  <div className="rounded-[22px] bg-white p-4 shadow-2xl">
                    <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
                      <div className="text-center p-8">
                        <Droplets className="size-16 text-sky-500/30 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">Dashboard Preview</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 text-left">
                <h2 className="text-3xl font-bold text-slate-900">Designed for Simplicity</h2>
                <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                  We believe that tracking shouldn&apos;t be a chore. Our minimalist design ensures you can log your usage in seconds and get back to your day. No cluttered menus, no unnecessary notifications. Just the data you need.
                </p>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="size-5 text-sky-500" />
                    One-tap logging
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="size-5 text-sky-500" />
                    Customizable reminders
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="size-5 text-sky-500" />
                    Dark mode support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      
      <footer className="border-t border-sky-500/10 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-2 text-sky-500 grayscale opacity-90">
              <Droplets className="size-6" />
              <span className="text-lg font-bold">WaterTrack</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <Link href="#" className="text-sm font-medium text-slate-500 hover:text-sky-500 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm font-medium text-slate-500 hover:text-sky-500 transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm font-medium text-slate-500 hover:text-sky-500 transition-colors">
                Cookie Policy
              </Link>
              <Link href="#" className="text-sm font-medium text-slate-500 hover:text-sky-500 transition-colors">
                Contact
              </Link>
            </div>
            <p className="text-sm text-slate-400">
              © 2024 HydroTrack Inc.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
