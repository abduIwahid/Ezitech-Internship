"use client"

import { useState, useEffect } from "react"
import { AIChatPanel } from "@/components/shared/AIChatPanel"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AssistantPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, demographics, mrn')
        .limit(50)

      if (!error && data) {
        setPatients(data)
      }
    }
    fetchPatients()
  }, [supabase])

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Clinical Assistant</h1>
          <p className="text-muted-foreground">Conversational decision support grounded in patient data.</p>
        </div>
        <div className="w-full sm:w-[300px]">
          <Select 
            value={selectedPatientId || "general"} 
            onValueChange={(val) => setSelectedPatientId(val === "general" ? null : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select patient context" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General / No Patient Selected</SelectItem>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.demographics?.first_name} {p.demographics?.last_name} (MRN: {p.mrn})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <AIChatPanel patientId={selectedPatientId} key={selectedPatientId || 'general'} />
      </div>
    </div>
  )
}
