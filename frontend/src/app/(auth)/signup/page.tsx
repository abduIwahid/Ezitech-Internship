"use client"
import { useState, type FormEvent } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function SignupPage() {
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMsg(null)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const { error } = await supabase.auth.signUp({
      email,
      password,
      phone,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMsg("Check your email for the confirmation link.")
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-950/10 px-4 py-10">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-xl shadow-slate-900/5 backdrop-blur-md">
        <div className="grid gap-8 px-8 py-10 grid-cols-1 md:px-12 md:py-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Welcome to MediSight</p>
              <h1 className="text-3xl font-semibold text-slate-950">Create your account</h1>
              <p className="max-w-xl text-sm leading-6 text-slate-600">
                Start your journey with MediSight AI and access secure clinical insights in one place.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                    className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200/60"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
              {msg && <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</div>}

              <Button type="submit" className="w-full rounded-2xl py-3" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Why join?</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                Secure AI-powered patient insights
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                Clinical risk prediction dashboards
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                Fast onboarding with healthcare workflows
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
