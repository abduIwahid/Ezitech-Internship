"use client"

import { useState, useMemo } from "react"
import { DataTable } from "@/components/shared/DataTable"
import { RiskBadge } from "@/components/shared/RiskBadge"
import Link from "next/link"
import { Plus, Search, Users } from "lucide-react"
import { Input } from "@/components/ui/input"

// Format vital/lab type names from snake_case to Title Case
function formatName(str: string): string {
  if (!str) return "—"
  const abbreviations: Record<string, string> = {
    bmi: "BMI", bp: "BP", mrn: "MRN", hdl: "HDL", ldl: "LDL"
  }
  return str.split(/[_\s]+/).map(w => abbreviations[w.toLowerCase()] || w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

// Get patient display name from demographics JSONB — handles multiple field name conventions
function getPatientName(p: any): string {
  const d = p.demographics
  if (!d) return "—"
  // Handle full_name or name field
  if (d.full_name) return d.full_name
  if (d.name) return d.name
  // Handle split first/last (camelCase or snake_case)
  const first = d.first_name || d.firstName || ""
  const last = d.last_name || d.lastName || ""
  const full = `${first} ${last}`.trim()
  return full || "—"
}

function getAge(p: any): string {
  const d = p.demographics
  if (!d) return "—"
  if (d.age) return String(d.age)
  // Derive from birth_date if age missing
  if (d.birth_date || d.dob) {
    const dob = new Date(d.birth_date || d.dob)
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    return String(age)
  }
  return "—"
}

function getGender(p: any): string {
  const d = p.demographics
  if (!d) return "—"
  const g = d.gender || ""
  return g ? g.charAt(0).toUpperCase() + g.slice(1).toLowerCase() : "—"
}

function getLatestSeverity(p: any): string | null {
  const preds = p.predictions || []
  if (preds.length === 0) return null
  const sorted = [...preds].sort((a: any, b: any) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  return sorted[0]?.severity || null
}

interface PatientListViewProps {
  patients: any[]
}

export function PatientListView({ patients }: PatientListViewProps) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    if (!query.trim()) return patients
    const q = query.toLowerCase()
    return patients.filter(p => {
      const name = getPatientName(p).toLowerCase()
      const mrn = (p.mrn || "").toLowerCase()
      return name.includes(q) || mrn.includes(q)
    })
  }, [patients, query])

  const columns = [
    {
      header: "MRN",
      cell: (p: any) => (
        <span className="font-mono text-xs text-muted-foreground">{p.mrn}</span>
      )
    },
    {
      header: "Patient Name",
      cell: (p: any) => {
        const name = getPatientName(p)
        return (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary">
                {name !== "—" ? name.charAt(0).toUpperCase() : "?"}
              </span>
            </div>
            <span className="font-medium">{name}</span>
          </div>
        )
      }
    },
    {
      header: "Age",
      cell: (p: any) => <span className="text-sm">{getAge(p)}</span>
    },
    {
      header: "Gender",
      cell: (p: any) => <span className="text-sm">{getGender(p)}</span>
    },
    {
      header: "Hospital",
      cell: (p: any) => (
        <span className="text-xs text-muted-foreground">{p.hospitals?.name || "—"}</span>
      )
    },
    {
      header: "Risk Status",
      cell: (p: any) => {
        const severity = getLatestSeverity(p)
        const preds = p.predictions || []
        const latest = preds.length > 0 ? [...preds].sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0] : null
        if (severity) {
          return (
            <div className="flex flex-col gap-0.5">
              <RiskBadge severity={severity} />
              {latest?.disease && <span className="text-[10px] text-muted-foreground">{latest.disease}</span>}
            </div>
          )
        }
        return (
          <Link href={`/patients/new`} className="text-xs text-primary hover:underline">
            Run Prediction
          </Link>
        )
      }
    },
    {
      header: "Actions",
      cell: (p: any) => (
        <Link href={`/patients/${p.id}`} className="text-primary font-medium hover:underline text-sm">
          View Details
        </Link>
      )
    }
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients Panel</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Showing {filtered.length} of {patients.length} most recent records.
          </p>
        </div>
        <Link href="/patients/new" prefetch={true} className="uiverse-btn flex-shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Patient & Predict
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or MRN..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-card border rounded-xl shadow-sm uiverse-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">No patients match your search.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={filtered} />
        )}
      </div>
    </div>
  )
}
