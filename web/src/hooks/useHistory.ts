import { useState, useEffect } from "react"
import { fetchHistory } from "@/services/dashboard"

export interface HistoryEntry {
  id: number
  date: string
  usage_type: string
  amount: number
  notes?: string
  duration?: number
  created_at: string
}

interface UseHistoryState {
  entries: HistoryEntry[]
  loading: boolean
  error: string | null
}

export function useHistory() {
  const [state, setState] = useState<UseHistoryState>({
    entries: [],
    loading: true,
    error: null,
  })

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await fetchHistory()
      setState({ entries: data, loading: false, error: null })
    } catch (err: any) {
      // Suppress auth errors (401/Invalid token) - just show empty data for guests
      const isAuthError = err.status === 401 || err.message?.toLowerCase().includes("invalid token") || err.message?.toLowerCase().includes("unauthorized")
      setState((s) => ({ ...s, loading: false, error: isAuthError ? null : (err.message || "Failed to load history") }))
    }
  }

  useEffect(() => {
    load()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      load()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return { ...state, reload: load }
}