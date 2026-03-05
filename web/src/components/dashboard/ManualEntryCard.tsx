import { CalendarDays, FileText, Tag, Waves, Clock, Home, Building2, Factory } from "lucide-react"
import { useState } from "react"
import { cn } from "../../../lib/utils"

type EntityType = 'home' | 'society' | 'industry'

interface ManualEntryCardProps {
  onAdd: (entry: { 
    usageType: string; 
    amount: number; 
    date: string; 
    notes?: string; 
    duration?: number;
    entityType?: EntityType;
    entityName?: string;
  }) => void
  onCancel?: () => void
}

const ENTITY_CONFIG = {
  home: {
    label: 'Home',
    icon: Home,
    dailyLimit: 500,
    monthlyLimit: 15000,
    description: 'Residential household',
    color: 'sky',
  },
  society: {
    label: 'Society',
    icon: Building2,
    dailyLimit: 5000,
    monthlyLimit: 150000,
    description: 'Apartment complex / Housing society',
    color: 'emerald',
  },
  industry: {
    label: 'Industry',
    icon: Factory,
    dailyLimit: 20000,
    monthlyLimit: 600000,
    description: 'Factory / Industrial unit',
    color: 'amber',
  },
} as const

export function ManualEntryCard({ onAdd, onCancel }: ManualEntryCardProps) {
  const today = new Date().toISOString().slice(0, 10)
  const [entityType, setEntityType] = useState<EntityType>('home')
  const [entityName, setEntityName] = useState('')
  const [date, setDate] = useState(today)
  const [amount, setAmount] = useState("")
  const [usageType, setUsageType] = useState("")
  const [notes, setNotes] = useState("")
  const [duration, setDuration] = useState("")
  const [error, setError] = useState("")

  const currentConfig = ENTITY_CONFIG[entityType]

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

    if (parsed > currentConfig.dailyLimit) {
      setError(`Warning: Amount exceeds daily limit of ${currentConfig.dailyLimit}L for ${currentConfig.label}`)
    }

    setError("")
    onAdd({
      usageType,
      amount: parsed,
      date,
      notes: notes.trim() || undefined,
      duration: duration ? parseInt(duration) : undefined,
      entityType,
      entityName: entityName.trim() || undefined,
    })
    setAmount("")
    setUsageType("")
    setNotes("")
    setDuration("")
    setEntityName("")
    setDate(today)
  }

  return (
    <div className="rounded-xl border border-sky-100 bg-white shadow-xl ring-1 ring-slate-200 max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-sky-50/70 px-6 py-4">
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
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Building2 className="size-4 text-sky-600" /> Entity Type *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(ENTITY_CONFIG) as [EntityType, typeof ENTITY_CONFIG[EntityType]][]).map(([type, config]) => {
              const Icon = config.icon
              const isSelected = entityType === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEntityType(type)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                    isSelected 
                      ? type === 'home' ? "border-sky-500 bg-sky-50 ring-2 ring-sky-200"
                        : type === 'society' ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200"
                        : "border-amber-500 bg-amber-50 ring-2 ring-amber-200"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <Icon className={cn(
                    "size-8",
                    isSelected 
                      ? type === 'home' ? "text-sky-600" : type === 'society' ? "text-emerald-600" : "text-amber-600"
                      : "text-slate-400"
                  )} />
                  <span className={cn(
                    "text-sm font-bold",
                    isSelected ? "text-slate-900" : "text-slate-600"
                  )}>
                    {config.label}
                  </span>
                  <span className="text-[10px] text-slate-500 text-center">{config.description}</span>
                </button>
              )
            })}
          </div>
          
          <div className={cn(
            "flex items-center justify-between rounded-lg px-4 py-2 text-xs font-medium",
            entityType === 'home' ? "bg-sky-50 text-sky-700"
              : entityType === 'society' ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          )}>
            <span>Daily Limit: {currentConfig.dailyLimit.toLocaleString()} L</span>
            <span>Monthly Limit: {currentConfig.monthlyLimit.toLocaleString()} L</span>
          </div>
        </div>

        
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Tag className="size-4 text-sky-600" /> Entity Name
          </label>
          <input
            type="text"
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            placeholder={entityType === 'home' ? "e.g. House A, My Home" : entityType === 'society' ? "e.g. Block B, Tower 3" : "e.g. Factory 1, Unit A"}
            className="h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

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

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Clock className="size-4 text-sky-600" /> Duration (minutes)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 15"
              className="h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
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
