import React, { useEffect, useState, useCallback } from "react"

import { createUsage, fetchDashboard, fetchAlerts, EntityType } from "@/services/dashboard"
import { CreateUsagePayload, UsageCategory, RecentEntry, SummaryCard, WeeklyTrends } from "@/types/dashboard"

interface PeakUsageDay {
  dayName: string
  dayIndex: number
  usage: number
  avgUsage: number
  percentVsAvg: number
}

interface UseDashboardState {
  summaryCards: SummaryCard[]
  usageByCategory: UsageCategory[]
  recentEntries: RecentEntry[]
  todaysTotal: number
  dailyLimit: number
  monthlyTotal: number
  monthlyTarget: number
  weeklyTrends: WeeklyTrends | null
  peakUsageDay: PeakUsageDay | null
  entityType: EntityType
  loading: boolean
  error: string | null
}

export function useDashboard(initialEntityType: EntityType = 'home') {
  const [state, setState] = useState<UseDashboardState>({
    summaryCards: [],
    usageByCategory: [],
    recentEntries: [],
    todaysTotal: 0,
    dailyLimit: 0,
    monthlyTotal: 0,
    monthlyTarget: 0,
    weeklyTrends: null,
    peakUsageDay: null,
    entityType: initialEntityType,
    loading: true,
    error: null,
  })

  const entityTypeRef = React.useRef(state.entityType)
  entityTypeRef.current = state.entityType

  const load = useCallback(async (entityType?: EntityType) => {
    const typeToUse = entityType ?? entityTypeRef.current
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await fetchDashboard(typeToUse)
      setState({ 
        ...data, 
        weeklyTrends: data.weeklyTrends ?? null, 
        peakUsageDay: data.peakUsageDay ?? null, 
        entityType: typeToUse,
        loading: false, 
        error: null 
      })
    } catch (err: any) {
      const isAuthError = err.status === 401 || err.message?.toLowerCase().includes("invalid token") || err.message?.toLowerCase().includes("unauthorized")
      setState((s) => ({ ...s, loading: false, error: isAuthError ? null : (err.message ?? "Failed to load dashboard") }))
    }
  }, [])

  const reload = useCallback(() => {
    load()
  }, [load])

  const setEntityType = useCallback((entityType: EntityType) => {
    entityTypeRef.current = entityType
    setState((s) => ({ ...s, entityType }))
    load(entityType)
  }, [load])

  const addEntry = async (payload: CreateUsagePayload) => {
    try {
      const created = await createUsage(payload)
      await load()

      try {
        const alerts = await fetchAlerts()
        const recent = alerts.find((a: any) => a.category_name === payload.usageType)
        if (recent) {
          alert(`Limit exceeded for ${payload.usageType} (${recent.alert_type}); total ${Number(recent.total_amount).toFixed(1)} L`)
        }
      } catch (e) {
        console.warn("failed to fetch alerts", e)
      }

      return created
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message ?? "Failed to save entry" }))
      throw err
    }
  }

  useEffect(() => {
    load(initialEntityType)
    
    const interval = setInterval(() => {
      reload()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return { ...state, reload, addEntry, setEntityType }
}