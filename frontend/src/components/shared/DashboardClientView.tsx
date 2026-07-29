"use client"

import Link from "next/link"
import { RiskBadge } from "@/components/shared/RiskBadge"
import { DataTable } from "@/components/shared/DataTable"
import { Bell, AlertTriangle, Sparkles, Stethoscope, ArrowRight, ShieldCheck, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface DashboardClientViewProps {
  predictions: any[]
  recentAlerts: any[]
  totalPatients: number
  totalAlerts: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-7xl mx-auto pb-8"
    >
      {/* Novena-Style Hero Clinical Banner */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 p-6 sm:p-10 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-sky-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1 text-xs font-semibold text-sky-300 backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4" /> Next-Generation Healthcare AI
          </motion.div>
          
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Advanced Clinical Analytics
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Empower your clinical decision-making with real-time machine learning predictions, early chronic disease detection, and intelligent patient monitoring.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link href="/patients/new" className="uiverse-btn text-sm px-6 py-3">
              New Risk Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/doctors" className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-700 hover:shadow-lg">
              Browse Directory
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Top 3 Novena Feature Cards */}
      <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-3">
        <div className="group rounded-2xl border bg-card p-6 shadow-sm hover:shadow-xl transition-all duration-300 uiverse-card flex items-start gap-4">
          <div className="p-4 rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary">24/7 Analysis</span>
            <h3 className="font-bold text-base mt-1">Risk Assessment</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Multi-disease early detection for Cardiology, Diabetes & Nephrology.</p>
          </div>
        </div>

        <div className="group rounded-2xl border bg-card p-6 shadow-sm hover:shadow-xl transition-all duration-300 uiverse-card flex items-start gap-4">
          <div className="p-4 rounded-2xl bg-sky-500/10 text-sky-500 transition-transform group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-sky-600">Active Registry</span>
            <h3 className="font-bold text-base mt-1">Patient Tracking</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              <span className="font-bold text-foreground">{totalPatients || 0}</span> Active Patients monitored in real-time.
            </p>
          </div>
        </div>

        <div className="group rounded-2xl border bg-card p-6 shadow-sm hover:shadow-xl transition-all duration-300 uiverse-card flex items-start gap-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 transition-transform group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600">Security & Alerts</span>
            <h3 className="font-bold text-base mt-1">Risk Escalation</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              <span className="font-bold text-foreground">{totalAlerts || 0}</span> New Unacknowledged critical alerts.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Risk Patients & Alerts */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col space-y-4 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-bold tracking-tight">High & Critical Risk Patients</h2>
            <Link href="/patients" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <DataTable columns={columns} data={predictions || []} />
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-bold tracking-tight">Recent Alerts</h2>
            </div>
            <Link href="/alerts" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Alerts Center <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {!recentAlerts || recentAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
              <Bell className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm font-medium text-foreground">No active unacknowledged alerts</p>
              <p className="text-xs mt-1 text-center max-w-[200px]">Your patients are currently stable.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto custom-scrollbar max-h-[300px] pr-2">
              {recentAlerts.map((alert: any, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center justify-between p-4 rounded-xl border bg-background hover:border-amber-500/30 hover:bg-amber-500/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-full group-hover:scale-110 transition-transform">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {alert.type}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        MRN: <span className="font-mono">{alert.patients?.mrn || alert.patient_id.slice(0, 8)}</span> • {new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <RiskBadge severity={alert.severity} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
