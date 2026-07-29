import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { DashboardClientView } from "@/components/shared/DashboardClientView"

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

  // Quick stats counts
  const { count: totalPatients } = await supabase.from('patients').select('*', { count: 'exact', head: true })
  const { count: totalAlerts } = await supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('status', 'New')

  return (
    <DashboardClientView 
      predictions={predictions || []}
      recentAlerts={recentAlerts || []}
      totalPatients={totalPatients || 0}
      totalAlerts={totalAlerts || 0}
    />
  )
}
