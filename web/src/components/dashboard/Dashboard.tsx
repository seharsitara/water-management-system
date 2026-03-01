"use client"

import { useState } from "react"

import { X, Bell, Search, Plus, MoreHorizontal, Sparkles } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import Link from "next/link"

import { cn } from "../../../lib/utils"
import { useDashboard } from "@/hooks/useDashboard"
import { UsageCategory } from "@/types/dashboard"
import { SidebarNav } from "./SidebarNav"
import { ManualEntryCard } from "./ManualEntryCard"
import { initialRecentEntries, initialUsageByCategory } from "./data"

export default function Dashboard() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const { usageByCategory, recentEntries, loading, error, addEntry, todaysTotal, dailyLimit, monthlyTotal, monthlyTarget, weeklyTrends, summaryCards, reload } = useDashboard()

  const displayCategories: UsageCategory[] = usageByCategory.length
    ? usageByCategory
    : initialUsageByCategory.map((cat) => ({
        ...cat,
        dailyUsed: 0,
        dailyLimit: 0,
        monthlyUsed: 0,
        monthlyLimit: 0,
      }))
  const displayEntries = recentEntries.length ? recentEntries : initialRecentEntries

  const dailyLimitValue = dailyLimit || 150
  const todaysValue = todaysTotal || 0
  const dailyPercent = dailyLimitValue ? Math.min(Math.round((todaysValue / dailyLimitValue) * 100), 999) : 0
  const monthlyValue = monthlyTotal || 0
  const monthlyTargetValue = monthlyTarget || 4000

  const statusLabel = dailyPercent >= 100 || monthlyValue >= monthlyTargetValue ? "At Risk" : dailyPercent >= 80 ? "Watch" : "Safe"
  const statusColor = statusLabel === "Safe" ? "text-emerald-700 bg-emerald-100" : statusLabel === "Watch" ? "text-amber-700 bg-amber-100" : "text-rose-700 bg-rose-100"

  const fallbackWeekly = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    thisWeek: [120, 105, 98, 112, 95, 90, 88],
    lastWeek: [110, 100, 92, 100, 94, 86, 80],
  }

  const weekly = weeklyTrends && weeklyTrends.labels?.length === 7 ? weeklyTrends : fallbackWeekly

  const categoryChartData = displayCategories.map((cat) => ({
    name: cat.label,
    used: Number((cat.dailyUsed ?? 0).toFixed(1)),
    limit: Number((cat.dailyLimit ?? 0).toFixed(1)),
  }))
  const weeklyChartData = weekly.labels.map((label, idx) => ({
    name: label,
    thisWeek: weekly.thisWeek[idx] ?? 0,
    lastWeek: weekly.lastWeek[idx] ?? 0,
  }))

  return (
    <div className="min-h-screen bg-sky-50/70 text-slate-900">
      <header className="h-16 border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500 text-white">
              <span className="text-base font-bold">WT</span>
            </div>
            <div>
              <p className="text-base font-bold leading-tight">WaterTrack</p>
              <p className="text-[11px] text-slate-500">Home Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="size-10 rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200">
                <Bell className="mx-auto size-4" />
              </button>
              <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-rose-500" />
            </div>
            <button className="size-10 rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200">
              <Search className="mx-auto size-4" />
            </button>
            <button
              className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
              onClick={() => setShowManual(true)}
            >
              <Plus className="size-4" /> Manual Entry
            </button>
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-64px)] bg-sky-50/70">
        <SidebarNav settingsOpen={settingsOpen} onToggleSettings={() => setSettingsOpen((prev) => !prev)} />

        <section className="flex-1 space-y-8 px-6 py-6 lg:px-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Main Dashboard</h1>
              <p className="text-sm text-slate-500">Live overview of today and this month</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={reload}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-sky-700 hover:text-sky-800 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Refresh"}
              </button>
              <Link href="/dashboard/reports" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
                View Reports
              </Link>
            </div>
          </div>

          {loading && (
            <div className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-2 text-sm text-sky-800">Refreshing dashboard data...</div>
          )}
          {error && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">{error}</div>}

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Today's Total</p>
              <div className="mt-2 flex items-end gap-2">
                <h3 className="text-4xl font-bold">{todaysValue.toFixed(1)} L</h3>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                  <Sparkles className="size-3" /> Live
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-400">Updated from recent entries</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Daily Limit</p>
                  <h3 className="mt-2 text-4xl font-bold">{dailyLimitValue.toFixed(0)} L</h3>
                </div>
                <div className="rounded-lg bg-slate-100 p-2 text-sky-600">
                  <Sparkles className="size-5" />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Current Progress</span>
                  <span className="text-sky-600">{dailyPercent}% Used</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.min(dailyPercent, 100)}%` }} />
                </div>
                <p className="text-right text-xs text-slate-400">{Math.max(dailyLimitValue - todaysValue, 0).toFixed(1)} L remaining</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Current Status</p>
                <span className="flex size-2 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className={cn("rounded-lg px-4 py-2 text-lg font-bold", statusColor)}>{statusLabel}</div>
                <p className="text-xs text-slate-500">
                  Daily {dailyPercent}% of {dailyLimitValue.toFixed(0)} L · Monthly {monthlyValue.toFixed(0)} / {monthlyTargetValue.toFixed(0)} L
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold">Usage by Category</h4>
                  <p className="text-xs text-slate-500">Breakdown of today's consumption</p>
                </div>
                <button className="text-slate-400 transition hover:text-sky-600">
                  <MoreHorizontal className="size-4" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "#f1f5f9" }} formatter={(value: any) => `${value} L`} labelStyle={{ color: "#0f172a" }} />
                    <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="used" name="Used" radius={[6, 6, 0, 0]} fill="#0ea5e9" maxBarSize={50} />
                    <Bar dataKey="limit" name="Limit" radius={[6, 6, 0, 0]} fill="#e2e8f0" maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-center text-xs text-slate-500">Bars show today's usage vs daily limit</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold">Weekly Trends</h4>
                  <p className="text-xs text-slate-500">Comparison with last 7 days</p>
                </div>
                <div className="flex gap-2 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-sky-200" /> Last Week</span>
                  <span className="flex items-center gap-1 text-sky-600"><span className="size-2 rounded-full bg-sky-500" /> This Week</span>
                </div>
              </div>
              <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: any) => `${value} L`} labelStyle={{ color: "#0f172a" }} />
                    <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="thisWeek" name="This Week" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="lastWeek" name="Last Week" stroke="#cbd5e1" strokeWidth={2} dot={{ r: 2 }} strokeDasharray="6 4" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h4 className="font-bold">Recent Usage Activity</h4>
              <button className="text-sky-700 text-xs font-bold hover:underline">Download Report</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3 text-center">Volume</th>
                    <th className="px-6 py-3 text-center">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                  {displayEntries.map((entry, idx) => (
                    <tr key={`${entry.time}-${entry.activity}-${idx}`}>
                      <td className="px-6 py-4 font-medium">{entry.time}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-slate-300" />
                          {entry.activity}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{entry.duration}</td>
                      <td className="px-6 py-4 text-center ">{entry.volume}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="rounded bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">{entry.efficiency}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

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
    </div>
  )
}
