import Link from "next/link"
import { usePathname } from "next/navigation"
import { AlertCircle, BarChart2, Bell, ChevronDown, History, LayoutDashboard, LogIn, LogOut, Settings, User } from "lucide-react"

import { cn } from "../../../lib/utils"
import { useAuth } from "@/context/AuthContext"

interface SidebarNavProps {
  settingsOpen: boolean
  onToggleSettings: () => void
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Usage History", href: "/dashboard/history", icon: History },
  { label: "Detailed Reports", href: "/dashboard/reports", icon: BarChart2 },
  { label: "Alerts", href: "/dashboard/alerts", icon: AlertCircle },
]

export function SidebarNav({ settingsOpen, onToggleSettings }: SidebarNavProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="hidden lg:flex min-h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 shadow-sm lg:overflow-y-auto">
     
      <nav className="space-y-1 text-sm font-medium text-slate-600">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition",
              pathname === item.href
                ? "bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100"
                : "hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
              <item.icon className="size-4" />
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="space-y-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              <User className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user?.name || "Guest"}</p>
              <p className="text-[11px] text-slate-500">{user?.email || "Not signed in"}</p>
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
            <div className="space-y-1 rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-700">
              {user ? (
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-slate-50"
                >
                  <LogOut className="size-4 text-rose-500" />
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-slate-50"
                  >
                    <LogIn className="size-4 text-sky-500" />
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-slate-50"
                  >
                    <User className="size-4 text-emerald-500" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
