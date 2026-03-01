export const initialSummaryCards = [
  {
    label: "Today's Total",
    value: 105.2,
    sub: "-8% vs yesterday",
    icon: "droplets",
  },
  {
    label: "Monthly Average",
    value: "142.8 L",
    sub: "Based on last 30 days",
    icon: "calendar",
  },
  {
    label: "Peak Usage Time",
    value: "07:30 AM",
    sub: "Morning routine peak",
    icon: "clock",
  },
  {
    label: "Water Saved",
    value: "12.4 L",
    sub: "Compared to target",
    icon: "flame",
  },
]

export const initialUsageByCategory = [
  { label: "Bathroom", value: 52, color: "bg-sky-500" },
  { label: "Kitchen", value: 33, color: "bg-amber-400" },
  { label: "Others", value: 15, color: "bg-slate-300" },
]

export const initialRecentEntries = [
  { time: "11:02 PM", activity: "Shower", volume: "65.8 L", efficiency: "Good", duration: "10 min" },
  { time: "06:37 PM", activity: "Laundry", volume: "12.2 L", efficiency: "Excellent", duration: "45 min" },
  { time: "01:52 PM", activity: "Dishwasher", volume: "10.2 L", efficiency: "Average", duration: "2h 15m" },
]
