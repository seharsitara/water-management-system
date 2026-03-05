import { get, post } from "@/lib/apiClient"
import { CreateUsagePayload, DashboardResponse, ReportsResponse } from "@/types/dashboard"

export type EntityType = 'home' | 'society' | 'industry'

export function fetchDashboard(entityType: EntityType = 'home') {
  return get<DashboardResponse>(`/usage/dashboard?entityType=${entityType}`)
}

export function createUsage(payload: CreateUsagePayload) {
  return post<unknown, CreateUsagePayload>("/usage", payload)
}

export function fetchHistory() {
  return get<Array<any>>("/usage/history")
}

export function fetchCategories() {
  return get<Array<any>>("/usage/categories")
}

export function createCategory(payload: { name: string; icon?: string; daily_limit?: number; monthly_limit?: number }) {
  return post<unknown, any>("/usage/categories", payload)
}

export function fetchAlerts() {
  return get<Array<any>>("/usage/alerts")
}

export function fetchUserSettings() {
  return get<any>("/usage/settings")
}

export function updateUserSettings(payload: { id?: string; daily_limit?: number; monthly_limit?: number; notifications_enabled?: boolean }) {
  return post<unknown, any>("/usage/settings", payload)
}

export function fetchReports() {
  return get<ReportsResponse>("/usage/reports")}