import { Gauge } from "lucide-react"

import { cn } from "../../../lib/utils"

interface UsageCategory {
  label: string
  value: number
  color: string
  dailyUsed?: number
  dailyLimit?: number
  monthlyUsed?: number
  monthlyLimit?: number
}

interface UsageByCategoryCardProps {
  categories: UsageCategory[]
}

export function UsageByCategoryCard({ categories }: UsageByCategoryCardProps) {
  const totalToday = categories.reduce((sum, cat) => sum + (cat.dailyUsed ?? 0), 0)
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Usage by Category</p>
          <p className="text-xs text-slate-500">Today</p>
        </div>
      {/* <Gauge className="size-4 text-sky-500" /> */}
      </div>
      <div className="mt-4 flex items-center justify-center">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <div className="absolute inset-0 rotate-90">
            <div className="absolute inset-0 rounded-full border-10 border-slate-100" />
            <div className="absolute inset-1 rounded-full border-10 border-sky-500 border-r-transparent border-b-transparent" />
            <div className="absolute inset-4 rounded-full border-10 border-amber-400 border-l-transparent border-t-transparent" />
          </div>
          <div className="absolute inset-8 flex items-center justify-center rounded-full bg-white text-center">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
              <p className="text-2xl font-semibold text-slate-900">{totalToday.toFixed(1)} L</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm text-slate-700">
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn("h-3 w-3 rounded-full", cat.color)} />
              <div className="flex flex-col">
                <span>{cat.label}</span>
                <span className="text-xs text-slate-500">
                  Daily {(cat.dailyUsed ?? 0).toFixed(1)} / {cat.dailyLimit ?? "-"} L · Monthly {(cat.monthlyUsed ?? 0).toFixed(1)} / {cat.monthlyLimit ?? "-"} L
                </span>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-900">{cat.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
