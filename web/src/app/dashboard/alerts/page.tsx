"use client"

import React from "react"
import { useAlerts } from "@/hooks/useAlerts"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Bell, Search, Home, Building2, Factory } from "lucide-react"
import { SidebarNav } from "@/components/dashboard/SidebarNav"
import { cn } from "../../../../lib/utils"

dayjs.extend(relativeTime)

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
  if (percent >= 100) return { type: 'critical', label: 'Critical' }
  if (percent >= 80) return { type: 'warning', label: 'Warning' }
  return { type: 'normal', label: 'Normal' }
}

export default function AlertsPage() {
  const { alerts, loading, reload } = useAlerts()
  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState<"All" | "Critical" | "Warnings" | "Tips">("All")
  const [entityType, setEntityType] = React.useState<EntityType>('home')

  const limits = ENTITY_LIMITS[entityType]

  const processedAlerts = alerts.map(a => {
    const limit = a.alert_type === 'daily' ? limits.daily : limits.monthly
    const actualPercent = (Number(a.total_amount) / limit) * 100
    const alertLevel = getAlertLevel(actualPercent)
    return { ...a, limit_amount: limit, percent_used: actualPercent, alertLevel }
  })

  const criticalAlerts = processedAlerts.filter(a => a.alertLevel.type === 'critical')
  const warningAlerts = processedAlerts.filter(a => a.alertLevel.type === 'warning')

  const filteredAlerts = processedAlerts.filter(a => {
    if (search && !a.category_name.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === "Critical") return a.alertLevel.type === 'critical'
    if (filter === "Warnings") return a.alertLevel.type === 'warning'
    if (filter === "Tips") return false
    return true
  })

  const formatAmount = (amount: number) => {
    if (entityType === 'industry' && amount >= 1000) return `${(amount / 1000).toFixed(1)}k L`
    return `${amount.toFixed(1)} L`
  }

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
              <p className="text-[11px] text-slate-500">{ENTITY_LIMITS[entityType].label} Management</p>
            </div>
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
                        ? "bg-white text-sky-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <Icon className="size-3.5" />
                    {option.label}
                  </button>
                )
              })}
            </div>
            <button className="size-10 rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200">
              <Bell className="mx-auto size-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-64px)] bg-sky-50/70">
        <SidebarNav settingsOpen={false} onToggleSettings={() => {}} />
        <section className="flex-1 space-y-6 px-6 py-6 lg:px-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Alerts &amp; Notifications</h1>
              <p className="text-sm text-slate-500 mt-1">
                Limits: {formatAmount(limits.daily)}/day · {formatAmount(limits.monthly)}/month
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-sky-500"
                  placeholder="Search alerts..."
                />
              </div>
              <button onClick={() => reload()} className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                Refresh
              </button>
            </div>
          </div>

          {!loading && alerts.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
              <p className="text-lg font-semibold text-slate-700">No alerts</p>
              <p className="text-sm text-slate-500">You're within your limits.</p>
            </div>
          )}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={cn("bg-white p-6 rounded-xl shadow-sm border", criticalAlerts.length > 0 ? "border-red-300" : "border-slate-200")}>
              <div className="flex items-start justify-between mb-4">
                <span className={cn("material-symbols-outlined p-2 rounded-lg", criticalAlerts.length > 0 ? "text-red-500 bg-red-50" : "text-slate-400 bg-slate-100")}>error</span>
                {criticalAlerts.length > 0 && <span className="text-white bg-red-500 px-2 py-0.5 rounded-full text-[10px] font-bold">{criticalAlerts.length}</span>}
              </div>
              <h3 className="text-slate-500 text-sm font-medium">Critical (&gt;100%)</h3>
              <p className="text-3xl font-bold mt-1">{criticalAlerts.length}</p>
            </div>

            <div className={cn("bg-white p-6 rounded-xl shadow-sm border", warningAlerts.length > 0 ? "border-amber-300" : "border-slate-200")}>
              <div className="flex items-start justify-between mb-4">
                <span className={cn("material-symbols-outlined p-2 rounded-lg", warningAlerts.length > 0 ? "text-amber-500 bg-amber-50" : "text-slate-400 bg-slate-100")}>warning</span>
                {warningAlerts.length > 0 && <span className="text-white bg-amber-500 px-2 py-0.5 rounded-full text-[10px] font-bold">{warningAlerts.length}</span>}
              </div>
              <h3 className="text-slate-500 text-sm font-medium">Warnings (80-100%)</h3>
              <p className="text-3xl font-bold mt-1">{warningAlerts.length}</p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <span className="material-symbols-outlined text-sky-500 bg-sky-50 p-2 rounded-lg">tips_and_updates</span>
              </div>
              <h3 className="text-slate-500 text-sm font-medium">Tips (&lt;80%)</h3>
              <p className="text-3xl font-bold mt-1">3</p>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex gap-2">
              {(["All", "Critical", "Warnings", "Tips"] as const).map(option => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={cn("px-4 py-1.5 rounded-full text-sm font-medium", filter === option ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-600")}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="divide-y divide-slate-100">
              {filteredAlerts.map((a) => {
                const isCritical = a.alertLevel.type === 'critical'
                const isWarning = a.alertLevel.type === 'warning'

                return (
                  <div key={a.id} className={cn("p-6 flex gap-4 items-start", isCritical && "border-l-4 border-red-500", isWarning && "border-l-4 border-amber-400")}>                  
                    <span className={cn("material-symbols-outlined p-2 rounded-lg", isCritical ? "text-red-500 bg-red-50" : isWarning ? "text-amber-500 bg-amber-50" : "text-sky-500 bg-sky-50")}>
                      {isCritical ? "error" : isWarning ? "warning" : "check_circle"}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900">{isCritical ? "Limit Exceeded" : isWarning ? "High Usage" : "Normal"}</h4>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", isCritical ? "text-white bg-red-500" : isWarning ? "text-white bg-amber-500" : "text-sky-600 bg-sky-100")}>
                            {a.percent_used.toFixed(0)}%
                          </span>
                          <span className="text-xs text-slate-500">{dayjs(a.occurred_at).fromNow()}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        Used <span className="font-semibold">{formatAmount(Number(a.total_amount))}</span>. Limit: {formatAmount(a.limit_amount)}
                      </p>
                      <div className="mt-2 group relative">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", isCritical ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-sky-500")} style={{ width: `${Math.min(a.percent_used, 100)}%` }} />
                        </div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {formatAmount(Number(a.total_amount))} / {formatAmount(a.limit_amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredAlerts.length === 0 && <div className="p-6 text-center text-slate-500"><p className="text-sm">No alerts to display.</p></div>}
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}
