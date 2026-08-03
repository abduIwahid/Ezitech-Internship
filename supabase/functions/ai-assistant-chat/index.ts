import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error("Unauthorized")
    }

    const { patient_id, message, history } = await req.json()
    if (!message) {
      throw new Error("Message is required")
    }

    let patientContextText = "No patient context provided."
    if (patient_id) {
      // Fetch patient context
      const { data: patient } = await supabaseClient
        .from('patients')
        .select('*, vitals(*), diagnoses(*)')
        .eq('id', patient_id)
        .single()
      
      if (patient) {
        patientContextText = `Patient ID: ${patient_id}\n`
        patientContextText += `Demographics: ${JSON.stringify(patient.demographics)}\n`
        if (patient.vitals) {
          patientContextText += `Latest Vitals: ${JSON.stringify(patient.vitals.slice(0, 5))}\n`
        }
      }
    }

    // Prepare system prompt for a premium assistant
    const systemPrompt = `You are MediSight AI, an advanced, highly intelligent clinical decision support assistant designed to help medical professionals.
    Your tone should be professional, objective, clear, and clinical - similar to ChatGPT, Gemini, or Claude operating in a specialized medical capacity.
    
    INSTRUCTIONS:
    1. Act as a clinical copilot. Provide analytical, data-driven insights.
    2. You do NOT make final diagnoses or prescribe treatments. Frame your suggestions as clinical recommendations/considerations for the physician's review.
    3. Format your answers beautifully using Markdown (bold text, clean lists, bullet points, headers, and simple tables where relevant).
    4. Provide specific, detailed explanations of what factors (e.g. high BMI, elevated blood pressure, lifestyle details) are driving the patient's risk profile based on the data.
    5. Maintain a natural, conversational tone while preserving clinical precision.
    6. Always include a brief clinical disclaimer at the end of patient-specific queries.
    
    PATIENT CONTEXT:
    ${patientContextText}
    `

    // Call OpenAI compatible API (OpenAI, Groq, etc.)
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    const apiBaseUrl = Deno.env.get('OPENAI_API_BASE_URL') || 'https://api.openai.com/v1'
    const modelId = Deno.env.get('AI_MODEL_ID') || 'gpt-4o-mini'

    if (!apiKey) {
      throw new Error("AI API Key is not configured")
    }

    // Construct full conversation history
    const openaiMessages = [
      { role: 'system', content: systemPrompt }
    ]

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          // Exclude helper/error local fallbacks if they creep into history
          if (!msg.content.startsWith('⚠️') && !msg.content.startsWith('👋')) {
            openaiMessages.push({ role: msg.role, content: msg.content })
          }
        }
      }
    }

    // Append the latest user query
    openaiMessages.push({ role: 'user', content: message })

    const aiResponse = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: openaiMessages,
        temperature: 0.4
      })
    })

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      throw new Error(`AI API Error: ${errText}`)
    }

    const aiData = await aiResponse.json()
    const reply = aiData.choices[0].message.content

    // Optional: Log interaction to ai_messages
    if (patient_id) {
      await supabaseClient.from('ai_messages').insert([
        { user_id: user.id, patient_id: patient_id, role: 'user', content: message },
        { user_id: user.id, patient_id: patient_id, role: 'assistant', content: reply }
      ])
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
