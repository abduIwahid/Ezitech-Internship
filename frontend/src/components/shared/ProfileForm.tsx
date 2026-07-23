"use client"
import { useState } from "react"
import { AvatarUploader } from "./AvatarUploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@supabase/ssr"

export function ProfileForm({ user, profile }: { user: any, profile: any }) {
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [department, setDepartment] = useState(profile?.department || '')
  const [saving, setSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          department: department,
          avatar_url: avatarUrl
        })
        .eq('id', user.id)

      if (error) throw error
      alert('Profile updated successfully')
    } catch (e: any) {
      alert('Error updating profile: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-md">
      <AvatarUploader uid={user.id} url={avatarUrl} onUpload={(url) => setAvatarUrl(url)} />
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Department</Label>
        <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Profile"}
      </Button>
    </div>
  )
}
