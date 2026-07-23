import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { RiskBadge } from "@/components/shared/RiskBadge"
import { DataTable } from "@/components/shared/DataTable"
import Link from "next/link"

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
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
          <p className="text-sm text-muted-foreground">Alerts center will be implemented in the next phase.</p>
        </div>
      </div>
    </div>
  )
}
