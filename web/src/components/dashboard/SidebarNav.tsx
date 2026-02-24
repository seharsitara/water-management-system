import { ChevronDown, LogIn, LogOut, Settings, User } from "lucide-react"

import { cn } from "../../../lib/utils"

interface SidebarNavProps {
  settingsOpen: boolean
  onToggleSettings: () => void
}

const navItems = [
  { label: "Dashboard", active: true },
  { label: "Usage History", active: false },
  { label: "Detailed Reports", active: false },
  { label: "Alerts", active: false },
]

export function SidebarNav({ settingsOpen, onToggleSettings }: SidebarNavProps) {
  return (
    <aside className="hidden lg:flex min-h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 shadow-sm lg:overflow-y-auto">
      <nav className="space-y-1 text-sm font-medium text-slate-600">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition",
              item.active
                ? "bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100"
                : "hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-600 text-xs font-semibold">
              {item.label[0]}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-xl border border-slate-200 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">Storage Report</p>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="absolute left-0 top-0 h-full w-7/12 rounded-full bg-sky-500" />
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span>6/10 GB</span>
            <span>60% used</span>
          </div>
        </div>

        <div className="space-y-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              <User className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Alex Johnson</p>
              <p className="text-[11px] text-slate-500">Premium Account</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleSettings}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
          >
            <span className="flex items-center gap-2">
              <Settings className="size-4" />
              Settings
            </span>
            <ChevronDown className={cn("size-4 transition", settingsOpen ? "rotate-180" : "rotate-0")} />
          </button>

          {settingsOpen && (
            <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-700">
              <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-slate-50">
                <LogIn className="size-4 text-sky-600" />
                Sign In
              </button>
              <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-slate-50">
                <LogOut className="size-4 text-rose-500" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
