"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-client"

export default function Dashboard() {
  const [info, setInfo] = useState("Chargement...")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.replace("/connexion")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("prenom, nom, role")
        .eq("id", session.user.id)
        .single()

      if (!profile) {
        window.location.replace("/connexion")
        return
      }

      if (profile.role === "moniteur") {
        window.location.replace("/dashboard/moniteur")
      } else {
        window.location.replace("/dashboard/eleve")
      }
    }
    load()
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
      <svg className="w-8 h-8 animate-spin" style={{ color: "#00F5A0", width: 32, height: 32 }} fill="none" viewBox="0 0 24 24">
        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <span style={{ color: "#666", fontSize: 14 }}>Chargement de votre espace...</span>
    </div>
  )
}
