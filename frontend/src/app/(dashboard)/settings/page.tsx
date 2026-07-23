import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { ProfileForm } from "@/components/shared/ProfileForm"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile Settings</h3>
        <p className="text-sm text-muted-foreground">Manage your account settings and preferences.</p>
      </div>
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <ProfileForm user={user} profile={profile} />
      </div>
    </div>
  )
}
