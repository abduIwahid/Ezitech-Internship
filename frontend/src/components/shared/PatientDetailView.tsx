"use client"

import { PatientRiskCard } from "@/components/shared/PatientRiskCard"
import { DataTable } from "@/components/shared/DataTable"
import Link from "next/link"
import { ArrowLeft, User, Calendar, Activity, FlaskConical, Stethoscope, Heart } from "lucide-react"
import { RiskBadge } from "@/components/shared/RiskBadge"

// Format snake_case → Title Case, with medical abbreviations
function fmtLabel(str: string): string {
  if (!str) return "—"
  const abbr: Record<string, string> = {
    bmi: "BMI", bp: "BP", hdl: "HDL", ldl: "LDL",
    cholesterol: "Cholesterol", systolic: "Systolic BP", diastolic: "Diastolic BP",
  }
  return str.split(/[_\s]+/).map(w => abbr[w.toLowerCase()] || w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

function fmtDate(iso: string): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

function getPatientName(patient: any): string {
  const d = patient.demographics
  if (!d) return "Unknown Patient"
  // Handle full_name or name field
  if (d.full_name) return d.full_name
  if (d.name) return d.name
  // Handle split first/last (camelCase or snake_case)
  const first = d.first_name || d.firstName || ""
  const last = d.last_name || d.lastName || ""
  return `${first} ${last}`.trim() || "Unknown Patient"
}

interface PatientDetailViewProps {
  patient: any
  latestPrediction: any
}

export function PatientDetailView({ patient, latestPrediction }: PatientDetailViewProps) {
  const name = getPatientName(patient)
  const d = patient.demographics || {}
  const age = d.age || (
    (d.birth_date || d.dob)
      ? Math.floor((Date.now() - new Date(d.birth_date || d.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null
  )
  const gender = d.gender ? d.gender.charAt(0).toUpperCase() + d.gender.slice(1).toLowerCase() : "—"
  const dob = d.birth_date || d.dob ? fmtDate(d.birth_date || d.dob) : "—"

  const vitalsColumns = [
    { header: "Type", cell: (v: any) => <span className="font-medium">{fmtLabel(v.type)}</span> },
    { header: "Value", cell: (v: any) => `${v.value} ${v.unit || ""}`.trim() },
    { header: "Date", cell: (v: any) => fmtDate(v.recorded_at) }
  ]

  const labsColumns = [
    { header: "Test", cell: (l: any) => <span className="font-medium">{fmtLabel(l.test_name)}</span> },
    { header: "Value", cell: (l: any) => `${l.value} ${l.unit || ""}`.trim() },
    { header: "Date", cell: (l: any) => fmtDate(l.recorded_at) }
  ]

  const allPredictions = patient.predictions || []
  const sortedPreds = [...allPredictions].sort((a: any, b: any) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/patients">
          <button className="mt-1 h-8 w-8 rounded-lg border flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-primary">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-0.5">
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{patient.mrn}</span>
                {age !== "—" && <span>Age {age}</span>}
                {gender !== "—" && <span>{gender}</span>}
                {dob !== "—" && <span>DOB: {dob}</span>}
              </div>
            </div>
          </div>
        </div>
        {latestPrediction && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Latest Risk:</span>
            <RiskBadge severity={latestPrediction.severity} />
          </div>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Gender</p>
          <p className="font-semibold mt-1">{gender}</p>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Age</p>
          <p className="font-semibold mt-1">{age !== "—" ? `${age} yrs` : "—"}</p>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Activity className="h-3 w-3" /> Vitals</p>
          <p className="font-semibold mt-1">{patient.vitals?.length || 0} records</p>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><FlaskConical className="h-3 w-3" /> Labs</p>
          <p className="font-semibold mt-1">{patient.lab_results?.length || 0} results</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Prediction Card */}
        <div className="md:col-span-1 space-y-4">
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
            <div className="bg-card border rounded-xl p-6 shadow-sm text-center space-y-3">
              <Stethoscope className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">No prediction available.</p>
              <Link
                href="/patients/new"
                className="inline-block text-xs text-primary hover:underline"
              >
                Add new assessment →
              </Link>
            </div>
          )}

          {/* Prediction History (if multiple) */}
          {sortedPreds.length > 1 && (
            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Heart className="h-3.5 w-3.5 text-muted-foreground" /> Prediction History
              </h3>
              <div className="space-y-2">
                {sortedPreds.slice(0, 5).map((pred: any) => (
                  <div key={pred.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{fmtDate(pred.created_at)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{(pred.probability * 100).toFixed(0)}%</span>
                      <RiskBadge severity={pred.severity} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vitals + Labs */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" /> Recent Vitals
            </h2>
            {patient.vitals && patient.vitals.length > 0 ? (
              <DataTable columns={vitalsColumns} data={patient.vitals.slice(0, 8)} />
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg border-dashed">
                No vitals recorded.
              </p>
            )}
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-muted-foreground" /> Recent Lab Results
            </h2>
            {patient.lab_results && patient.lab_results.length > 0 ? (
              <DataTable columns={labsColumns} data={patient.lab_results.slice(0, 8)} />
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg border-dashed">
                No lab results recorded.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
