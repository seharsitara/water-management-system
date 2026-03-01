"use client"

import { useState, useMemo } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../../../lib/utils"
import { useDashboard } from "@/hooks/useDashboard"

export function DetailedReports() {
  const { usageByCategory, recentEntries, monthlyTotal, dailyLimit, weeklyTrends, loading, error, reload } = useDashboard()
  const [dateRange, setDateRange] = useState<"30" | "90" | "custom">("30")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fallbackWeekly = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    thisWeek: [120, 105, 98, 112, 95, 90, 88],
    lastWeek: [110, 100, 92, 100, 94, 86, 80],
  }
  const weekly = weeklyTrends && weeklyTrends.labels?.length === 7 ? weeklyTrends : fallbackWeekly

  const dailyConsumptionData = weekly.labels.map((label, idx) => ({
    name: label,
    current: weekly.thisWeek[idx] ?? 0,
    predicted: weekly.lastWeek[idx] ?? 0,
  }))

  const categoryChartData = usageByCategory.map((cat) => ({
    name: cat.label,
    value: Number((cat.monthlyUsed ?? 0).toFixed(1)),
    color: cat.color,
  }))

  const categoryBreakdown = usageByCategory.map((cat) => ({
    label: cat.label,
    monthlyUsed: cat.monthlyUsed ?? 0,
    dailyUsed: cat.dailyUsed ?? 0,
    dailyLimit: cat.dailyLimit ?? 0,
    monthlyLimit: cat.monthlyLimit ?? 0,
  }))

  const totalConsumption = categoryBreakdown.reduce((sum, cat) => sum + cat.monthlyUsed, 0)
  const avgDailyUsage = totalConsumption / 30
  const mostUsedCategory = categoryBreakdown.reduce((max, cat) => (cat.monthlyUsed > max.monthlyUsed ? cat : max), categoryBreakdown[0] || { label: "N/A", monthlyUsed: 0, dailyUsed: 0, dailyLimit: 0, monthlyLimit: 0 })
  const mostUsedPercent = totalConsumption > 0 ? ((mostUsedCategory.monthlyUsed / totalConsumption) * 100).toFixed(0) : "0"

  const filteredEntries = recentEntries.filter((entry) =>
    entry.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.time.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const paginatedEntries = filteredEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)

  const colors = ["#0ea5e9", "#f97316", "#10b981", "#8b5cf6", "#ec4899"]

  return (
    <div className="flex-1 space-y-8 px-6 py-6 lg:px-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Detailed Reports</h2>
          <p className="text-slate-500 text-sm mt-1">Comprehensive analysis of your water usage patterns.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reload}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Refresh"}
          </button>
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
            {(["30", "90", "custom"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded transition",
                  dateRange === range ? "bg-sky-500 text-white" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {range === "30" ? "Last 30 Days" : range === "90" ? "Last 3 Months" : "Custom"}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-lg border border-slate-200 font-semibold text-sm hover:bg-slate-50 transition shadow-sm">
            <Download className="size-4" />
            Export
          </button>
        </div>
      </header>

      {loading && <div className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-2 text-sm text-sky-800">Loading reports...</div>}
      {error && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">{error}</div>}

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Total Consumption"
          value={`${totalConsumption.toFixed(0)} L`}
          trend="+5%"
          trendPositive={false}
          progress={(totalConsumption / (dailyLimit * 30)) * 100}
        />
        <KPICard label="Avg Daily Usage" value={`${avgDailyUsage.toFixed(0)} L`} trend="-2%" trendPositive={true} progress={50} />
        <KPICard
          label="Most Used Category"
          value={mostUsedCategory.label}
          trend={`${mostUsedPercent}% total`}
          trendPositive={false}
          progress={Number(mostUsedPercent)}
        />
        <KPICard label="YoY Change" value="+12%" trend="vs Prev Year" trendPositive={false} progress={66} />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold">Daily Consumption Trend</h4>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-sky-500" /> Current
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-slate-200" /> Predicted
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyConsumptionData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip formatter={(value: any) => `${value} L`} />
                <Legend />
                <Line type="monotone" dataKey="current" name="Current" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-bold mb-6">Consumption by Category</h4>
          <div className="space-y-5">
            {categoryBreakdown.map((cat, idx) => {
              const percentage = totalConsumption > 0 ? (cat.monthlyUsed / totalConsumption) * 100 : 0
              return (
                <div key={cat.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">{cat.label}</span>
                    <span className="text-slate-900">{cat.monthlyUsed.toFixed(0)} L</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: colors[idx % colors.length],
                        opacity: 0.6 + (idx % 3) * 0.2,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Detailed Usage Log */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h4 className="text-lg font-bold">Detailed Usage Log</h4>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input
              type="text"
              placeholder="Search log..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Volume (L)</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Efficiency</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEntries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{entry.time}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      {entry.activity}
                    </span>
                  </td>
                  <td className="px-6 py-4">{entry.volume}</td>
                  <td className="px-6 py-4">{entry.duration || "-"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold",
                        entry.efficiency === "Good" || entry.efficiency === "Excellent"
                          ? "bg-green-100 text-green-700"
                          : entry.efficiency === "Average"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                      )}
                    >
                      {entry.efficiency}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sky-600 hover:underline font-semibold">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {paginatedEntries.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredEntries.length)} of {filteredEntries.length} entries
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-50"
            >
              <ChevronLeft className="size-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "p-1.5 rounded text-xs font-bold px-3",
                  currentPage === page ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-50"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function KPICard({
  label,
  value,
  trend,
  trendPositive,
  progress,
}: {
  label: string
  value: string
  trend: string
  trendPositive: boolean
  progress: number
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <span className={cn("text-xs font-bold flex items-center gap-0.5", trendPositive ? "text-green-500" : "text-red-500")}>
          {trendPositive ? "↓" : "↑"} {trend}
        </span>
      </div>
      <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
    </div>
  )
}
