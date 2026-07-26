import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { RiskBadge } from "@/components/shared/RiskBadge"
import { DataTable } from "@/components/shared/DataTable"
import Link from "next/link"
import { Bell, AlertTriangle } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  // Fetch recent high/critical risk patients
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*, patients(id, mrn, demographics)')
    .in('severity', ['High', 'Critical'])
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch recent new alerts
  const { data: recentAlerts } = await supabase
    .from('alerts')
    .select('*, patients(mrn)')
    .eq('status', 'New')
    .order('created_at', { ascending: false })
    .limit(5)

  const columns = [
    { header: "MRN", cell: (p: any) => p.patients?.mrn },
    { header: "Name", cell: (p: any) => `${p.patients?.demographics?.first_name || ''} ${p.patients?.demographics?.last_name || ''}` },
    { header: "Disease", accessorKey: "disease" as any },
    { header: "Severity", cell: (p: any) => <RiskBadge severity={p.severity} /> },
    { header: "Action", cell: (p: any) => <Link href={`/patients/${p.patients?.id}`} className="text-primary hover:underline">View</Link> }
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">High & Critical Risk Patients</h2>
          <DataTable columns={columns} data={predictions || []} />
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Recent Alerts</h2>
            </div>
            <Link href="/alerts" className="text-sm text-primary hover:underline font-medium">
              View All →
            </Link>
          </div>
          {!recentAlerts || recentAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-10 text-muted-foreground border rounded-lg border-dashed">
              <Bell className="h-8 w-8 mb-3 opacity-30" />
              <p className="text-sm">No new alerts at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        {alert.type} — MRN: {alert.patients?.mrn || alert.patient_id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
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
