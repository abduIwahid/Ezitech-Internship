import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { AnalyticsDashboard } from "@/components/shared/AnalyticsDashboard"

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  // Population-level predictions stats
  const { data: predictions } = await supabase
    .from('predictions')
    .select('disease, severity, probability, created_at, patients(hospital_id, hospitals(name))')
    .order('created_at', { ascending: false })
    .limit(2000)

  // Patient count per hospital
  const { data: patientsByHospital } = await supabase
    .from('patients')
    .select('hospital_id, hospitals(name)')

  // Alert stats
  const { data: alertStats } = await supabase
    .from('alerts')
    .select('severity, status, created_at')

  // Risk score distribution (30-day window)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentPredictions } = await supabase
    .from('predictions')
    .select('probability, severity, disease, created_at')
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: true })

  return (
    <AnalyticsDashboard
      predictions={predictions || []}
      patientsByHospital={patientsByHospital || []}
      alertStats={alertStats || []}
      recentPredictions={recentPredictions || []}
    />
  )
}
