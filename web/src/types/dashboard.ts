export type EntityType = 'home' | 'society' | 'industry'

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
  dailyUsed?: number
  dailyLimit?: number
  monthlyUsed?: number
  monthlyLimit?: number
}

export interface RecentEntry {
  time: string
  activity: string
  volume: string
  efficiency: string
  duration?: string
}

export interface DashboardResponse {
  summaryCards: SummaryCard[]
  usageByCategory: UsageCategory[]
  recentEntries: RecentEntry[]
  todaysTotal: number
  dailyLimit: number
  monthlyTotal: number
  monthlyTarget: number
  weeklyTrends?: WeeklyTrends
  entityType?: EntityType
}

export interface WeeklyTrends {
  labels: string[]
  thisWeek: number[]
  lastWeek: number[]
}

export interface CreateUsagePayload {
  usageType: string
  amount: number
  notes?: string
  date?: string
  duration?: number
  entityType?: EntityType
  entityName?: string
}

export interface ReportsResponse {
  thisYearTotal: number
  lastYearTotal: number
  yoyChange: number
  yoyPositive: boolean
  avgDailyUsage: number
  daysElapsed: number
  monthlyTrend: { date: string; usage: number }[]
}