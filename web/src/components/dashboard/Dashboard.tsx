"use client"

import { useState } from "react"

import { X, Bell, Search, Plus, MoreHorizontal, Sparkles, Home, Building2, Factory } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import Link from "next/link"

import { cn } from "../../../lib/utils"
import { useDashboard } from "@/hooks/useDashboard"
import { UsageCategory, EntityType } from "@/types/dashboard"
import { SidebarNav } from "./SidebarNav"
import { ManualEntryCard } from "./ManualEntryCard"

const ENTITY_OPTIONS: { value: EntityType; label: string; icon: any }[] = [
  { value: 'home', label: 'Home', icon: Home },
  { value: 'society', label: 'Society', icon: Building2 },
  { value: 'industry', label: 'Industry', icon: Factory },
]

export default function Dashboard() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const { usageByCategory, recentEntries, loading, error, addEntry, todaysTotal, dailyLimit, monthlyTotal, monthlyTarget, weeklyTrends, summaryCards, peakUsageDay, reload, entityType, setEntityType } = useDashboard()

  const displayCategories: UsageCategory[] = usageByCategory.length ? usageByCategory : []
  const displayEntries = recentEntries

  const dailyLimitValue = dailyLimit || 500
  const todaysValue = todaysTotal || 0
  const dailyPercent = dailyLimitValue ? Math.round((todaysValue / dailyLimitValue) * 100) : 0
  const monthlyValue = monthlyTotal || 0
  const monthlyTargetValue = monthlyTarget || 15000

  const getRiskLevel = (percent: number) => {
    if (percent >= 100) return { label: "Critical", color: "text-red-700 bg-red-100", dotColor: "bg-red-500" }
    if (percent >= 80) return { label: "Warning", color: "text-amber-700 bg-amber-100", dotColor: "bg-amber-500" }
    return { label: "Normal", color: "text-emerald-700 bg-emerald-100", dotColor: "bg-emerald-500" }
  }
  const monthlyPercent = monthlyTargetValue ? Math.round((monthlyValue / monthlyTargetValue) * 100) : 0
  const overallRisk = getRiskLevel(Math.max(dailyPercent, monthlyPercent))
  const statusLabel = overallRisk.label
  const statusColor = overallRisk.color
  const statusDotColor = overallRisk.dotColor

  const fallbackWeekly = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    thisWeek: [0, 0, 0, 0, 0, 0, 0],
    lastWeek: [0, 0, 0, 0, 0, 0, 0],
  }

  const weekly = weeklyTrends && weeklyTrends.labels?.length === 7 ? weeklyTrends : fallbackWeekly

  const peakDayName = peakUsageDay?.dayName || weekly.labels[weekly.thisWeek.indexOf(Math.max(...weekly.thisWeek))] || "N/A"
  const peakDayUsage = peakUsageDay?.usage ?? Math.max(...weekly.thisWeek)
  const avgDayUsage = peakUsageDay?.avgUsage ?? weekly.thisWeek.reduce((a, b) => a + b, 0) / 7
  const peakVsAvgPercent = peakUsageDay?.percentVsAvg ?? (avgDayUsage > 0 ? Math.round(((peakDayUsage - avgDayUsage) / avgDayUsage) * 100) : 0)

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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Main Dashboard</h1>
              <p className="text-sm text-slate-500">Live overview of today and this month</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                {ENTITY_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const isActive = entityType === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => setEntityType(option.value)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition",
                        isActive
                          ? "bg-sky-500 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <Icon className="size-3.5" />
                      {option.label}
                    </button>
                  )
                })}
              </div>
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

          <div className="flex items-center gap-4 px-4 py-3 bg-white rounded-lg border border-slate-200 shadow-sm">
            <span className="text-sm font-medium text-slate-600">
              {entityType === 'home' ? '🏠 Home' : entityType === 'society' ? '🏢 Society' : '🏭 Industry'} Limits:
            </span>
            <span className="text-sm text-slate-600">Daily: <strong>{dailyLimitValue.toLocaleString()} L</strong></span>
            <span className="text-sm text-slate-600">Monthly: <strong>{monthlyTargetValue.toLocaleString()} L</strong></span>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
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
                  <span className={cn(
                    dailyPercent >= 100 ? "text-rose-600" : dailyPercent >= 80 ? "text-amber-600" : "text-sky-600"
                  )}>{dailyPercent}% Used</span>
                </div>
                
                <div className="group relative">
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        dailyPercent >= 100 ? "bg-rose-500" : dailyPercent >= 80 ? "bg-amber-500" : "bg-sky-500"
                      )} 
                      style={{ width: `${Math.min(dailyPercent, 100)}%` }} 
                    />
                  </div>
                  
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {todaysValue.toFixed(1)} L / {dailyLimitValue.toFixed(0)} L daily limit
                  </div>
                </div>
                <p className="text-right text-xs text-slate-400">{Math.max(dailyLimitValue - todaysValue, 0).toFixed(1)} L remaining</p>
              </div>
            </div>

           
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-500">Peak Usage Day</p>
                
              </div>
              <h3 className="mt-2 text-4xl font-bold text-slate-900">{peakDayName}</h3>
              <p className="mt-1 text-lg font-semibold text-slate-600">{peakDayUsage.toFixed(0)} L</p>
              <p className="mt-2 text-xs text-slate-500">
                {peakVsAvgPercent > 0 ? "+" : ""}{peakVsAvgPercent}% vs avg ({avgDayUsage.toFixed(0)} L)
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Current Status</p>
                <span className={cn("flex size-2 rounded-full", statusDotColor)} />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className={cn("rounded-lg px-4 py-2 text-lg font-bold", statusColor)}>{statusLabel}</div>
                <p className="text-xs text-slate-500">
                  Daily {dailyPercent}% of {dailyLimitValue.toFixed(0)} L · Monthly {monthlyValue.toFixed(0)} / {monthlyTargetValue.toFixed(0)} L
                </p>
              </div>
            </div>
          </div>

         
          <div className="rounded-xl border border-sky-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Monthly Summary</h4>
                <p className="text-xs text-slate-500">
                  {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-sky-600">{monthlyValue.toFixed(0)} L</p>
                <p className="text-xs text-slate-500">of {monthlyTargetValue.toFixed(0)} L target</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-sky-100 bg-white p-4">
                <p className="text-xs font-medium text-slate-500">Days Elapsed</p>
                <p className="text-xl font-bold text-sky-600">{new Date().getDate()}</p>
                <p className="text-[10px] text-slate-400">of {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()} days</p>
              </div>
              <div className="rounded-lg border border-sky-100 bg-white p-4">
                <p className="text-xs font-medium text-slate-500">Daily Average</p>
                <p className="text-xl font-bold text-sky-600">
                  {new Date().getDate() > 0 ? (monthlyValue / new Date().getDate()).toFixed(1) : "0"} L
                </p>
                <p className="text-[10px] text-slate-400">per day this month</p>
              </div>
              <div className="rounded-lg border border-sky-100 bg-white p-4">
                <p className="text-xs font-medium text-slate-500">Remaining Budget</p>
                <p className="text-xl font-bold text-sky-600">{Math.max(monthlyTargetValue - monthlyValue, 0).toFixed(0)} L</p>
                <p className="text-[10px] text-slate-400">until target reached</p>
              </div>
              <div className="rounded-lg border border-sky-100 bg-white p-4">
                <p className="text-xs font-medium text-slate-500">Progress</p>
                <p className="text-xl font-bold text-sky-600">
                  {monthlyTargetValue > 0 ? Math.min(Math.round((monthlyValue / monthlyTargetValue) * 100), 100) : 0}%
                </p>
                <p className="text-[10px] text-slate-400">of monthly target</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Monthly Progress</span>
                <span className={cn(
                  monthlyPercent >= 100 ? "text-rose-600" : monthlyPercent >= 80 ? "text-amber-600" : "text-sky-600"
                )}>{monthlyTargetValue > 0 ? Math.min(Math.round((monthlyValue / monthlyTargetValue) * 100), 100) : 0}%</span>
              </div>
              
              <div className="group relative">
                <div className="h-3 w-full rounded-full bg-sky-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      monthlyPercent >= 100 ? "bg-rose-500" : monthlyPercent >= 80 ? "bg-amber-500" : "bg-sky-500"
                    )}
                    style={{ width: `${Math.min((monthlyValue / monthlyTargetValue) * 100, 100)}%` }}
                  />
                </div>
                
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {monthlyValue.toFixed(0)} L / {monthlyTargetValue.toFixed(0)} L monthly target
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold">Category Limits</h4>
                  <p className="text-xs text-slate-500">Daily usage vs limits</p>
                </div>
              </div>
              <div className="space-y-3">
                {displayCategories.length > 0 ? (
                  displayCategories.map((cat, idx) => {
                    const used = Number(cat.dailyUsed ?? 0)
                    const limit = Number(cat.dailyLimit ?? 0)
                    const remaining = Math.max(limit - used, 0)
                    const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
                    const isExceeded = used > limit

                    return (
                      <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-900">{cat.label}</p>
                          <p className={cn("text-sm font-bold", isExceeded ? "text-red-600" : percent >= 80 ? "text-amber-600" : "text-slate-700")}>
                            {used.toFixed(1)}/{limit.toFixed(1)} L
                          </p>
                        </div>
                        
                        <div className="group relative">
                          <div className="mt-1 h-2 w-full rounded-full bg-slate-200">
                            <div
                              className={cn(
                                "h-full rounded-full transition",
                                isExceeded ? "bg-red-500" : percent >= 80 ? "bg-amber-500" : "bg-sky-500"
                              )}
                              style={{ width: `${Math.min(percent, 100)}%` }}
                            />
                          </div>
                          
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {used.toFixed(1)} L / {limit.toFixed(1)} L ({percent.toFixed(0)}%)
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {isExceeded ? `Over by ${(used - limit).toFixed(1)} L` : `${remaining.toFixed(1)} L remaining`}
                        </p>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-slate-500">No categories set yet.</p>
                )}
              </div>
            </div>

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
                        <span className="rounded bg-sky-100 px-2 py-1 text-[10px] font-bold uppercase text-sky-700">{entry.efficiency}</span>
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
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 px-4 py-8">
          <button
            type="button"
            aria-label="Close manual entry"
            className="absolute inset-0 h-full w-full"
            onClick={() => setShowManual(false)}
          />
          <div className="relative w-full max-w-xl my-auto">
            <button
              type="button"
              onClick={() => setShowManual(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 text-slate-500 shadow hover:text-slate-700"
            >
              <X className="size-4" />
            </button>
            <div className="relative rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"> 
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
