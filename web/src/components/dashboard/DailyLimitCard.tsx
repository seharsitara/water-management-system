interface DailyLimitCardProps {
  dailyLimit: number
  todaysTotal: number
}

export function DailyLimitCard({ dailyLimit, todaysTotal }: DailyLimitCardProps) {
  const percentage = dailyLimit ? Math.min(Math.round((todaysTotal / dailyLimit) * 100), 999) : 0
  const remaining = Math.max(dailyLimit - todaysTotal, 0)

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-semibold text-slate-900">Daily Limit ({dailyLimit.toFixed(0)} L)</p>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{percentage}% Reached</span>
        <span>Remaining for today</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-900">{remaining.toFixed(1)} L</p>
    </div>
  )
}
