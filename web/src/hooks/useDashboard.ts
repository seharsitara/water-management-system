import { useEffect, useState } from "react"

import { createUsage, fetchDashboard } from "@/services/dashboard"
import { CreateUsagePayload, DashboardResponse, UsageCategory, RecentEntry, SummaryCard } from "@/types/dashboard"

interface UseDashboardState {
  summaryCards: SummaryCard[]
  usageByCategory: UsageCategory[]
  recentEntries: RecentEntry[]
  loading: boolean
  error: string | null
}

export function useDashboard() {
  const [state, setState] = useState<UseDashboardState>({
    summaryCards: [],
    usageByCategory: [],
    recentEntries: [],
    loading: true,
    error: null,
  })

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await fetchDashboard()
      setState({ ...data, loading: false, error: null })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ...state, reload: load, addEntry }
}