"use client"

import Link from "next/link"
import { RiskBadge } from "@/components/shared/RiskBadge"
import { DataTable } from "@/components/shared/DataTable"
import { Bell, AlertTriangle, Sparkles, Stethoscope, ArrowRight, ShieldCheck, Clock } from "lucide-react"

interface DashboardClientViewProps {
  predictions: any[]
  recentAlerts: any[]
  totalPatients: number
  totalAlerts: number
}

export function DashboardClientView({ predictions, recentAlerts, totalPatients, totalAlerts }: DashboardClientViewProps) {
  const columns = [
    { header: "MRN", cell: (p: any) => <span className="font-mono text-xs text-muted-foreground">{p.patients?.mrn}</span> },
    { header: "Name", cell: (p: any) => `${p.patients?.demographics?.first_name || ''} ${p.patients?.demographics?.last_name || ''}` || '—' },
    { header: "Disease Model", accessorKey: "disease" as any },
    { header: "Severity", cell: (p: any) => <RiskBadge severity={p.severity} /> },
    { header: "Action", cell: (p: any) => <Link href={`/patients/${p.patients?.id}`} className="text-primary hover:underline font-medium text-xs">View Patient</Link> }
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-8">
      {/* Novena-Style Hero Clinical Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 p-6 sm:p-10 text-white shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 text-xs font-semibold text-sky-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" /> Total Healthcare AI Solution
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Your Most Trusted Clinical AI Partner
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Real-time machine learning predictions, early chronic disease detection, and automated alerting for healthcare teams.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/patients/new" className="uiverse-btn text-xs px-4 py-2.5">
              New Risk Assessment <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
            <Link href="/doctors" className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700">
              Browse Doctors Directory
            </Link>
          </div>
        </div>
      </div>

      {/* Top 3 Novena Feature Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition uiverse-card flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary">24 Hours Service</span>
            <h3 className="font-bold text-sm">Online Risk Assessment</h3>
            <p className="text-xs text-muted-foreground mt-1">Multi-disease early detection for Cardiology, Diabetes & Nephrology.</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition uiverse-card flex items-start gap-4">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-600">Active System</span>
            <h3 className="font-bold text-sm">Patient Registry</h3>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-bold text-foreground">{totalPatients || 0} Active Patients</span> tracked in real-time.
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition uiverse-card flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600">Emergency Alerts</span>
            <h3 className="font-bold text-sm">Critical Risk Escalation</h3>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-bold text-foreground">{totalAlerts || 0} New Unacknowledged</span> alerts needing attention.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Risk Patients & Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4 uiverse-card">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold">High & Critical Risk Patients</h2>
            <Link href="/patients" className="text-xs font-semibold text-primary hover:underline">
              View All Patients →
            </Link>
          </div>
          <DataTable columns={columns} data={predictions || []} />
        </div>

        <div className="bg-card border rounded-xl p-5 shadow-sm flex flex-col uiverse-card">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold">Recent Alerts</h2>
            </div>
            <Link href="/alerts" className="text-xs font-semibold text-primary hover:underline">
              Alerts Center →
            </Link>
          </div>

          {!recentAlerts || recentAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-12 text-muted-foreground border rounded-lg border-dashed">
              <Bell className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-xs font-medium">No active unacknowledged alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">
                        {alert.type} — MRN: {alert.patients?.mrn || alert.patient_id.slice(0, 8)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <RiskBadge severity={alert.severity} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
