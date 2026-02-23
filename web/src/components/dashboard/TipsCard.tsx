export function TipsCard() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
      <p className="text-sm font-semibold text-slate-900">Personalized Saving Tips</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
          <p className="font-semibold text-emerald-900">Gardening Insight</p>
          <p className="mt-1 text-emerald-800">
            You use 20% more water on Sundays. Try using a smart timer.
          </p>
        </div>
        <div className="rounded-xl bg-sky-50 p-3 text-sm text-sky-800 ring-1 ring-sky-100">
          <p className="font-semibold text-sky-900">Shower Efficiency</p>
          <p className="mt-1 text-sky-800">
            Reducing shower time by 2 minutes could save you 15L daily.
          </p>
        </div>
      </div>
    </div>
  )
}
