import { Inject, Injectable } from '@nestjs/common'
import { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_CLIENT } from '../supabase.provider'
import { CreateUsageDto, EntityType } from './dto/create-usage.dto'

// Entity type configurations with limits
const ENTITY_LIMITS = {
  home: {
    daily: 500,
    monthly: 15000,
    categoryMultiplier: 1,
  },
  society: {
    daily: 5000,
    monthly: 150000,
    categoryMultiplier: 10,
  },
  industry: {
    daily: 20000,
    monthly: 600000,
    categoryMultiplier: 40,
  },
} as const

// Base category limits (for home, multiplied for others)
const BASE_CATEGORY_LIMITS: Record<string, { daily: number; monthly: number }> = {
  Bathroom: { daily: 200, monthly: 6000 },
  Bathing: { daily: 200, monthly: 6000 },
  Kitchen: { daily: 100, monthly: 3000 },
  Cooking: { daily: 100, monthly: 3000 },
  Drinking: { daily: 20, monthly: 600 },
  Laundry: { daily: 150, monthly: 4500 },
  Washing: { daily: 150, monthly: 4500 },
  Outdoor: { daily: 100, monthly: 3000 },
  Irrigation: { daily: 100, monthly: 3000 },
  Cleaning: { daily: 80, monthly: 2400 },
  Others: { daily: 50, monthly: 1500 },
  Other: { daily: 50, monthly: 1500 },
}

@Injectable()
export class UsageService {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  // Get limits based on entity type
  private getLimits(entityType: EntityType = 'home') {
    const config = ENTITY_LIMITS[entityType] || ENTITY_LIMITS.home
    return {
      dailyLimit: config.daily,
      monthlyTarget: config.monthly,
      categoryLimits: Object.fromEntries(
        Object.entries(BASE_CATEGORY_LIMITS).map(([cat, limits]) => [
          cat,
          {
            daily: limits.daily * config.categoryMultiplier,
            monthly: limits.monthly * config.categoryMultiplier,
          },
        ])
      ),
    }
  }

  async findDashboard(userId: number, entityType: EntityType = 'home') {
    const today = new Date()
    const todayIso = today.toISOString().slice(0, 10)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
    const startOfThisWeek = new Date(today)
    const diffToMonday = (startOfThisWeek.getDay() + 6) % 7
    startOfThisWeek.setDate(startOfThisWeek.getDate() - diffToMonday)
    const startOfLastWeek = new Date(startOfThisWeek)
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

    // Get dynamic limits based on entity type
    const { dailyLimit: DAILY_LIMIT, monthlyTarget: MONTHLY_TARGET, categoryLimits: CATEGORY_LIMITS } = this.getLimits(entityType)

    const { data: todayRows, error: todayError } = await this.supabase
      .from('usage_entries')
      .select('usage_type, amount')
      .eq('date', todayIso)
      .eq('user_id', userId)

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
      .eq('user_id', userId)

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
      // Default limits for unknown categories - reasonable home values
      const defaultLimits = { daily: 100, monthly: 3000 }
      const limits = CATEGORY_LIMITS[label] ?? defaultLimits
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

    // Calculate peak usage time from today's entries
    const { data: todayEntriesForPeak, error: peakError } = await this.supabase
      .from('usage_entries')
      .select('created_at, amount')
      .eq('user_id', userId)
      .eq('date', todayIso)
      .not('created_at', 'is', null)

    let peakUsageTime = { value: 'No data', sub: 'Add entries to see peak' }
    if (!peakError && todayEntriesForPeak && todayEntriesForPeak.length > 0) {
      // Group usage by hour
      const usageByHour: Record<number, number> = {}
      todayEntriesForPeak.forEach((entry: any) => {
        const hour = new Date(entry.created_at).getHours()
        usageByHour[hour] = (usageByHour[hour] ?? 0) + Number(entry.amount ?? 0)
      })
      
      // Find hour with highest usage
      let peakHour = 0
      let maxUsage = 0
      Object.entries(usageByHour).forEach(([hour, usage]) => {
        if (usage > maxUsage) {
          maxUsage = usage
          peakHour = Number(hour)
        }
      })
      
      // Format time
      const period = peakHour >= 12 ? 'PM' : 'AM'
      const displayHour = peakHour % 12 || 12
      peakUsageTime = { 
        value: `${displayHour}:00 ${period}`, 
        sub: `${maxUsage.toFixed(0)}L used this hour` 
      }
    }

    const { data: recentRows, error: recentError } = await this.supabase
      .from('usage_entries')
      .select('id, usage_type, amount, notes, date, duration, created_at')
      .eq('user_id', userId)
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
      .eq('user_id', userId)
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
      { label: 'Monthly Total', value: `${monthlyTotal.toFixed(1)} L`, sub: `Target ${MONTHLY_TARGET.toLocaleString()} L`, icon: 'calendar' },
      { label: 'Monthly Target', value: `${MONTHLY_TARGET.toLocaleString()} L`, sub: `Remaining ${Math.max(MONTHLY_TARGET - monthlyTotal, 0).toLocaleString()} L`, icon: 'flame' },
      { label: 'Peak Usage Time', value: peakUsageTime.value, sub: peakUsageTime.sub, icon: 'clock' },
    ]

