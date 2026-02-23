export function DailyLimitCard() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-semibold text-slate-900">Daily Limit (150L)</p>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>70% Reached</span>
        <span>Remaining for today</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div className="h-full w-[70%] rounded-full bg-sky-500" />
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-900">45 L</p>
    </div>
  )
}
