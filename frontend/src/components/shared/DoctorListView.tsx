"use client"

import Link from "next/link"
import { DataTable } from "@/components/shared/DataTable"
import { Badge } from "@/components/ui/badge"
import { Stethoscope, MapPin, Phone, Mail } from "lucide-react"

interface DoctorListViewProps {
  doctors: any[]
}

export function DoctorListView({ doctors }: DoctorListViewProps) {
  const columns = [
    {
      header: "Doctor",
      cell: (doctor: any) => (
        <div className="space-y-1">
          <div className="font-semibold text-sm">{doctor.full_name || doctor.name}</div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Stethoscope className="h-3.5 w-3.5" /> {doctor.specialty}
          </div>
        </div>
      )
    },
    {
      header: "Hospital",
      cell: (doctor: any) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {doctor.hospitals?.name || "Independent"}
        </div>
      )
    },
    {
      header: "Status",
      cell: (doctor: any) => (
        <Badge variant={doctor.available ? "secondary" : "outline"} className="text-xs">
          {doctor.available ? "Available" : "Not Available"}
        </Badge>
      )
    },
    {
      header: "Fee",
      cell: (doctor: any) => (
        <span className="text-sm">{doctor.consultation_fee ? `$${Number(doctor.consultation_fee).toFixed(0)}` : "TBD"}</span>
      )
    },
    {
      header: "Contact",
      cell: (doctor: any) => (
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          {doctor.email && (
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{doctor.email}</span>
          )}
          {doctor.phone && (
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{doctor.phone}</span>
          )}
        </div>
      )
    },
    {
      header: "",
      cell: (doctor: any) => (
        <Link href={`/doctors/${doctor.id}`} className="text-sm font-medium text-primary hover:underline">
          View Profile
        </Link>
      )
    }
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Doctor Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse vetted doctors and specialists available through MediSight AI.
          </p>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <DataTable columns={columns} data={doctors} />
      </div>
    </div>
  )
}