    // Calculate peak usage day this week
    const peakDayIndex = thisWeek.indexOf(Math.max(...thisWeek))
    const peakDayUsage = thisWeek[peakDayIndex] ?? 0
    const avgDayUsage = thisWeek.reduce((a, b) => a + b, 0) / 7

    const peakUsageDay = {
      dayName: labels[peakDayIndex] ?? 'N/A',
      dayIndex: peakDayIndex,
      usage: peakDayUsage,
      avgUsage: avgDayUsage,
      percentVsAvg: avgDayUsage > 0 ? Math.round(((peakDayUsage - avgDayUsage) / avgDayUsage) * 100) : 0,
    }

    return {
      summaryCards,
      usageByCategory,
      recentEntries,
      todaysTotal,
      dailyLimit: DAILY_LIMIT,
      monthlyTotal,
      monthlyTarget: MONTHLY_TARGET,
      weeklyTrends: { labels, thisWeek, lastWeek },
      peakUsageDay,
      entityType,  // Return the entity type for frontend reference
    }
  }

  async create(dto: CreateUsageDto, userId: number) {
    const date = dto.date ?? new Date().toISOString().slice(0, 10)
    const { data, error } = await this.supabase
      .from('usage_entries')
      .insert({
        user_id: userId,
        date,
        usage_type: dto.usageType,
        amount: dto.amount,
        notes: dto.notes,
        duration: dto.duration ?? null,
        entity_type: dto.entityType ?? 'home',      // home, society, or industry
        entity_name: dto.entityName ?? null,        // House A, Block B, Factory 1, etc.
      })
      .select()
      .single()

    if (error) throw error

    // Get limits based on entity type
    const entityLimits = ENTITY_LIMITS[dto.entityType || 'home'] || ENTITY_LIMITS.home

    // after creating entry, check limits
    try {
      // get user settings (global daily and monthly limits) - use entity-based defaults
      const { data: settings } = await this.supabase
        .from('user_settings')
        .select('daily_limit, monthly_limit')
        .eq('user_id', userId)
        .single()

      // Use entity-specific limits if no user settings
      const globalDailyLimit = settings?.daily_limit ? Number(settings.daily_limit) : entityLimits.daily
      const globalMonthlyLimit = settings?.monthly_limit ? Number(settings.monthly_limit) : entityLimits.monthly

      console.log('[UsageService.create] checking limits for userId:', userId, 'entityType:', dto.entityType, 'dailyLimit:', globalDailyLimit, 'monthlyLimit:', globalMonthlyLimit)

      // compute today's total ACROSS ALL CATEGORIES
      const { data: todayAllRows } = await this.supabase
        .from('usage_entries')
        .select('amount')
        .eq('date', date)
        .eq('user_id', userId)

      const todayTotalAll = (todayAllRows ?? []).reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0)

      console.log('[UsageService.create] todayTotalAll:', todayTotalAll, 'vs limit:', globalDailyLimit)

      // Update or insert daily summary
      await this.updateDailySummary(userId, date, todayTotalAll)

      if (todayTotalAll > globalDailyLimit) {
        console.log('[UsageService.create] DAILY LIMIT EXCEEDED! Creating alert...')
        const alertRes = await this.supabase.from('usage_alerts').insert({
          user_id: userId,
          category_name: 'All',
          alert_type: 'daily',
          total_amount: todayTotalAll,
          limit_amount: globalDailyLimit,
          percent_used: (todayTotalAll / globalDailyLimit) * 100,
        })
        console.log('[UsageService.create] Alert insert result:', alertRes.error ? alertRes.error : 'success')
      }

      const monthStart = new Date(date)
      monthStart.setDate(1)
      const monthStr = monthStart.toISOString().slice(0, 10)
      const { data: monthAllRows } = await this.supabase
        .from('usage_entries')
        .select('amount')
        .gte('date', monthStr)
        .eq('user_id', userId)

      const monthTotalAll = (monthAllRows ?? []).reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0)

      // Update or insert monthly summary
      const monthYear = date.slice(0, 7) // YYYY-MM format
      await this.updateMonthlySummary(userId, monthYear, monthTotalAll, globalMonthlyLimit)

      if (monthTotalAll > globalMonthlyLimit) {
        await this.supabase.from('usage_alerts').insert({
          user_id: userId,
          category_name: 'All',
          alert_type: 'monthly',
          total_amount: monthTotalAll,
          limit_amount: globalMonthlyLimit,
          percent_used: (monthTotalAll / globalMonthlyLimit) * 100,
        })
      }

      const { data: category } = await this.supabase
        .from('usage_categories')
        .select('name, daily_limit, monthly_limit')
        .eq('name', dto.usageType)
        .single()

      if (category) {
        const { daily_limit, monthly_limit } = category as any
        // compute today's total for this category
        const { data: todayRows } = await this.supabase
          .from('usage_entries')
          .select('amount')
          .eq('usage_type', dto.usageType)
          .eq('date', date)
          .eq('user_id', userId)

        const dayTotal = (todayRows ?? []).reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0)

        if (daily_limit && dayTotal > Number(daily_limit)) {
          await this.supabase.from('usage_alerts').insert({
            user_id: userId,
            category_name: dto.usageType,
            alert_type: 'daily',
            total_amount: dayTotal,
            limit_amount: Number(daily_limit),
            percent_used: (dayTotal / Number(daily_limit)) * 100,
            usage_entry_id: data.id,
          })
        }

        // compute monthly total for this category
        if (monthly_limit) {
          const { data: monthRows } = await this.supabase
            .from('usage_entries')
            .select('amount')
            .eq('usage_type', dto.usageType)
            .eq('user_id', userId)
            .gte('date', monthStr)

          const monthTotal = (monthRows ?? []).reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0)
          if (monthTotal > Number(monthly_limit)) {
            await this.supabase.from('usage_alerts').insert({
              user_id: userId,
              category_name: dto.usageType,
              alert_type: 'monthly',
              total_amount: monthTotal,
              limit_amount: Number(monthly_limit),
              percent_used: (monthTotal / Number(monthly_limit)) * 100,
              usage_entry_id: data.id,
            })
          }
        }
      }
    } catch (e) {
      console.error('Error checking limit', e)
    }

    return data
  }

  // return a paginated or full list of entries ordered by newest first
  async findHistory(userId: number) {
    const { data, error } = await this.supabase
      .from('usage_entries')
      .select('id, date, usage_type, amount, notes, duration, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get all usage categories (still global)
  async getCategories() {
    const { data, error } = await this.supabase
      .from('usage_categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Create a new category (global)
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
  async getUserSettings(userId: number) {
    // attempt to fetch; if none, create defaults
    let { data, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && data === null) {
      // no settings yet; create default row
      const insertRes = await this.supabase
        .from('user_settings')
        .insert({ user_id: userId })
        .select()
        .single()
      if (insertRes.error) throw insertRes.error
      data = insertRes.data
      error = null
    }

    if (error) throw error
    return data
  }

  // Update user settings
  async updateUserSettings(userId: number, body: any) {
    const { data, error } = await this.supabase
      .from('user_settings')
      .update({
        daily_limit: body.daily_limit,
        monthly_limit: body.monthly_limit,
        notifications_enabled: body.notifications_enabled,
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get alerts for category limit violations
  async getAlerts(userId: number) {
    const { data, error } = await this.supabase
      .from('usage_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Update or insert daily usage summary
  private async updateDailySummary(userId: number, date: string, totalUsage: number) {
    try {
      // Check if summary exists for this date
      const { data: existing } = await this.supabase
        .from('usage_daily_summaries')
        .select('id')
        .eq('user_id', userId)
        .eq('date', date)
        .single()

      if (existing) {
        // Update existing summary
        await this.supabase
          .from('usage_daily_summaries')
          .update({ 
            total_usage: totalUsage,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
      } else {
        // Insert new summary
        await this.supabase
          .from('usage_daily_summaries')
          .insert({
            user_id: userId,
            date,
            total_usage: totalUsage,
          })
      }

      // Update is_peak flag for the week
      await this.updateWeeklyPeakFlag(userId, date)
    } catch (err) {
      console.warn('[updateDailySummary] Error:', err)
    }
  }

  // Update the is_peak flag for the current week
  private async updateWeeklyPeakFlag(userId: number, date: string) {
    try {
      const currentDate = new Date(date)
      const startOfWeek = new Date(currentDate)
      const diffToMonday = (startOfWeek.getDay() + 6) % 7
      startOfWeek.setDate(startOfWeek.getDate() - diffToMonday)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      const startStr = startOfWeek.toISOString().slice(0, 10)
      const endStr = endOfWeek.toISOString().slice(0, 10)

      // Get all summaries for this week
      const { data: weekSummaries } = await this.supabase
        .from('usage_daily_summaries')
        .select('id, date, total_usage')
        .eq('user_id', userId)
        .gte('date', startStr)
        .lte('date', endStr)

      if (!weekSummaries || weekSummaries.length === 0) return

      // Find the peak day
      const peakDay = weekSummaries.reduce((max, curr) => 
        Number(curr.total_usage) > Number(max.total_usage) ? curr : max
      )

      // Reset all is_peak flags for this week
      await this.supabase
        .from('usage_daily_summaries')
        .update({ is_peak: false })
        .eq('user_id', userId)
        .gte('date', startStr)
        .lte('date', endStr)

      // Set is_peak for the highest day
      await this.supabase
        .from('usage_daily_summaries')
        .update({ is_peak: true })
        .eq('id', peakDay.id)

    } catch (err) {
      console.warn('[updateWeeklyPeakFlag] Error:', err)
    }
  }

  // Update or insert monthly usage summary
  private async updateMonthlySummary(userId: number, monthYear: string, totalUsage: number, targetLimit: number) {
    try {
      // Calculate days in month and days elapsed
      const [year, month] = monthYear.split('-').map(Number)
      const daysInMonth = new Date(year, month, 0).getDate()
      const today = new Date()
      const isCurrentMonth = today.getFullYear() === year && (today.getMonth() + 1) === month
      const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth
      
      // Calculate daily average
      const dailyAverage = daysElapsed > 0 ? totalUsage / daysElapsed : 0
      
      // Calculate projected total (if current month)
      const projectedTotal = isCurrentMonth ? dailyAverage * daysInMonth : totalUsage
      
      // Determine status
      let status = 'on_track'
      const percentUsed = (totalUsage / targetLimit) * 100
      if (percentUsed >= 100) {
        status = 'exceeded'
      } else if (percentUsed >= 80) {
        status = 'warning'
      } else if (projectedTotal > targetLimit) {
        status = 'at_risk'
      }

      // Check if summary exists for this month
      const { data: existing } = await this.supabase
        .from('usage_monthly_summaries')
        .select('id')
        .eq('user_id', userId)
        .eq('month_year', monthYear)
        .single()

      const summaryData = {
        total_usage: totalUsage,
        target_limit: targetLimit,
        daily_average: dailyAverage,
        days_elapsed: daysElapsed,
        days_in_month: daysInMonth,
        projected_total: projectedTotal,
        status,
        updated_at: new Date().toISOString()
      }

      if (existing) {
        await this.supabase
          .from('usage_monthly_summaries')
          .update(summaryData)
          .eq('id', existing.id)
      } else {
        await this.supabase
          .from('usage_monthly_summaries')
          .insert({
            user_id: userId,
            month_year: monthYear,
            ...summaryData,
          })
      }

      // Update is_highest_month flag for the year
      await this.updateYearlyPeakMonth(userId, year)
    } catch (err) {
      console.warn('[updateMonthlySummary] Error:', err)
    }
  }

  // Update the is_highest_month flag for the current year
  private async updateYearlyPeakMonth(userId: number, year: number) {
    try {
      const startMonth = `${year}-01`
      const endMonth = `${year}-12`

      // Get all summaries for this year
      const { data: yearSummaries } = await this.supabase
        .from('usage_monthly_summaries')
        .select('id, month_year, total_usage')
        .eq('user_id', userId)
        .gte('month_year', startMonth)
        .lte('month_year', endMonth)

      if (!yearSummaries || yearSummaries.length === 0) return

      // Find the peak month
      const peakMonth = yearSummaries.reduce((max, curr) => 
        Number(curr.total_usage) > Number(max.total_usage) ? curr : max
      )

      // Reset all is_highest_month flags for this year
      await this.supabase
        .from('usage_monthly_summaries')
        .update({ is_highest_month: false })
        .eq('user_id', userId)
        .gte('month_year', startMonth)
        .lte('month_year', endMonth)

      // Set is_highest_month for the highest month
      await this.supabase
        .from('usage_monthly_summaries')
        .update({ is_highest_month: true })
        .eq('id', peakMonth.id)

    } catch (err) {
      console.warn('[updateYearlyPeakMonth] Error:', err)
    }
  }

  // Get reports data with YoY comparison
  async getReports(userId: number) {
    const today = new Date()
    const currentYear = today.getFullYear()
    const lastYear = currentYear - 1
    const currentMonth = today.getMonth()
    
    // Get this year's total (up to current date)
    const thisYearStart = new Date(currentYear, 0, 1).toISOString().slice(0, 10)
    const { data: thisYearRows } = await this.supabase
      .from('usage_entries')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', thisYearStart)
    
    const thisYearTotal = (thisYearRows ?? []).reduce((sum, r: any) => sum + Number(r.amount ?? 0), 0)
    
    // Get last year's total for the same period (up to same day last year)
    const lastYearStart = new Date(lastYear, 0, 1).toISOString().slice(0, 10)
    const lastYearEnd = new Date(lastYear, currentMonth, today.getDate()).toISOString().slice(0, 10)
    const { data: lastYearRows } = await this.supabase
      .from('usage_entries')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', lastYearStart)
      .lte('date', lastYearEnd)
    
    const lastYearTotal = (lastYearRows ?? []).reduce((sum, r: any) => sum + Number(r.amount ?? 0), 0)
    
    // Calculate YoY change
    let yoyChange = 0
    let yoyPositive = false
    if (lastYearTotal > 0) {
      yoyChange = Math.round(((thisYearTotal - lastYearTotal) / lastYearTotal) * 100)
      yoyPositive = yoyChange < 0 // Negative change means saving water = positive
    }
    
    // Calculate days elapsed based on user's first entry this year (not Jan 1)
    const { data: firstEntryRow } = await this.supabase
      .from('usage_entries')
      .select('date')
      .eq('user_id', userId)
      .gte('date', thisYearStart)
      .order('date', { ascending: true })
      .limit(1)
      .single()
    
    const firstEntryDate = firstEntryRow?.date ? new Date(firstEntryRow.date) : today
    const daysElapsed = Math.max(1, Math.ceil((today.getTime() - firstEntryDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    const avgDailyUsage = Math.round(thisYearTotal / daysElapsed)

    // Get monthly trend data (last 30 days)
    const monthlyTrendData: { date: string; usage: number }[] = []
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    
    const { data: last30DaysRows } = await this.supabase
      .from('usage_entries')
      .select('date, amount')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString().slice(0, 10))
    
    // Group by date
    const usageByDate: Record<string, number> = {}
    ;(last30DaysRows ?? []).forEach((row: any) => {
      const dateKey = row.date
      usageByDate[dateKey] = (usageByDate[dateKey] ?? 0) + Number(row.amount ?? 0)
    })
    
    // Create array for last 30 days
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo)
      d.setDate(thirtyDaysAgo.getDate() + i)
      const dateStr = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      monthlyTrendData.push({
        date: label,
        usage: usageByDate[dateStr] ?? 0,
      })
    }
    
    return {
      thisYearTotal: Math.round(thisYearTotal),
      lastYearTotal: Math.round(lastYearTotal),
      yoyChange,
      yoyPositive,
      avgDailyUsage,
      daysElapsed,
      monthlyTrend: monthlyTrendData,
    }
  }
}