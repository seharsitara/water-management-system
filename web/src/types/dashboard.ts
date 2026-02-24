export interface SummaryCard {
  label: string
  value: string | number
  sub: string
  icon: string | any
}

export interface UsageCategory {
  label: string
  value: number
  color: string
}

export interface RecentEntry {
  time: string
  activity: string
  volume: string
  efficiency: string
}

export interface DashboardResponse {
  summaryCards: SummaryCard[]
  usageByCategory: UsageCategory[]
  recentEntries: RecentEntry[]
}

export interface CreateUsagePayload {
  usageType: string
  amount: number
  notes?: string
  date?: string
}