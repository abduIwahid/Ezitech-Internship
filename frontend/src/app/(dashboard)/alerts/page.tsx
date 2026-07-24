"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { RiskBadge, RiskSeverity } from "@/components/shared/RiskBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bell, CheckCircle2 } from "lucide-react"

interface Alert {
  id: string
  patient_id: string
  type: string
  severity: RiskSeverity | string
  status: string
  created_at: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('status', 'new')
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setAlerts(data)
      }
      setLoading(false)
    }

    fetchAlerts()

    // Real-time subscription
    const channel = supabase
      .channel('public:alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          setAlerts((current) => [payload.new as Alert, ...current])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'alerts' },
        (payload) => {
          // If status changed from 'new' to something else, remove it
          if (payload.new.status !== 'new') {
            setAlerts((current) => current.filter((a) => a.id !== payload.new.id))
          } else {
            // Otherwise just update it
            setAlerts((current) => current.map((a) => a.id === payload.new.id ? payload.new as Alert : a))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleAcknowledge = async (id: string) => {
    // Optimistic UI update
    setAlerts((current) => current.filter((a) => a.id !== id))

    const { data: { user } } = await supabase.auth.getUser()
    
    // Update backend
    await supabase
      .from('alerts')
      .update({ 
        status: 'acknowledged', 
        acknowledged_by: user?.id 
      })
      .eq('id', id)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alerts Center</h1>
        <p className="text-muted-foreground">Real-time notifications for critical patient events.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Active Alerts</CardTitle>
          </div>
          <CardDescription>
            {alerts.length === 0 ? "You're all caught up." : `You have ${alerts.length} unacknowledged alerts.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8 text-muted-foreground">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border rounded-lg border-dashed">
              <CheckCircle2 className="h-10 w-10 mb-4 text-green-500 opacity-50" />
              <p>No new alerts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1 mb-4 sm:mb-0">
                    <div className="flex items-center gap-3">
                      <RiskBadge severity={alert.severity} />
                      <span className="font-semibold">{alert.type} Alert</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Patient ID: {alert.patient_id} • {new Date(alert.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleAcknowledge(alert.id)}>
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
