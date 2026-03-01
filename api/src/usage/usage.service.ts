import { Inject, Injectable } from '@nestjs/common'
import { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_CLIENT } from '../supabase.provider'
import { CreateUsageDto } from './dto/create-usage.dto'

@Injectable()
export class UsageService {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async findDashboard() {
    const today = new Date()
    const todayIso = today.toISOString().slice(0, 10)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
    const startOfThisWeek = new Date(today)
    const diffToMonday = (startOfThisWeek.getDay() + 6) % 7
    startOfThisWeek.setDate(startOfThisWeek.getDate() - diffToMonday)
    const startOfLastWeek = new Date(startOfThisWeek)
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

    const DAILY_LIMIT = 150
    const MONTHLY_TARGET = 4000

    const CATEGORY_LIMITS: Record<string, { daily: number; monthly: number }> = {
      Bathroom: { daily: 80, monthly: 300 },
      Kitchen: { daily: 40, monthly: 160 },
      Laundry: { daily: 30, monthly: 120 },
      Outdoor: { daily: 20, monthly: 80 },
    }

    const { data: todayRows, error: todayError } = await this.supabase
      .from('usage_entries')
      .select('usage_type, amount')
      .eq('date', todayIso)

    if (todayError) throw todayError

    const todaysTotalsByCategory = (todayRows ?? []).reduce<Record<string, number>>((acc, row: any) => {
      const key = row.usage_type ?? 'Unknown'
      acc[key] = (acc[key] ?? 0) + Number(row.amount ?? 0)
      return acc
    }, {})

    const todaysTotal = Object.values(todaysTotalsByCategory).reduce((sum, v) => sum + v, 0)

    const { data: monthlyRows, error: monthlyError } = await this.supabase
      .from('usage_entries')
      .select('usage_type, amount')
      .gte('date', monthStart)

    if (monthlyError) throw monthlyError

    const monthlyTotalsByCategory = (monthlyRows ?? []).reduce<Record<string, number>>((acc, row: any) => {
      const key = row.usage_type ?? 'Unknown'
      acc[key] = (acc[key] ?? 0) + Number(row.amount ?? 0)
      return acc
    }, {})

    const monthlyTotal = Object.values(monthlyTotalsByCategory).reduce((sum, v) => sum + v, 0)

    const colors = ['bg-sky-500', 'bg-amber-400', 'bg-emerald-500', 'bg-slate-400', 'bg-purple-400']
    const totalAmountToday = Object.values(todaysTotalsByCategory).reduce((sum, v) => sum + v, 0) || 1

    const usageByCategory = Object.entries(monthlyTotalsByCategory).map(([label, monthlyUsed], idx) => {
      const dailyUsed = todaysTotalsByCategory[label] ?? 0
      const limits = CATEGORY_LIMITS[label] ?? { daily: 0, monthly: 0 }
      return {
        label,
        value: Math.round(((dailyUsed / totalAmountToday) * 100) * 10) / 10,
        color: colors[idx % colors.length],
        monthlyUsed,
        monthlyLimit: limits.monthly,
        dailyUsed,
        dailyLimit: limits.daily,
      }
    })

    const { data: recentRows, error: recentError } = await this.supabase
      .from('usage_entries')
      .select('id, usage_type, amount, notes, date, duration, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentError) throw recentError

    const recentEntries = (recentRows ?? []).map((entry: any) => {
      // Use created_at timestamp if available, fallback to date
      const timestamp = entry.created_at ? new Date(entry.created_at) : (entry.date ? new Date(entry.date) : new Date())
      const time = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      return {
        time,
        activity: entry.notes ? `${entry.usage_type} · ${entry.notes}` : entry.usage_type,
        volume: `${Number(entry.amount).toFixed(1)} L`,
        efficiency: 'Manual',
        duration: entry.duration ? `${entry.duration} min` : undefined,
      }
    })

    const { data: twoWeekRows, error: twoWeekError } = await this.supabase
      .from('usage_entries')
      .select('date, amount')
      .gte('date', startOfLastWeek.toISOString().slice(0, 10))

    if (twoWeekError) throw twoWeekError

    const totalsByDate = (twoWeekRows ?? []).reduce<Record<string, number>>((acc, row: any) => {
      const key = (row.date ? new Date(row.date) : new Date()).toISOString().slice(0, 10)
      acc[key] = (acc[key] ?? 0) + Number(row.amount ?? 0)
      return acc
    }, {})

    const labels: string[] = []
    const thisWeek: number[] = []
    const lastWeek: number[] = []

    for (let i = 0; i < 7; i++) {
      const dayThisWeek = new Date(startOfThisWeek)
      dayThisWeek.setDate(startOfThisWeek.getDate() + i)
      const dayLastWeek = new Date(startOfLastWeek)
      dayLastWeek.setDate(startOfLastWeek.getDate() + i)

      const label = dayThisWeek.toLocaleDateString('en-US', { weekday: 'short' })
      labels.push(label)

      const thisKey = dayThisWeek.toISOString().slice(0, 10)
      const lastKey = dayLastWeek.toISOString().slice(0, 10)

      thisWeek.push(totalsByDate[thisKey] ?? 0)
      lastWeek.push(totalsByDate[lastKey] ?? 0)
    }

    const summaryCards = [
      { label: "Today's Total", value: todaysTotal, sub: `${Math.round((todaysTotal / DAILY_LIMIT) * 100)}% of daily limit`, icon: 'droplets' },
      { label: 'Monthly Total', value: `${monthlyTotal.toFixed(1)} L`, sub: `Target ${MONTHLY_TARGET} L`, icon: 'calendar' },
      { label: 'Monthly Target', value: `${MONTHLY_TARGET} L`, sub: `Remaining ${Math.max(MONTHLY_TARGET - monthlyTotal, 0).toFixed(1)} L`, icon: 'flame' },
      { label: 'Peak Usage Time', value: '07:30 AM', sub: 'Morning routine peak', icon: 'clock' },
    ]

    return {
      summaryCards,
      usageByCategory,
      recentEntries,
      todaysTotal,
      dailyLimit: DAILY_LIMIT,
      monthlyTotal,
      monthlyTarget: MONTHLY_TARGET,
      weeklyTrends: { labels, thisWeek, lastWeek },
    }
  }

  async create(dto: CreateUsageDto) {
    const date = dto.date ?? new Date().toISOString().slice(0, 10)
    const { data, error } = await this.supabase
      .from('usage_entries')
      .insert({
        date,
        usage_type: dto.usageType,
        amount: dto.amount,
        notes: dto.notes,
        duration: dto.duration ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // return a paginated or full list of entries ordered by newest first
  async findHistory() {
    const { data, error } = await this.supabase
      .from('usage_entries')
      .select('id, date, usage_type, amount, notes, duration, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get all usage categories
  async getCategories() {
    const { data, error } = await this.supabase
      .from('usage_categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Create a new category
  async createCategory(body: any) {
    const { data, error } = await this.supabase
      .from('usage_categories')
      .insert({
        name: body.name,
        icon: body.icon,
        daily_limit: body.daily_limit,
        monthly_limit: body.monthly_limit,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get user settings
  async getUserSettings() {
    const { data, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .single()

    if (error) throw error
    return data
  }

  // Update user settings
  async updateUserSettings(body: any) {
    const { data, error } = await this.supabase
      .from('user_settings')
      .update({
        daily_limit: body.daily_limit,
        monthly_limit: body.monthly_limit,
        notifications_enabled: body.notifications_enabled,
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

