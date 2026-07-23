import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { DataTable } from "@/components/shared/DataTable"
import { RiskBadge } from "@/components/shared/RiskBadge"
import Link from "next/link"

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

  const columns = [
    { header: "MRN", accessorKey: "mrn" as any },
    { 
      header: "Patient Name", 
      cell: (p: any) => `${p.demographics?.first_name || ''} ${p.demographics?.last_name || 'Unknown'}`
    },
    { header: "Age", cell: (p: any) => p.demographics?.age || 'N/A' },
    { header: "Gender", cell: (p: any) => p.demographics?.gender || 'N/A' },
    { 
      header: "Risk Status", 
      cell: (p: any) => {
        const preds = p.predictions || []
        const latest = preds.sort((a:any, b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        return <RiskBadge severity={latest?.severity || 'Unknown'} />
      }
    },
    {
      header: "Actions",
      cell: (p: any) => <Link href={`/patients/${p.id}`} className="text-primary hover:underline">View Details</Link>
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
      </div>
      <div className="bg-card border rounded-xl shadow-sm">
        <DataTable columns={columns} data={patients || []} />
      </div>
    </div>
  )
}
