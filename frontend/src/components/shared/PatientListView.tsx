"use client"

import { DataTable } from "@/components/shared/DataTable"
import { RiskBadge } from "@/components/shared/RiskBadge"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface PatientListViewProps {
  patients: any[]
}

export function PatientListView({ patients }: PatientListViewProps) {
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
      cell: (p: any) => <Link href={`/patients/${p.id}`} className="text-primary font-medium hover:underline">View Details</Link>
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients Panel</h1>
          <p className="text-muted-foreground text-sm">Manage patient records and run predictive models.</p>
        </div>
        <Link href="/patients/new" prefetch={true} className="uiverse-btn">
          <Plus className="h-4 w-4 mr-2" />
          Add Patient & Predict
        </Link>
      </div>
      <div className="bg-card border rounded-xl shadow-sm uiverse-card">
        <DataTable columns={columns} data={patients || []} />
      </div>
    </div>
  )
}
