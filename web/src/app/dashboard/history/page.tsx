"use client"

import { useState, useMemo } from "react"
import { Search, ChevronLeft, ChevronRight, Home, Building2, Factory } from "lucide-react"
import { useHistory } from "@/hooks/useHistory"
import { cn } from "../../../../lib/utils"
import { HeaderBar } from "@/components/dashboard/HeaderBar"
import { SidebarNav } from "@/components/dashboard/SidebarNav"

type EntityType = 'home' | 'society' | 'industry'

const ENTITY_LIMITS = {
  home: { daily: 500, monthly: 15000, label: 'Home', avgEntry: 50 },
  society: { daily: 5000, monthly: 150000, label: 'Society', avgEntry: 500 },
  industry: { daily: 20000, monthly: 600000, label: 'Industry', avgEntry: 2000 },
}

const ENTITY_OPTIONS = [
  { value: 'home' as EntityType, label: 'Home', icon: Home },
  { value: 'society' as EntityType, label: 'Society', icon: Building2 },
  { value: 'industry' as EntityType, label: 'Industry', icon: Factory },
]

const getAlertLevel = (percent: number) => {
  if (percent >= 100) return { type: 'critical', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' }
  if (percent >= 80) return { type: 'warning', color: 'amber', bgColor: 'bg-amber-100', textColor: 'text-amber-700' }
  return { type: 'normal', color: 'emerald', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' }
}

export default function HistoryPage() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [entityType, setEntityType] = useState<EntityType>('home')

  return (
    <div className="min-h-screen bg-sky-50/70 text-slate-900">
      <HeaderBar onManualAddClick={() => {}} />
      <main className="flex min-h-[calc(100vh-64px)] bg-sky-50/70">
        <SidebarNav settingsOpen={settingsOpen} onToggleSettings={() => setSettingsOpen((prev) => !prev)} />
        <HistoryContent entityType={entityType} setEntityType={setEntityType} />
      </main>
    </div>
  )
}

function HistoryContent({ entityType, setEntityType }: { entityType: EntityType; setEntityType: (type: EntityType) => void }) {
  const { entries, loading, error, reload } = useHistory()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const limits = ENTITY_LIMITS[entityType]

  const formatAmount = (amount: number) => {
    if (entityType === 'industry' && amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k L`
    }
    return `${amount.toFixed(0)} L`
  }

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchesSearch =
        e.usage_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.date.includes(searchQuery)
      const matchesCategory = categoryFilter ? e.usage_type === categoryFilter : true
      const matchesDate = dateFilter ? e.date === dateFilter : true
      return matchesSearch && matchesCategory && matchesDate
    })
  }, [entries, searchQuery, categoryFilter, dateFilter])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  const totalEntries = entries.length
  const totalWater = entries.reduce((sum, e) => sum + e.amount, 0)
  
  const uniqueDays = new Set(entries.map(e => e.date)).size
  const dailyAverage = uniqueDays > 0 ? totalWater / uniqueDays : 0
  const dailyPercent = (dailyAverage / limits.daily) * 100
  const dailyAlertLevel = getAlertLevel(dailyPercent)

  const categories = Array.from(new Set(entries.map((e) => e.usage_type)))

  return (
    <div className="flex-1 overflow-y-auto bg-sky-50/70">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900">Usage History</h2>
          <button
            onClick={reload}
            disabled={loading}
            className="text-sm text-slate-500 hover:text-sky-600 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Refresh"}
          </button>
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
          <button className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Log Water</span>
          </button>
        </div>
      </header>
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-6 px-4 py-3 bg-white rounded-lg border border-slate-200 shadow-sm">
          <span className="text-sm font-medium text-slate-600">
            {ENTITY_LIMITS[entityType].label} Limits:
          </span>
          <span className="text-sm text-slate-600">Daily: <strong>{formatAmount(limits.daily)}</strong></span>
          <span className="text-sm text-slate-600">Monthly: <strong>{formatAmount(limits.monthly)}</strong></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Entries" 
            value={totalEntries.toString()} 
            icon="list_alt" 
            trendText={`${totalEntries} records`} 
            trendUp 
          />
          <StatCard 
            title="Total Water Logged" 
            value={formatAmount(totalWater)} 
            icon="opacity" 
            trendText="all time" 
            trendUp 
          />
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Daily Average</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{formatAmount(dailyAverage)}</h3>
              </div>
              <div className="p-2 bg-sky-50 rounded-lg">
                <span className="material-symbols-outlined text-sky-600">calendar_today</span>
              </div>
            </div>
      
            <div className="mt-4 group relative">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">vs {formatAmount(limits.daily)} limit</span>
                <span className={cn("font-semibold", dailyPercent >= 100 ? "text-red-600" : dailyPercent >= 80 ? "text-amber-600" : "text-slate-600")}>{dailyPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    dailyPercent >= 100 ? "bg-red-500" : dailyPercent >= 80 ? "bg-amber-500" : "bg-sky-500"
                  )}
                  style={{ width: `${Math.min(dailyPercent, 100)}%` }}
                />
              </div>
              
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {formatAmount(dailyAverage)} / {formatAmount(limits.daily)} daily limit
              </div>
            </div>
            <div className={cn("mt-2 flex items-center text-sm font-medium", dailyPercent >= 100 ? "text-red-600" : dailyPercent >= 80 ? "text-amber-600" : "text-slate-500")}>
              <span className="material-symbols-outlined text-sm mr-1">
                {dailyPercent < 80 ? "check_circle" : dailyPercent < 100 ? "warning" : "error"}
              </span>
              <span>{dailyPercent < 80 ? "On track" : dailyPercent < 100 ? "Near limit" : "Over limit"}</span>
            </div>
          </div>
        </div>

      
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search history entries..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="appearance-none pl-10 pr-8 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500 outline-none text-sm font-medium cursor-pointer min-w-[160px]"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></span>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"></span>
            </div>
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500 outline-none text-sm font-medium min-w-[160px]"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></span>
            </div>
            <button className="px-4 py-2 bg-sky-50 text-sky-600 font-semibold rounded-lg hover:bg-sky-100 transition-all text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filter
            </button>
          </div>
        </div>

        
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">% of Daily</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((e) => {
                  const dateObj = new Date(e.created_at)
                  const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  const percentOfDaily = (e.amount / limits.daily) * 100
                  const entryAlertLevel = getAlertLevel(percentOfDaily * 5)
                  
                  return (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{new Date(e.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{time}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                          {e.usage_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{formatAmount(e.amount)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 group relative">
                          <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-sky-500"
                              style={{ width: `${Math.min(percentOfDaily * 5, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{percentOfDaily.toFixed(1)}%</span>
                          
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {formatAmount(e.amount)} of {formatAmount(limits.daily)} daily limit
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button className="p-1 text-slate-400 hover:text-sky-600 transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                          <button className="p-1 text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries</p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-slate-200 bg-white text-slate-400 flex items-center disabled:opacity-50"
              >
                <ChevronLeft className="size-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={cn(
                    "px-3 py-1 rounded text-sm font-medium",
                    currentPage === p ? "bg-sky-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-sky-50"
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 rounded border border-slate-200 bg-white text-slate-400 flex items-center disabled:opacity-50"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, trendText, trendUp }: { title: string; value: string; icon: string; trendText: string; trendUp: boolean }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className="p-2 bg-sky-50 rounded-lg">
          <span className="material-symbols-outlined text-sky-600">{icon}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm font-medium text-slate-500">
        <span className="material-symbols-outlined text-sm mr-1">info</span>
        <span>{trendText}</span>
      </div>
    </div>
  )
}
