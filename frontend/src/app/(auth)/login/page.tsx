"use client"
import { useState, type FormEvent } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackError = searchParams.get("error")

  const supabase = createClient()

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const credentials = identifier.includes("@")
      ? { email: identifier, password }
      : { phone: identifier, password }

    const { error } = await supabase.auth.signInWithPassword(credentials)

    if (error) {
      setError(error.message)
    } else {
      router.push("/")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-950/10 px-4 py-10">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-xl shadow-slate-900/5 backdrop-blur-md">
        <div className="grid gap-8 px-8 py-10 grid-cols-1 md:px-12 md:py-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Welcome back</p>
              <h1 className="text-3xl font-semibold text-slate-950">Sign in to MediSight AI</h1>
              <p className="max-w-xl text-sm leading-6 text-slate-600">
                Securely access your AI healthcare workspace and resume your patient insights in one place.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Phone</Label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-500">
                    <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" fill="currentColor" />
                  </svg>
                  <Input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="Enter your email or phone number"
                    required
                    className="border-0 bg-transparent px-0 text-sm placeholder:text-slate-400 focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                  <svg width="20" height="20" viewBox="-64 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-500">
                    <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" fill="currentColor" />
                    <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" fill="currentColor" />
                  </svg>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="border-0 bg-transparent px-0 text-sm placeholder:text-slate-400 focus-visible:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200/60"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 576 512" className="h-5 w-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M572.52 241.4c-1.67-3.07-41.66-76.98-110.56-136.55C402.72 64.91 343.35 32 288 32c-6.75 0-13.42.24-20 .68C192.03 39.88 115.03 90.64 56.14 163.44c-3.1 3.82-3.09 9.12.03 12.94C57.81 179.4 128 288 128 288s70.19 108.6 14.43 111.62C78.55 402.72 63.41 404 48 404c-8 0-16-1.22-16-9.34 0-69.5 57.86-192.36 160.19-238.21 9.65-3.8 20.03 1.95 23.83 11.6 3.8 9.66-1.95 20.03-11.6 23.83C146.53 204.8 96 250.91 96 256c0 30.87 75.02 128 192 128s192-97.13 192-128c0-6.08-50.52-51.19-128.43-94.12-9.66-3.8-15.4-14.17-11.6-23.83 3.8-9.65 14.18-15.4 23.83-11.6 102.33 44.22 160.19 168.07 160.19 238.21 0 8.12-8 9.34-16 9.34-15.41 0-30.55-1.28-43.56-4.78-55.76-3.02 14.43-111.62 14.43-111.62s70.19-108.6 14.43-111.62z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 576 512" className="h-5 w-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M572.52 241.4c-1.67-3.07-41.66-76.98-110.56-136.55C402.72 64.91 343.35 32 288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  Remember me
                </label>
                <span className="text-sm text-slate-500">Secure session</span>
              </div>

              {callbackError && <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">⚠️ {callbackError}</div>}
              {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

              <Button type="submit" className="w-full rounded-2xl py-3" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
