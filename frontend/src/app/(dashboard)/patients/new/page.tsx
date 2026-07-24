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
    bmi: "",
    bpSystolic: "",
    historyHeartDisease: false,
    historyStroke: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Authentication required")

      // Fetch the doctor's profile to get the hospital_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('hospital_id')
        .eq('id', user.id)
        .single()
        
      if (profileError || !profile?.hospital_id) {
        throw new Error("Could not find your Hospital Assignment. Please contact administration.")
      }

      // 1. Insert Patient
      const mrn = `MRN-${Math.floor(Math.random() * 900000) + 100000}`
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert({
          mrn: mrn,
          demographics: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            age: parseInt(formData.age),
            gender: formData.gender,
            // Calculate a fake birth_date based on age for the Edge Function logic
            birth_date: new Date(new Date().setFullYear(new Date().getFullYear() - parseInt(formData.age))).toISOString()
          },
          hospital_id: profile.hospital_id
        })
        .select()
        .single()

      if (patientError || !patient) throw new Error(`Patient Error: ${patientError?.message}`)

      // 2. Insert Vitals
      const vitalsToInsert = []
      const now = new Date().toISOString()
      if (formData.bmi) {
        vitalsToInsert.push({ patient_id: patient.id, type: 'BMI', value: formData.bmi, unit: 'kg/m2', recorded_at: now })
      }
      if (formData.bpSystolic) {
        vitalsToInsert.push({ patient_id: patient.id, type: 'Blood Pressure Systolic', value: formData.bpSystolic, unit: 'mmHg', recorded_at: now })
      }
      if (vitalsToInsert.length > 0) {
        const { error: vitalsError } = await supabase.from('vitals').insert(vitalsToInsert)
        if (vitalsError) throw new Error(`Vitals Error: ${vitalsError.message}`)
      }

      // 3. Insert Diagnoses History
      const diagnosesToInsert = []
      if (formData.historyHeartDisease) {
        diagnosesToInsert.push({ patient_id: patient.id, condition: 'Heart Disease', status: 'active', code: 'I51.9' })
      }
      if (formData.historyStroke) {
        diagnosesToInsert.push({ patient_id: patient.id, condition: 'Stroke', status: 'active', code: 'I63.9' })
      }
      if (diagnosesToInsert.length > 0) {
        const { error: diagError } = await supabase.from('diagnoses').insert(diagnosesToInsert)
        if (diagError) throw new Error(`Diagnoses Error: ${diagError.message}`)
      }

      // 4. Trigger ML Prediction Edge Function
      const { data: predictionData, error: predictError } = await supabase.functions.invoke('predict-risk', {
        body: { patient_id: patient.id, disease: 'Cardiovascular Disease' }
      })

      if (predictError || !predictionData) {
        // Edge functions might return an error object inside the data if it threw an exception 
        // that wasn't caught by the network layer
        if (predictionData && predictionData.error) {
           throw new Error(`ML Engine Error: ${predictionData.error}`)
        }
        throw new Error(`Edge Function Error: ${predictError?.message || 'Unknown error'}`)
      }

      if (predictionData.error) {
        throw new Error(`ML Engine Error: ${predictionData.error}`)
      }

      // 5. Navigate to the Prediction UI!
      router.push(`/patients/${patient.id}/predictions/${predictionData.id}`)
      
    } catch (err: any) {
      console.error(err)
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/patients"><ArrowLeft className="h-5 w-5" /></Link>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  required 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select required value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})}>
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

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div className="space-y-2">
                <Label htmlFor="bmi">BMI</Label>
                <Input 
                  id="bmi" 
                  type="number" 
                  step="0.1" 
                  placeholder="e.g. 25.5" 
                  required
                  value={formData.bmi}
                  onChange={(e) => setFormData({...formData, bmi: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bpSystolic">Systolic Blood Pressure</Label>
                <Input 
                  id="bpSystolic" 
                  type="number" 
                  placeholder="e.g. 120" 
                  required
                  value={formData.bpSystolic}
                  onChange={(e) => setFormData({...formData, bpSystolic: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border/50 space-y-4">
              <Label>Medical History Factors</Label>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="heart" 
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={formData.historyHeartDisease}
                  onChange={(e) => setFormData({...formData, historyHeartDisease: e.target.checked})}
                />
                <label htmlFor="heart" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Prior Heart Disease or Attack
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="stroke" 
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={formData.historyStroke}
                  onChange={(e) => setFormData({...formData, historyStroke: e.target.checked})}
                />
                <label htmlFor="stroke" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Prior Stroke
                </label>
              </div>
            </div>

          </CardContent>
          <CardFooter className="border-t bg-muted/20 p-6">
            <button type="submit" className="w-full h-12 uiverse-btn flex items-center justify-center text-base" disabled={loading}>
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
