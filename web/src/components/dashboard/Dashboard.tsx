"use client"

import { useState } from "react"

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
import { cn } from "../../../lib/utils"
import { useDashboard } from "../../hooks/useDashboard"

export default function Dashboard() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const { summaryCards, usageByCategory, recentEntries, loading, error, addEntry } = useDashboard()

  const displayCards = (summaryCards.length ? summaryCards : initialSummaryCards).map((card) => {
    const value = typeof card.value === "number" ? `${card.value.toFixed(1)} L` : card.value
    return { ...card, value }
  })

  const displayCategories = usageByCategory.length ? usageByCategory : initialUsageByCategory
  const displayEntries = recentEntries.length ? recentEntries : initialRecentEntries

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

          {loading && (
            <div className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-2 text-sm text-sky-800">
              Refreshing dashboard data...
            </div>
          )}

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
                    onAdd={async (entry) => {
                      try {
                        await addEntry(entry)
                        setShowManual(false)
                      } catch (err) {
                        console.error("Failed to add entry", err)
                      }
                    }}
                    onCancel={() => setShowManual(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {error && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">{error}</div>}

          <SummaryGrid cards={displayCards} />

          <div className="grid gap-4 lg:grid-cols-3">
            <WeeklyUsageCard />
            <UsageByCategoryCard categories={displayCategories} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <DailyLimitCard />
            <TipsCard />
          </div>

          <RecentEntriesCard entries={displayEntries} />
        </section>
      </main>
    </div>
  )
}
