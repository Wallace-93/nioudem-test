"use client"
export const dynamic = "force-dynamic"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

export default function Dashboard() {
  const [info, setInfo] = useState("Chargement...")

  useEffect(() => {
<<<<<<< Updated upstream
    async function load() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      )

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.replace("/connexion"); return }

      const { data: profile } = await supabase
        .from("profiles")
        .select("prenom, nom, role")
        .eq("id", session.user.id)
        .single()

      if (profile) {
        setInfo(`Bonjour ${profile.prenom} ${profile.nom} — Rôle : ${profile.role}`)
      } else {
        setInfo("Profil introuvable")
=======
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
>>>>>>> Stashed changes
      }
    }
    load()
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
      <h1>Dashboard</h1>
      <p style={{ color: "#00F5A0", fontSize: 18 }}>{info}</p>
      <button onClick={() => {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        )
        supabase.auth.signOut().then(() => window.location.replace("/connexion"))
      }} style={{ padding: "8px 16px", borderRadius: 8, background: "#ff6b6b", color: "white", border: "none", cursor: "pointer" }}>
        Déconnexion
      </button>
    </div>
  )
}
