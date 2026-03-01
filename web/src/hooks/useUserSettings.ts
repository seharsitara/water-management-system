import { useEffect, useState } from "react"
import { fetchUserSettings, updateUserSettings } from "@/services/dashboard"

interface UserSettingsData {
  id: string
  user_id: string
  daily_limit: number
  monthly_limit: number
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

interface UseUserSettingsState {
  settings: UserSettingsData | null
  loading: boolean
  error: string | null
}

export function useUserSettings() {
  const [state, setState] = useState<UseUserSettingsState>({
    settings: null,
    loading: true,
    error: null,
  })

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await fetchUserSettings()
      setState({ settings: data, loading: false, error: null })
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message ?? "Failed to load settings" }))
    }
  }

  const updateSettings = async (payload: { id?: string; daily_limit?: number; monthly_limit?: number; notifications_enabled?: boolean }) => {
    try {
      const updated = await updateUserSettings(payload)
      setState((s) => ({ ...s, settings: updated as UserSettingsData }))
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message ?? "Failed to update settings" }))
      throw err
    }
  }

  useEffect(() => {
    load()
  }, [])

  return {
    settings: state.settings,
    loading: state.loading,
    error: state.error,
    reload: load,
    updateSettings,
  }
}
