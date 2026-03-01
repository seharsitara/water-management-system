import { useEffect, useState } from "react"

import { createUsage, fetchDashboard } from "@/services/dashboard"
import { CreateUsagePayload, UsageCategory, RecentEntry, SummaryCard, WeeklyTrends } from "@/types/dashboard"

interface UseDashboardState {
  summaryCards: SummaryCard[]
  usageByCategory: UsageCategory[]
  recentEntries: RecentEntry[]
  todaysTotal: number
  dailyLimit: number
  monthlyTotal: number
  monthlyTarget: number
  weeklyTrends: WeeklyTrends | null
  loading: boolean
  error: string | null
}

export function useDashboard() {
  const [state, setState] = useState<UseDashboardState>({
    summaryCards: [],
    usageByCategory: [],
    recentEntries: [],
    todaysTotal: 0,
    dailyLimit: 0,
    monthlyTotal: 0,
    monthlyTarget: 0,
    weeklyTrends: null,
    loading: true,
    error: null,
  })

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await fetchDashboard()
      setState({ ...data, weeklyTrends: data.weeklyTrends ?? null, loading: false, error: null })
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message ?? "Failed to load dashboard" }))
    }
  }

  const addEntry = async (payload: CreateUsagePayload) => {
    try {
      await createUsage(payload)
      await load()
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message ?? "Failed to save entry" }))
      throw err
    }
  }

  useEffect(() => {
    load()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      load()
    }, 30000)
    
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ...state, reload: load, addEntry }
}