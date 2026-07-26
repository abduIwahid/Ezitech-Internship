"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { Input } from "@/components/ui/input"
import { Search, Bell, User, Menu, Settings, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    setSearchQuery(params.get("search") || "")
    setMobileMenuOpen(false)
    setNotificationsOpen(false)
    setProfileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mobileMenuOpen])

  const handleSearch = (event?: React.FormEvent) => {
    event?.preventDefault()
    const readyQuery = searchQuery.trim()
    if (readyQuery) {
      router.push(`/patients?search=${encodeURIComponent(readyQuery)}`)
    } else {
      router.push("/patients")
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background">
      <div className="hidden md:flex md:w-64 md:flex-none">
        <DashboardSidebar />
      </div>

      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden ${mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-200 md:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <DashboardSidebar onClose={() => setMobileMenuOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b bg-card/95 px-3 shadow-sm backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition hover:text-foreground md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <form onSubmit={handleSearch} className="w-full min-w-0 max-w-xl">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSearch(event)}
                  type="search"
                  placeholder="Search patients, MRN, or alerts"
                  className="h-9 w-full rounded-full border border-border/60 bg-muted/60 pl-9 pr-3 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
            </form>
          </div>

          <div className="relative flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((open) => !open)
                  setProfileOpen(false)
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-64 rounded-xl border bg-card p-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Notifications</p>
                    <button type="button" className="text-xs text-primary" onClick={() => router.push("/alerts")}>View all</button>
                  </div>
                  <div className="mt-3 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                    You have no unread alerts right now.
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((open) => !open)
                  setNotificationsOpen(false)
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary transition hover:bg-primary/20"
                aria-label="Open profile menu"
              >
                <User className="h-5 w-5" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 rounded-xl border bg-card p-2 shadow-xl">
                  <Link href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-destructive">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-transparent p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

