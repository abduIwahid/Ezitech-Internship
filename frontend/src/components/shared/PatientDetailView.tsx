"use client"

import { PatientRiskCard } from "@/components/shared/PatientRiskCard"
import { DataTable } from "@/components/shared/DataTable"

interface PatientDetailViewProps {
  patient: any
  latestPrediction: any
}

export function PatientDetailView({ patient, latestPrediction }: PatientDetailViewProps) {
  const vitalsColumns = [
    { header: "Type", accessorKey: "type" as any },
    { header: "Value", cell: (v: any) => `${v.value} ${v.unit}` },
    { header: "Date", cell: (v: any) => new Date(v.recorded_at).toLocaleDateString() }
  ]

  const labsColumns = [
    { header: "Test", accessorKey: "test_name" as any },
    { header: "Value", cell: (l: any) => `${l.value} ${l.unit}` },
    { header: "Date", cell: (l: any) => new Date(l.recorded_at).toLocaleDateString() }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {patient.demographics?.first_name} {patient.demographics?.last_name}
          </h1>
          <p className="text-muted-foreground">MRN: {patient.mrn} | Age: {patient.demographics?.age} | Gender: {patient.demographics?.gender}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          {latestPrediction ? (
            <PatientRiskCard 
              disease={latestPrediction.disease}
              probability={latestPrediction.probability}
              confidence={latestPrediction.confidence}
              severity={latestPrediction.severity}
              patientId={patient.id}
              predictionId={latestPrediction.id}
            />
          ) : (
            <div className="bg-card border rounded-xl p-6 shadow-sm text-center">
              <p className="text-muted-foreground">No prediction available.</p>
            </div>
          )}
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Recent Vitals</h2>
            <DataTable columns={vitalsColumns} data={patient.vitals?.slice(0,5) || []} />
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Recent Labs</h2>
            <DataTable columns={labsColumns} data={patient.lab_results?.slice(0,5) || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
