"use client"

export const dynamic = "force-dynamic"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function redirect() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push("/connexion"); return }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (profile?.role === "moniteur") {
          router.push("/dashboard/moniteur")
        } else {
          router.push("/dashboard/eleve")
        }
      } catch (e) {
        router.push("/connexion")
      }
    }
    redirect()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span className="text-muted-foreground text-sm">Chargement de votre espace...</span>
      </div>
    </div>
  )
}
