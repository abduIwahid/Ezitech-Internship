import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { Input } from "@/components/ui/input"
import { Search, Bell, User } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-card/80 backdrop-blur-xl px-6 shadow-sm z-10 sticky top-0">
          <div className="flex-1 flex items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patients, MRN, or alerts... (Cmd+K)"
                className="w-full bg-muted/50 pl-9 border-none focus-visible:ring-1 focus-visible:ring-primary h-9 rounded-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive border border-card" />
            </button>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  )
}

