import { CalendarDays, FileText, Tag, Waves } from "lucide-react"
import { useState } from "react"

interface ManualEntryCardProps {
  onAdd: (entry: { usageType: string; amount: number; date: string; notes?: string }) => void
  onCancel?: () => void
}

export function ManualEntryCard({ onAdd, onCancel }: ManualEntryCardProps) {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [amount, setAmount] = useState("")
  const [usageType, setUsageType] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    const parsed = parseFloat(amount)
    if (!date) {
      setError("Please select a date")
      return
    }
    if (!usageType) {
      setError("Please choose a usage type")
      return
    }
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid amount in liters")
      return
    }

    setError("")
    onAdd({ usageType, amount: parsed, date, notes: notes.trim() || undefined })
    setAmount("")
    setUsageType("")
    setNotes("")
    setDate(today)
  }

  return (
    <div className="rounded-xl border border-sky-100 bg-white shadow-xl ring-1 ring-slate-200">
      <div className="border-b border-slate-200 bg-sky-50/70 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow">
            <span className="text-lg font-semibold">+</span>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">Log Water Usage</p>
            <p className="text-sm text-slate-500">All fields marked with * are required.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CalendarDays className="size-4 text-sky-600" /> Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Waves className="size-4 text-sky-600" /> Water Amount (L) *
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min="0"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1.5"
                className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 pr-16 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
              <span className="pointer-events-none absolute right-4 text-sm font-medium text-slate-400">Liters</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Tag className="size-4 text-sky-600" /> Usage Type *
            </label>
            <select
              value={usageType}
              onChange={(e) => setUsageType(e.target.value)}
              className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">Select a category</option>
              <option value="Drinking">Drinking</option>
              <option value="Cooking">Cooking</option>
              <option value="Washing">Washing</option>
              <option value="Bathing">Bathing</option>
              <option value="Irrigation">Irrigation</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="size-4 text-sky-600" /> Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Any specific details about this usage?"
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>

        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 active:scale-95"
        >
          Save Entry
        </button>
      </div>
    </div>
  )
}
