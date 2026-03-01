"use client"

import { HeaderBar } from "@/components/dashboard/HeaderBar"
import { SidebarNav } from "@/components/dashboard/SidebarNav"
import { DetailedReports } from "./DetailedReports"
import { useState } from "react"

export default function ReportsPage() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-sky-50/70 text-slate-900">
      <HeaderBar onManualAddClick={() => {}} />
      <main className="flex min-h-[calc(100vh-64px)] bg-sky-50/70">
        <SidebarNav settingsOpen={settingsOpen} onToggleSettings={() => setSettingsOpen((prev) => !prev)} />
        <DetailedReports />
      </main>
    </div>
  )
}
