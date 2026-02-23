interface RecentEntry {
  time: string
  activity: string
  volume: string
  efficiency: string
}

interface RecentEntriesCardProps {
  entries: RecentEntry[]
}

export function RecentEntriesCard({ entries }: RecentEntriesCardProps) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Recent Usage Entries</p>
        <button className="px-0 text-sm font-semibold text-sky-700 hover:text-sky-800">View All</button>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <div className="grid grid-cols-4 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Time</span>
          <span>Activity</span>
          <span>Volume</span>
          <span>Efficiency Status</span>
        </div>
        <div className="divide-y divide-slate-200 bg-white text-sm text-slate-800">
          {entries.map((entry) => (
            <div key={`${entry.time}-${entry.activity}`} className="grid grid-cols-4 px-4 py-3">
              <span>{entry.time}</span>
              <span>{entry.activity}</span>
              <span>{entry.volume}</span>
              <span className="text-emerald-700">{entry.efficiency}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
