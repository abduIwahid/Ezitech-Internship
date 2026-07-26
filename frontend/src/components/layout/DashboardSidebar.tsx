"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Settings, LogOut, Bell, Bot, ShieldCheck, BarChart3, User } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { useState, useEffect } from "react"

interface DashboardSidebarProps {
  onClose?: () => void
  className?: string
}

export function DashboardSidebar({ onClose, className }: DashboardSidebarProps) {
  const pathname = usePathname()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const [isAdmin, setIsAdmin] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
          if (data) {
            setRole(data.role)
            setIsAdmin(['super_admin', 'hospital_admin', 'data_scientist'].includes(data.role))
          }
        })
      }
    })
  }, [])

  const roleItems = role === 'doctor'
    ? [{ name: 'Doctor Hub', href: '/assistant', icon: Bot }, { name: 'Clinical Patients', href: '/patients', icon: Users }]
    : role === 'patient'
      ? [{ name: 'My Health', href: '/patients', icon: User }, { name: 'My Alerts', href: '/alerts', icon: Bell }]
      : []

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "Alerts Center", href: "/alerts", icon: Bell },
    { name: "AI Assistant", href: "/assistant", icon: Bot },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    ...roleItems,
    ...(isAdmin ? [{ name: "Admin Console", href: "/admin", icon: ShieldCheck }] : []),
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div className={cn("flex h-full w-72 flex-col border-r bg-card/95 backdrop-blur-xl shadow-sm md:w-64", className)}>
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <span className="text-[10px] font-bold text-white">MAI</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-primary">MediSight AI</span>
        </div>
      </div>
      {role && (
        <div className="border-b px-4 py-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {role === 'doctor' ? 'Doctor Dashboard' : role === 'patient' ? 'Patient Portal' : 'Administrator Section'}
        </div>
      )}
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-2 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )
}

