"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function NewPatientPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    bmi: "25",
    bpSystolic: "120",
    highChol: false,
    smoker: false,
    historyHeartDisease: false,
    historyStroke: false,
    physActivity: true,
    genHlth: "3",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Authentication required")

      const { data: profile } = await supabase
        .from("profiles")
        .select("hospital_id")
        .eq("id", user.id)
        .single()

      // 1. Insert Patient
      const mrn = `MRN-${Math.floor(Math.random() * 900000) + 100000}`
      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .insert({
          mrn,
          demographics: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            age: parseInt(formData.age),
            gender: formData.gender,
            birth_date: new Date(
              new Date().setFullYear(new Date().getFullYear() - parseInt(formData.age))
            ).toISOString(),
          },
          hospital_id: profile?.hospital_id || null,
        })
        .select()
        .single()

      if (patientError || !patient) throw new Error(`Patient Error: ${patientError?.message}`)

      // 2. Insert Vitals
      const now = new Date().toISOString()
      await supabase.from("vitals").insert([
        { patient_id: patient.id, type: "BMI", value: formData.bmi, unit: "kg/m²", recorded_at: now },
        { patient_id: patient.id, type: "Blood Pressure Systolic", value: formData.bpSystolic, unit: "mmHg", recorded_at: now },
      ])

      // 3. Insert Diagnoses History
      const diagnosesToInsert = []
      if (formData.historyHeartDisease)
        diagnosesToInsert.push({ patient_id: patient.id, condition: "Heart Disease", diagnosed_at: now })
      if (formData.historyStroke)
        diagnosesToInsert.push({ patient_id: patient.id, condition: "Stroke", diagnosed_at: now })
      if (diagnosesToInsert.length > 0)
        await supabase.from("diagnoses").insert(diagnosesToInsert)

      // 4. Call local FastAPI /predict
      const ageNum = parseInt(formData.age)
      const ageGroup = Math.min(13, Math.max(1, Math.ceil(ageNum / 10)))
      const bmiNum = parseFloat(formData.bmi) || 25
      const bpHigh = parseInt(formData.bpSystolic) >= 130 ? 1.0 : 0.0

      const mlPayload = {
        HighBP: bpHigh,
        HighChol: formData.highChol ? 1.0 : 0.0,
        CholCheck: 1.0,
        BMI: bmiNum,
        Smoker: formData.smoker ? 1.0 : 0.0,
        Stroke: formData.historyStroke ? 1.0 : 0.0,
        HeartDiseaseorAttack: formData.historyHeartDisease ? 1.0 : 0.0,
        PhysActivity: formData.physActivity ? 1.0 : 0.0,
        Fruits: 1.0,
        Veggies: 1.0,
        HvyAlcoholConsump: 0.0,
        AnyHealthcare: 1.0,
        NoDocbcCost: 0.0,
        GenHlth: parseFloat(formData.genHlth) || 3.0,
        MentHlth: 0.0,
        PhysHlth: 0.0,
        DiffWalk: 0.0,
        Sex: formData.gender === "Male" ? 1.0 : 0.0,
        Age: ageGroup,
        Education: 5.0,
        Income: 6.0,
      }

      const mlRes = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mlPayload),
      })

      if (!mlRes.ok) {
        const err = await mlRes.json().catch(() => ({ detail: mlRes.statusText }))
        throw new Error(`ML Engine Error: ${err.detail || mlRes.statusText}`)
      }

      const prediction = await mlRes.json()

      // 5. Save prediction to Supabase (only use confirmed schema columns)
      const { error: predSaveErr } = await supabase.from("predictions").insert({
        patient_id: patient.id,
        disease: "Diabetes",
        probability: prediction.probability,
        severity: prediction.severity,
        confidence: prediction.confidence,
        model_version: prediction.model_version,
      })

      if (predSaveErr) {
        console.warn("Prediction save warning:", predSaveErr.message)
        // Still navigate — patient was created successfully
      }

      // 6. Navigate to patient detail page
      router.push(`/patients/${patient.id}`)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "An unexpected error occurred. Is the ML service running at localhost:8000?")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/patients">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Patient & Run Inference</h1>
          <p className="text-muted-foreground">Input clinical data to immediately trigger the predictive risk model.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Clinical Profile</CardTitle>
            <CardDescription>All fields will be processed by the ML engine in real-time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">
                {error}
              </div>
            )}

            {/* Patient Identity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  required
                  value={formData.gender}
                  onValueChange={(val) => setFormData({ ...formData, gender: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clinical Measurements */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Clinical Measurements</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bmi">BMI</Label>
                  <Input
                    id="bmi"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 25.5"
                    required
                    value={formData.bmi}
                    onChange={(e) => setFormData({ ...formData, bmi: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bpSystolic">Systolic Blood Pressure (mmHg)</Label>
                  <Input
                    id="bpSystolic"
                    type="number"
                    placeholder="e.g. 120"
                    required
                    value={formData.bpSystolic}
                    onChange={(e) => setFormData({ ...formData, bpSystolic: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genHlth">General Health (1=Excellent → 5=Poor)</Label>
                  <Select
                    value={formData.genHlth}
                    onValueChange={(val) => setFormData({ ...formData, genHlth: val })}
                  >
                    <SelectTrigger id="genHlth">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 — Excellent</SelectItem>
                      <SelectItem value="2">2 — Very Good</SelectItem>
                      <SelectItem value="3">3 — Good</SelectItem>
                      <SelectItem value="4">4 — Fair</SelectItem>
                      <SelectItem value="5">5 — Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="pt-4 border-t border-border/50 space-y-3">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Medical History & Lifestyle</p>
              {[
                { key: "historyHeartDisease", label: "Prior Heart Disease or Attack" },
                { key: "historyStroke", label: "Prior Stroke" },
                { key: "highChol", label: "High Cholesterol" },
                { key: "smoker", label: "Smoker (≥100 cigarettes in lifetime)" },
                { key: "physActivity", label: "Physically Active (past 30 days)" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={key}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={formData[key as keyof typeof formData] as boolean}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                  />
                  <label htmlFor={key} className="text-sm font-medium leading-none">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/20 p-6">
            <button
              type="submit"
              className="w-full h-12 uiverse-btn flex items-center justify-center text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating AI Prediction...
                </>
              ) : (
                "Save Patient & Run AI Prediction"
              )}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
