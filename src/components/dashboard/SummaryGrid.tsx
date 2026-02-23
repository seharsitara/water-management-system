import { CalendarDays, Clock3, Droplets, Flame } from "lucide-react"
import { ReactNode } from "react"

interface SummaryCard {
  label: string
  value: string | number
  sub: string
  icon: "droplets" | "calendar" | "clock" | "flame" | ReactNode
}

interface SummaryGridProps {
  cards: SummaryCard[]
}

export function SummaryGrid({ cards }: SummaryGridProps) {
  const iconMap: Record<string, ReactNode> = {
    droplets: <Droplets className="size-4 text-sky-500" />,
    calendar: <CalendarDays className="size-4 text-sky-500" />,
    clock: <Clock3 className="size-4 text-sky-500" />,
    flame: <Flame className="size-4 text-emerald-500" />,
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start justify-between text-sm text-slate-600">
            <span>{card.label}</span>
            {typeof card.icon === "string" ? iconMap[card.icon] : card.icon}
          </div>
          <div className="mt-3 text-2xl font-semibold text-slate-900">{card.value}</div>
          <p className="mt-1 text-xs text-emerald-600">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
