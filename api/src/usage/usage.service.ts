import { Inject, Injectable } from '@nestjs/common'
import { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_CLIENT } from '../supabase.provider'
import { CreateUsageDto } from './dto/create-usage.dto'

@Injectable()
export class UsageService {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async findDashboard() {
    const today = new Date().toISOString().slice(0, 10)

    const { data: todayRows, error: todayError } = await this.supabase
      .from('usage_entries')
      .select('amount')
      .eq('date', today)

    if (todayError) throw todayError

    const todaysTotal = (todayRows ?? []).reduce((sum, e) => sum + Number(e.amount ?? 0), 0)

    const { data: categoryRows, error: categoryError } = await this.supabase
      .from('usage_entries')
      .select('usage_type, amount')

    if (categoryError) throw categoryError

    const grouped = (categoryRows ?? []).reduce<Record<string, number>>((acc, row: any) => {
      const key = row.usage_type ?? 'Unknown'
      const amt = Number(row.amount ?? 0)
      acc[key] = (acc[key] ?? 0) + amt
      return acc
    }, {})

    const totalAmount = Object.values(grouped).reduce((sum, v) => sum + v, 0) || 1
    const colors = ['bg-sky-500', 'bg-amber-400', 'bg-emerald-500', 'bg-slate-400', 'bg-purple-400']
    const usageByCategory = Object.entries(grouped).map(([label, total], idx) => ({
      label,
      value: Math.round(((total / totalAmount) * 100) * 10) / 10,
      color: colors[idx % colors.length],
    }))

    const { data: recentRows, error: recentError } = await this.supabase
      .from('usage_entries')
      .select('id, usage_type, amount, notes, date, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentError) throw recentError

    const recentEntries = (recentRows ?? []).map((entry: any) => {
      const date = entry.date ? new Date(entry.date) : new Date()
      const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      return {
        time,
        activity: entry.notes ? `${entry.usage_type} · ${entry.notes}` : entry.usage_type,
        volume: `${Number(entry.amount).toFixed(1)} L`,
        efficiency: 'Manual',
      }
    })

    const summaryCards = [
      { label: "Today's Total", value: todaysTotal, sub: '-8% vs yesterday', icon: 'droplets' },
      { label: 'Monthly Average', value: '142.8 L', sub: 'Based on last 30 days', icon: 'calendar' },
      { label: 'Peak Usage Time', value: '07:30 AM', sub: 'Morning routine peak', icon: 'clock' },
      { label: 'Water Saved', value: '12.4 L', sub: 'Compared to target', icon: 'flame' },
    ]

    return {
      summaryCards,
      usageByCategory,
      recentEntries,
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
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}
