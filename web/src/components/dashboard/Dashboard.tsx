"use client"

import { useEffect, useState } from "react"

import { X } from "lucide-react"
import { HeaderBar } from "./HeaderBar"
import { SidebarNav } from "./SidebarNav"
import { DailyLimitCard } from "./DailyLimitCard"
import { ManualEntryCard } from "./ManualEntryCard"
import { RecentEntriesCard } from "./RecentEntriesCard"
import { SummaryGrid } from "./SummaryGrid"
import { TipsCard } from "./TipsCard"
import { UsageByCategoryCard } from "./UsageByCategoryCard"
import { WeeklyUsageCard } from "./WeeklyUsageCard"
import { initialRecentEntries, initialSummaryCards, initialUsageByCategory } from "./data"
import { cn } from "@/lib/utils"

type RecentEntry = { time: string; activity: string; volume: string; efficiency: string }

export default function Dashboard() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>(initialRecentEntries)
  const [todaysTotal, setTodaysTotal] = useState(Number(initialSummaryCards[0].value))
  const [usageByCategory, setUsageByCategory] = useState(initialUsageByCategory)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000"

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${apiBase}/usage/dashboard`)
      if (!res.ok) throw new Error(`Failed to load dashboard: ${res.status}`)
      const data = await res.json()
      setRecentEntries(data.recentEntries ?? [])
      setUsageByCategory(data.usageByCategory ?? initialUsageByCategory)
      const first = data.summaryCards?.[0]?.value
      if (typeof first === "number") {
        setTodaysTotal(first)
      } else if (typeof first === "string") {
        const num = parseFloat(first)
        if (!Number.isNaN(num)) setTodaysTotal(num)
      }
    } catch (err: any) {
      setError(err.message ?? "Unable to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const summaryCards = [
    { ...initialSummaryCards[0], value: `${todaysTotal.toFixed(1)} L` },
    ...initialSummaryCards.slice(1),
  ]

  const handleAddEntry = async ({ usageType, amount, notes }: { usageType: string; amount: number; notes?: string }) => {
    try {
      const res = await fetch(`${apiBase}/usage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usageType, amount, notes }),
      })
      if (!res.ok) throw new Error("Failed to save entry")
      const entry = await res.json()
      const date = new Date(entry.date)
      const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      const activity = entry.notes ? `${entry.usageType} · ${entry.notes}` : entry.usageType
      setRecentEntries((prev) => [{ time, activity, volume: `${entry.amount.toFixed(1)} L`, efficiency: "Manual" }, ...prev].slice(0, 10))
      setTodaysTotal((prev) => +(prev + entry.amount).toFixed(1))
      fetchDashboard()
    } catch (err: any) {
      setError(err.message ?? "Unable to save entry")
    }
  }

  return (
    <div className="min-h-screen bg-sky-50/70 text-slate-900">
      <HeaderBar onManualAddClick={() => setShowManual(true)} />

      <main className="flex min-h-[calc(100vh-72px)] bg-sky-50/70">
        <SidebarNav settingsOpen={settingsOpen} onToggleSettings={() => setSettingsOpen((prev) => !prev)} />

        <section className="flex-1 space-y-6 px-4 py-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Main Dashboard</p>
              <h1 className="text-xl font-semibold text-slate-900">Main Dashboard</h1>
            </div>
          </div>

          {showManual && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
              <button
                type="button"
                aria-label="Close manual entry"
                className="absolute inset-0 h-full w-full"
                onClick={() => setShowManual(false)}
              />
              <div className="relative w-full max-w-xl">
                <button
                  type="button"
                  onClick={() => setShowManual(false)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 text-slate-500 shadow hover:text-slate-700"
                >
                  <X className="size-4" />
                </button>
                <div className={cn("relative overflow-hidden rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-200")}> 
                  <ManualEntryCard
                    onAdd={(entry) => {
                      handleAddEntry(entry)
                      setShowManual(false)
                    }}
                    onCancel={() => setShowManual(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {error && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">{error}</div>}

          <SummaryGrid cards={summaryCards} />

          <div className="grid gap-4 lg:grid-cols-3">
            <WeeklyUsageCard />
            <UsageByCategoryCard categories={usageByCategory} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <DailyLimitCard />
            <TipsCard />
          </div>

          <RecentEntriesCard entries={recentEntries} />
        </section>
      </main>
    </div>
  )
}
