"use client"

import { useEffect, useState } from "react"
import { get } from "@/lib/apiClient"

export interface Alert {
  id: number
  category_name: string
  alert_type: "daily" | "monthly" | "info"
  total_amount: number
  limit_amount?: number
  percent_used?: number
  occurred_at: string
}

interface UseAlertsState {
  alerts: Alert[]
  loading: boolean
  error: string | null
}

export function useAlerts() {
  const [state, setState] = useState<UseAlertsState>({ alerts: [], loading: true, error: null })

  const load = async () => {
    setState({ alerts: [], loading: true, error: null })
    try {
      const data = await get<Alert[]>("/usage/alerts")
      setState({ alerts: data, loading: false, error: null })
    } catch (err: any) {
      // Suppress auth errors (401/Invalid token) - just show empty data for guests
      const isAuthError = err.status === 401 || err.message?.toLowerCase().includes("invalid token") || err.message?.toLowerCase().includes("unauthorized")
      setState({ alerts: [], loading: false, error: isAuthError ? null : (err.message || "Failed to load alerts") })
    }
  }

  useEffect(() => {
    load()
  }, [])

  return { ...state, reload: load }
}
