"use client"

import { useState, useMemo } from "react"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useHistory } from "@/hooks/useHistory"
import { cn } from "../../../../lib/utils"
import { HeaderBar } from "@/components/dashboard/HeaderBar"
import { SidebarNav } from "@/components/dashboard/SidebarNav"

export default function HistoryPage() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  return (
    <div className="min-h-screen bg-sky-50/70 text-slate-900">
      <HeaderBar onManualAddClick={() => {}} />
      <main className="flex min-h-[calc(100vh-64px)] bg-sky-50/70">
        <SidebarNav settingsOpen={settingsOpen} onToggleSettings={() => setSettingsOpen((prev) => !prev)} />
        <HistoryContent />
      </main>
    </div>
  )
}

function HistoryContent() {
  const { entries, loading, error, reload } = useHistory()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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
  const dailyAverage = totalEntries ? totalWater / totalEntries : 0

  const categories = Array.from(new Set(entries.map((e) => e.usage_type)))

  return (
    <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-primary/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Usage History</h2>
          <button
            onClick={reload}
            disabled={loading}
            className="text-sm text-slate-500 hover:text-sky-600 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Refresh"}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Log Water</span>
          </button>
        </div>
      </header>
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Entries" value={totalEntries.toString()} icon="list_alt" trendText="+12% from last month" trendUp />
          <StatCard title="Total Water Logged" value={`${totalWater.toFixed(0)} L`} icon="opacity" trendText="+5% from last month" trendUp />
          <StatCard title="Daily Average" value={`${dailyAverage.toFixed(0)} L`} icon="calendar_today" trendText="-2% from last month" trendUp={false} />
        </div>
        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/10 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search history entries..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-primary/10 bg-background-light dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="appearance-none pl-10 pr-8 py-2 rounded-lg border border-primary/10 bg-background-light dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-sm font-medium cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">category</span>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">expand_more</span>
            </div>
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 rounded-lg border border-primary/10 bg-background-light dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none text-sm font-medium"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">calendar_month</span>
            </div>
            <button className="px-4 py-2 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-all text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filter
            </button>
          </div>
        </div>
        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/5 border-b border-primary/10">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {paginated.map((e, idx) => {
                  const dateObj = new Date(e.created_at)
                  const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  return (
                    <tr key={e.id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{new Date(e.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{time}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {e.usage_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">{e.amount} L</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                          <button className="p-1 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-primary/5 border-t border-primary/10 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries</p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-primary/20 text-slate-400 cursor-not-allowed flex items-center disabled:opacity-50"
              >
                <ChevronLeft className="size-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={cn(
                    "px-3 py-1 rounded text-sm font-medium",
                    currentPage === p ? "bg-primary text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-primary/10"
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-primary/20 text-slate-400 flex items-center disabled:opacity-50"
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
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          <span className="material-symbols-outlined text-primary">{icon}</span>
        </div>
      </div>
      <div className={cn("mt-4 flex items-center text-sm font-medium", trendUp ? "text-emerald-500" : "text-red-500")}>
        <span className="material-symbols-outlined text-sm mr-1">{trendUp ? "trending_up" : "trending_down"}</span>
        <span>{trendText}</span>
      </div>
    </div>
  )
}