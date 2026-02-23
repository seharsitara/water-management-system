export function WeeklyUsageCard() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Weekly Usage Trends</p>
          <p className="text-xs text-slate-500">This week vs last week</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            Last Week
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            This Week
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-sky-50/60 p-4">
        <svg viewBox="0 0 400 180" role="img" aria-label="Weekly usage line chart" className="h-48 w-full">
          <path
            d="M20 140 C60 120 80 110 110 120 C140 135 160 140 190 110 C220 75 240 70 270 120 C300 170 330 140 360 90"
            fill="none"
            stroke="rgba(56, 189, 248, 0.2)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M20 140 C60 150 80 145 110 130 C140 120 160 115 190 130 C220 150 240 155 270 130 C300 100 330 90 360 120"
            fill="none"
            stroke="rgba(15, 118, 178, 0.9)"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
        <div className="mt-2 grid grid-cols-7 text-center text-[11px] text-slate-500">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
