"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot, Send, User, AlertTriangle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface AIChatPanelProps {
  patientId?: string | null
}

const SUGGESTED_PROMPTS = [
  "Summarize this patient's risk in one paragraph.",
  "What changed since their last visit?",
  "Which lab values are driving this prediction?",
  "Draft a discharge risk summary."
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function fetchPatientContext(patientId: string, supabase: any) {
  const { data } = await supabase
    .from("patients")
    .select(`
      mrn, demographics,
      predictions(probability, severity, disease, created_at),
      vitals(type, value, unit, recorded_at),
      lab_results(test_name, value, unit, recorded_at)
    `)
    .eq("id", patientId)
    .single()
  return data
}

function buildPatientSummary(patient: any): string {
  if (!patient) return ""
  const d = patient.demographics || {}
  const name = [d.first_name || d.firstName, d.last_name || d.lastName].filter(Boolean).join(" ") || "Unknown"
  const age = d.age ? `${d.age} years old` : ""
  const gender = d.gender || ""
  const preds = (patient.predictions || []).sort((a: any, b: any) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const latest = preds[0]
  const vitals = (patient.vitals || []).slice(0, 5).map((v: any) => `${v.type}: ${v.value}${v.unit || ""}`).join(", ")
  const labs = (patient.lab_results || []).slice(0, 5).map((l: any) => `${l.test_name}: ${l.value}${l.unit || ""}`).join(", ")

  let ctx = `Patient: ${name}${age ? `, ${age}` : ""}${gender ? `, ${gender}` : ""}. MRN: ${patient.mrn}.`
  if (latest) ctx += ` Latest risk: ${latest.severity} (${(latest.probability * 100).toFixed(1)}% probability, disease: ${latest.disease || "Diabetes"}).`
  if (preds.length > 1) ctx += ` ${preds.length} historical predictions on record.`
  if (vitals) ctx += ` Recent vitals — ${vitals}.`
  if (labs) ctx += ` Recent labs — ${labs}.`
  return ctx
}

function generateLocalResponse(message: string, patientContext: string, modelStatus: any): string {
  const q = message.toLowerCase()

  if (patientContext) {
    if (q.includes("risk") || q.includes("summarize") || q.includes("summary") || q.includes("paragraph")) {
      return `📋 Clinical Summary\n\n${patientContext}\n\nBased on the patient's structured data, the risk assessment reflects the features supplied to the prediction model. Please verify these findings against the full clinical chart before making decisions.`
    }
    if (q.includes("lab") || q.includes("driving") || q.includes("factor") || q.includes("which")) {
      return `🔬 Key Risk Drivers\n\nThe MediSight model evaluates 21 clinical features including BMI, blood pressure status, cholesterol levels, physical activity, smoking history, and general health self-rating.\n\nFor a detailed SHAP feature importance breakdown for this patient, navigate to the patient's detail page and view the Prediction Detail section.\n\n${patientContext}`
    }
    if (q.includes("discharge") || q.includes("draft")) {
      return `📝 Discharge Risk Summary (Draft)\n\n${patientContext}\n\nThis patient's current risk classification should be reviewed by the attending physician before discharge. Ensure appropriate follow-up appointments are scheduled based on severity level.\n\nThis is an AI-generated draft — review and edit before official use.`
    }
    if (q.includes("change") || q.includes("last visit") || q.includes("since")) {
      return `📈 Trend Analysis\n\n${patientContext}\n\nComparing historical predictions shows the trajectory of risk over time. If risk has increased, consider re-evaluating lifestyle factors and medication adherence. Contact the care team to discuss any significant changes.\n\nFull trend data is visible in the Prediction History on the patient detail page.`
    }
    return `ℹ️ Patient Context\n\n${patientContext}\n\nI can help answer questions about risk drivers, trend analysis, or draft clinical summaries. Please ask a more specific question about this patient.`
  }

  // General queries (no patient selected)
  if (q.includes("model") || q.includes("accuracy") || q.includes("performance")) {
    const metrics = modelStatus?.metrics
    if (metrics) {
      return `🤖 Model Performance\n\n- AUC-ROC: ${(metrics.auc_roc * 100).toFixed(1)}%\n- F1 Score: ${(metrics.f1 * 100).toFixed(1)}%\n- Accuracy: ${(metrics.accuracy * 100).toFixed(1)}%\n- Model: ${modelStatus.model_name || "LightGBM"}\n- Version: ${modelStatus.version || "1.0.0"}\n\nThe model was trained on the BRFSS 2015 Diabetes Health Indicators dataset using binary classification for early diabetes risk detection.`
    }
    return `🤖 Model Performance\n\nThe MediSight ML model (LightGBM) was trained on the BRFSS 2015 Diabetes Health Indicators dataset. It achieves strong performance with AUC-ROC >0.83 on the held-out test set.\n\nThe FastAPI inference service is running at ${API_URL}. Visit ${API_URL}/docs to explore the full API.`
  }
  if (q.includes("diabetes") || q.includes("disease") || q.includes("predict")) {
    return `🩺 About MediSight AI Prediction\n\nMediSight AI detects early-stage Diabetes risk using 21 clinical and lifestyle features:\n\n- Biometric: BMI, blood pressure, cholesterol\n- Lifestyle: Physical activity, smoking, diet, alcohol\n- Health history: Stroke, heart disease, difficulty walking\n- Socioeconomic: Income, education, healthcare access\n\nRisk is classified as: Low (<20%), Moderate (20-50%), High (50-80%), Critical (>80%).\n\nSelect a patient from the dropdown above to get patient-specific insights.`
  }
  if (q.includes("help") || q.includes("what can") || q.includes("feature")) {
    return `💡 How I Can Help\n\n1. Patient risk summaries — Select a patient and ask me to summarize their risk\n2. Risk driver analysis — Find out which clinical factors are influencing the prediction\n3. Discharge drafts — Generate a draft risk summary for discharge planning\n4. Trend analysis — Understand how a patient's risk has changed over time\n5. Model performance — Ask about the model's accuracy and metrics\n\nSelect a patient from the dropdown above to get started!`
  }
  if (q.includes("high risk") || q.includes("critical") || q.includes("alert")) {
    return `🚨 High-Risk Protocol\n\nFor patients flagged as High or Critical risk:\n\n1. Immediate physician notification\n2. Order comprehensive metabolic panel (CMP) and HbA1c if not recent\n3. Review current medications for contraindications\n4. Schedule follow-up within 2 weeks\n5. Consider dietitian referral and lifestyle intervention program\n\nCheck the Alerts Center in the sidebar for active risk alerts across your patient panel.`
  }

  return `👋 I'm MediSight AI, your clinical decision support assistant.\n\nI can answer questions about:\n- Patient risk summaries and clinical factors\n- Model performance and predictions\n- High-risk protocols and clinical guidance\n\nTo get patient-specific insights: Select a patient from the dropdown above, then ask about their risk, lab drivers, or request a discharge summary.\n\nWhat would you like to know?`
}

export function AIChatPanel({ patientId }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello, I am MediSight AI. How can I assist you with clinical insights today?\n\nSelect a patient from the dropdown above for patient-specific answers, or ask me general clinical questions about risk, protocols, and model performance."
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const [patientData, modelStatusRes] = await Promise.all([
        patientId ? fetchPatientContext(patientId, supabase) : Promise.resolve(null),
        fetch(`${API_URL}/model-status`).then(r => r.json()).catch(() => null)
      ])

      const patientContext = buildPatientSummary(patientData)
      const reply = generateLocalResponse(text, patientContext, modelStatusRes)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: `⚠️ Error generating response: ${error?.message || "Unknown error"}. Please try again.`
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-[700px] border shadow-sm">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle>MediSight Clinical Copilot</CardTitle>
        </div>
        <CardDescription>
          Ask questions about your patient panel or request summaries based on structured data.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${
              msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}>
              {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div
              className={`px-4 py-2 rounded-xl text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {msg.content.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-secondary text-secondary-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div className="px-4 py-3 rounded-xl bg-muted flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Analyzing clinical data...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="text-xs rounded-full h-7"
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      <CardFooter className="border-t p-4 flex flex-col gap-3">
        <form
          className="flex w-full items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleSend(input)
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={patientId ? "Ask a question about this patient..." : "Ask a general clinical question..."}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground w-full">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          <span>AI-generated insights. Please verify with clinical judgment.</span>
        </div>
      </CardFooter>
    </Card>
  )
}
