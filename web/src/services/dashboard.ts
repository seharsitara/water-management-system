import { get, post } from "@/lib/apiClient"
import { CreateUsagePayload, DashboardResponse } from "@/types/dashboard"

export function fetchDashboard() {
  return get<DashboardResponse>("/usage/dashboard")
}

export function createUsage(payload: CreateUsagePayload) {
  return post<unknown, CreateUsagePayload>("/usage", payload)
}
