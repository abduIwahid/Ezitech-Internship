import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { MLOpsView } from "@/components/shared/MLOpsView"

export const dynamic = 'force-dynamic'

export default async function AdminMLOpsPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  // Fetch live drift status + model status from FastAPI
  let driftData: any = null
  let modelStatus: any = null
  const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'

  try {
    const [driftRes, statusRes] = await Promise.allSettled([
      fetch(`${ML_URL}/drift-status`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) }),
      fetch(`${ML_URL}/model-status`, { next: { revalidate: 30 }, signal: AbortSignal.timeout(5000) })
    ])
    if (driftRes.status === 'fulfilled' && driftRes.value.ok) driftData = await driftRes.value.json()
    if (statusRes.status === 'fulfilled' && statusRes.value.ok) modelStatus = await statusRes.value.json()
  } catch (e) {}

  // Prediction volume trend - last 14 days from Supabase
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const { data: predictionTrend } = await supabase
    .from('predictions')
    .select('created_at, severity, probability')
    .gte('created_at', twoWeeksAgo)
    .order('created_at', { ascending: true })

  return <MLOpsView driftData={driftData} modelStatus={modelStatus} predictionTrend={predictionTrend || []} />
}
