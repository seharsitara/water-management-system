import { Bell, Menu, Plus, Search } from "lucide-react"
import { Button } from "../../components/ui/button"

interface HeaderBarProps {
  onManualAddClick: () => void
}

export function HeaderBar({ onManualAddClick }: HeaderBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
          <span className="text-sm font-semibold">WT</span>
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">WaterTrack</p>
          <p className="text-xs text-slate-500">Home Management</p>
        </div>
        <div className="ml-6 hidden items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-slate-500 shadow-sm ring-1 ring-slate-200 sm:flex">
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          <span>Home</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="hidden sm:inline-flex border-slate-200">
          <Menu className="size-4" />
        </Button>
        <Button variant="outline" size="icon" className="border-slate-200">
          <Search className="size-4" />
        </Button>
        <Button variant="outline" size="icon" className="border-slate-200">
          <Bell className="size-4" />
        </Button>
        <Button
          type="button"
          className="gap-2 bg-sky-600 hover:bg-sky-700"
          onClick={(e) => {
            e.preventDefault()
            onManualAddClick()
          }}
        >
          <Plus className="size-4" />
          Manual Entry
        </Button>
      </div>
    </header>
  )
}
