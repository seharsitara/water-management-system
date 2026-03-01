import { get, post } from "@/lib/apiClient"
import { CreateUsagePayload, DashboardResponse } from "@/types/dashboard"

export function fetchDashboard() {
  return get<DashboardResponse>("/usage/dashboard")
}

export function createUsage(payload: CreateUsagePayload) {
  return post<unknown, CreateUsagePayload>("/usage", payload)
}

export function fetchHistory() {
  return get<Array<any>>("/usage/history")
}

// Categories API
export function fetchCategories() {
  return get<Array<any>>("/usage/categories")
}

export function createCategory(payload: { name: string; icon?: string; daily_limit?: number; monthly_limit?: number }) {
  return post<unknown, any>("/usage/categories", payload)
}

// User Settings API
export function fetchUserSettings() {
  return get<any>("/usage/settings")
}

export function updateUserSettings(payload: { id?: string; daily_limit?: number; monthly_limit?: number; notifications_enabled?: boolean }) {
  return post<unknown, any>("/usage/settings", payload)
}
