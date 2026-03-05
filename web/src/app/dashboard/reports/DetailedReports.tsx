"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Download, Search, ChevronLeft, ChevronRight, Home, Building2, Factory } from "lucide-react"
import { cn } from "../../../../lib/utils"
import { useDashboard } from "@/hooks/useDashboard"
import { fetchReports } from "@/services/dashboard"
import { ReportsResponse } from "@/types/dashboard"

type EntityType = 'home' | 'society' | 'industry'

const ENTITY_LIMITS = {
  home: { daily: 500, monthly: 15000, label: 'Home' },
  society: { daily: 5000, monthly: 150000, label: 'Society' },
  industry: { daily: 20000, monthly: 600000, label: 'Industry' },
}

const ENTITY_OPTIONS = [
  { value: 'home' as EntityType, label: 'Home', icon: Home },
  { value: 'society' as EntityType, label: 'Society', icon: Building2 },
  { value: 'industry' as EntityType, label: 'Industry', icon: Factory },
]

const getAlertLevel = (percent: number) => {
  if (percent >= 100) return { type: 'critical', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700', barColor: 'bg-red-500' }
  if (percent >= 80) return { type: 'warning', color: 'amber', bgColor: 'bg-amber-100', textColor: 'text-amber-700', barColor: 'bg-amber-500' }
  return { type: 'normal', color: 'emerald', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700', barColor: 'bg-emerald-500' }
}

export function DetailedReports() {
  const { usageByCategory, recentEntries, loading, error, reload, entityType: dashboardEntityType, setEntityType: setDashboardEntityType } = useDashboard()
  const [dateRange, setDateRange] = useState<"30" | "90" | "custom">("30")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [reports, setReports] = useState<ReportsResponse | null>(null)
  const [entityType, setEntityType] = useState<EntityType>('home')
  const itemsPerPage = 10

  const limits = ENTITY_LIMITS[entityType]

  useEffect(() => {
    setDashboardEntityType(entityType)
  }, [entityType, setDashboardEntityType])

  useEffect(() => {
    fetchReports().then(setReports).catch(() => setReports(null))
  }, [])

  const formatAmount = (amount: number) => {
    if (entityType === 'industry' && amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k L`
    }
    return `${amount.toFixed(0)} L`
  }

  const monthlyTrendData = reports?.monthlyTrend ?? []

  const categoryChartData = usageByCategory.map((cat) => ({
    name: cat.label,
    value: Number((cat.monthlyUsed ?? 0).toFixed(1)),
    color: cat.color,
  }))

  const categoryBreakdown = usageByCategory.map((cat) => ({
    label: cat.label,
    monthlyUsed: cat.monthlyUsed ?? 0,
    dailyUsed: cat.dailyUsed ?? 0,
    dailyLimit: cat.dailyLimit ?? limits.daily / 5,
    monthlyLimit: cat.monthlyLimit ?? limits.monthly / 5,
  }))

  const totalConsumption = categoryBreakdown.reduce((sum, cat) => sum + cat.monthlyUsed, 0)
  const avgDailyUsage = reports?.avgDailyUsage ?? (totalConsumption / 30)
  const mostUsedCategory = categoryBreakdown.reduce((max, cat) => (cat.monthlyUsed > max.monthlyUsed ? cat : max), categoryBreakdown[0] || { label: "N/A", monthlyUsed: 0, dailyUsed: 0, dailyLimit: 100, monthlyLimit: 3000 })
  const mostUsedPercent = totalConsumption > 0 ? ((mostUsedCategory.monthlyUsed / totalConsumption) * 100).toFixed(0) : "0"

  const monthlyPercent = (totalConsumption / limits.monthly) * 100
  const dailyPercent = (avgDailyUsage / limits.daily) * 100
  const monthlyAlertLevel = getAlertLevel(monthlyPercent)
  const dailyAlertLevel = getAlertLevel(dailyPercent)

  const yoyChange = reports?.yoyChange ?? 0
  const yoyPositive = reports?.yoyPositive ?? false

  const filteredEntries = recentEntries.filter((entry) =>
    entry.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.time.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const paginatedEntries = filteredEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)

  const colors = ["#0ea5e9", "#f97316", "#10b981", "#8b5cf6", "#ec4899"]

  return (
    <div className="flex-1 space-y-8 px-6 py-6 lg:px-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Detailed Reports</h2>
          <p className="text-slate-500 text-sm mt-1">
            {ENTITY_LIMITS[entityType].label} limits: {formatAmount(limits.daily)}/day · {formatAmount(limits.monthly)}/month
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-1">
            {ENTITY_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => setEntityType(option.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    entityType === option.value
                      ? "bg-white text-sky-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
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

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Total Consumption"
          value={formatAmount(totalConsumption)}
          trend="this month"
          trendPositive={monthlyPercent < 80}
          progress={monthlyPercent}
          alertLevel={monthlyAlertLevel}
          tooltip={`${formatAmount(totalConsumption)} / ${formatAmount(limits.monthly)} monthly limit`}
        />
        <KPICard 
          label="Avg Daily Usage" 
          value={formatAmount(avgDailyUsage)} 
          trend="per day" 
          trendPositive={dailyPercent < 80} 
          progress={dailyPercent}
          alertLevel={dailyAlertLevel}
          tooltip={`${formatAmount(avgDailyUsage)} / ${formatAmount(limits.daily)} daily limit`}
        />
        <KPICard
          label="Most Used Category"
          value={mostUsedCategory.label}
          trend={`${mostUsedPercent}% total`}
          trendPositive={false}
          progress={Number(mostUsedPercent)}
          alertLevel={getAlertLevel(Number(mostUsedPercent))}
          tooltip={`${formatAmount(mostUsedCategory.monthlyUsed)} used this month`}
        />
        <KPICard 
          label="YoY Change" 
          value={`${yoyChange >= 0 ? '+' : ''}${yoyChange}%`} 
          trend="vs Prev Year" 
          trendPositive={yoyPositive} 
          progress={Math.min(Math.abs(yoyChange), 100)}
          alertLevel={yoyPositive ? getAlertLevel(0) : getAlertLevel(100)}
          tooltip={yoyPositive ? "Great! You're saving water" : "Usage increased vs last year"}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-bold">Monthly Consumption Trend</h4>
              <p className="text-xs text-slate-500">Last 30 days usage vs {formatAmount(limits.daily)} daily limit</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-sky-500" /> Usage
              </div>
              <div className="flex items-center gap-1">
                <span className="w-8 h-0.5 bg-red-400 border-dashed" style={{ borderStyle: 'dashed' }} /> Limit
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: "#94a3b8", fontSize: 10 }} 
                  interval={4}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any) => [`${value} L`, 'Usage']} 
                  labelStyle={{ fontWeight: 'bold' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="usage" 
                  name="Usage" 
                  stroke="#0ea5e9" 
                  strokeWidth={2} 
                  dot={{ r: 2 }} 
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h4 className="text-lg font-bold mb-6">Consumption by Category</h4>
          <div className="space-y-5">
            {categoryBreakdown.map((cat, idx) => {
              const percentage = totalConsumption > 0 ? (cat.monthlyUsed / totalConsumption) * 100 : 0
              const limitPercent = cat.monthlyLimit > 0 ? (cat.monthlyUsed / cat.monthlyLimit) * 100 : 0
              const alertLevel = getAlertLevel(limitPercent)
              const isAlert = alertLevel.type !== 'normal'
              
              return (
                <div key={cat.label} className="space-y-2 group relative">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">{cat.label}</span>
                    <span className={cn("font-bold", isAlert ? alertLevel.textColor : "text-slate-700")}>
                      {formatAmount(cat.monthlyUsed)} ({limitPercent.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", isAlert ? alertLevel.barColor : "bg-sky-500")}
                      style={{ width: `${Math.min(limitPercent, 100)}%` }}
                    />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {formatAmount(cat.monthlyUsed)} / {formatAmount(cat.monthlyLimit)} limit
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      
      <section className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                <th className="px-6 py-4">Volume</th>
                <th className="px-6 py-4">% of Daily</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEntries.map((entry, idx) => {
                const volumeNum = parseFloat(entry.volume.replace(/[^\d.]/g, ''))
                const percentOfDaily = (volumeNum / limits.daily) * 100
                
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{entry.time}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                        {entry.activity}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{entry.volume}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 group relative">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-sky-500"
                            style={{ width: `${Math.min(percentOfDaily * 5, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                          {percentOfDaily.toFixed(1)}%
                        </span>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {entry.volume} of {formatAmount(limits.daily)} daily limit
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{entry.duration || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sky-600 hover:underline font-semibold">Details</button>
                    </td>
                  </tr>
                )
              })}
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
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
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
              disabled={currentPage === totalPages || totalPages === 0}
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
  alertLevel,
  tooltip,
}: {
  label: string
  value: string
  trend: string
  trendPositive: boolean
  progress: number
  alertLevel: ReturnType<typeof getAlertLevel>
  tooltip: string
}) {
  const isAlert = alertLevel.type !== 'normal'
  
  return (
    <div className={cn(
      "bg-white p-6 rounded-xl shadow-sm transition-all",
      isAlert && alertLevel.type === 'critical' ? "ring-2 ring-red-400" :
      isAlert && alertLevel.type === 'warning' ? "ring-2 ring-amber-400" :
      ""
    )}>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <span className="text-xs text-slate-500">{trend}</span>
      </div>
      
      <div className="mt-4 group relative">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Progress</span>
          <span className={cn("font-semibold", isAlert ? alertLevel.textColor : "text-slate-600")}>{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all", isAlert ? alertLevel.barColor : "bg-sky-500")} 
            style={{ width: `${Math.min(progress, 100)}%` }} 
          />
        </div>
        
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          {tooltip}
        </div>
      </div>
      {alertLevel.type === 'critical' && (
        <div className="mt-3 px-2 py-1 rounded-full text-xs font-bold text-center bg-red-100 text-red-700">
          ⚠️ Over Limit
        </div>
      )}
      {alertLevel.type === 'warning' && (
        <div className="mt-3 px-2 py-1 rounded-full text-xs font-bold text-center bg-amber-100 text-amber-700">
          Near Limit
        </div>
      )}
    </div>
  )
}
