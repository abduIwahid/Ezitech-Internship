import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { PatientListView } from "@/components/shared/PatientListView"

export const dynamic = 'force-dynamic'

export default async function PatientListPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  // Fetch patients and their latest prediction severity
  const { data: patients, error } = await supabase
    .from('patients')
    .select(`
      id, 
      mrn, 
      demographics, 
      predictions(severity, created_at)
    `)

  if (error) {
    console.error("Supabase Error fetching patients:", error)
    return (
      <div className="p-6 bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
        <h2 className="font-bold">Error loading patients</h2>
        <p className="text-sm">{error.message}</p>
      </div>
    )
  }

  return <PatientListView patients={patients || []} />
}

