"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { Navbar } from "@/components/navbar"

export default function Resultats() {
  const [moniteurs, setMoniteurs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    fetchMoniteurs()

    async function fetchMoniteurs() {
      try {
        const { data, error } = await supabase
          .from("moniteurs")
          .select('*, profiles (prenom, nom, avatar_url)')
          .eq("verifie", true)
          .order("note_moyenne", { ascending: false })
        
        if (error) throw error
        setMoniteurs(data)
      } catch (error) {
        console.error("Erreur chargement moniteurs", error)
      } finally {
        setLoading(false)
      }
    }
  }, [])
  
  return (
    <div className="text-foreground min-h-screen">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Moniteurs Auto-École <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">Île-de-France</span>
        </h1>
        
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          ) : moniteurs.map((moniteur) => (
            <div key={moniteur.id} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <img 
                  src={moniteur.profiles.avatar_url} 
                  alt={`${moniteur.profiles.prenom} ${moniteur.profiles.nom}`} 
                  className="w-14 h-14 rounded-full bg-background" 
                />
                <div>
                  <div className="text-lg font-semibold">{moniteur.profiles.prenom} {moniteur.profiles.nom}</div>
                  <div className="mt-1 text-sm">
                    {moniteur.zone} · {moniteur.tarif_horaire}€/h
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-[#FFB23F]">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} fill={i < Math.floor(moniteur.note_moyenne) ? "currentColor" : "none"} viewBox="0 0 24 24" className="w-4 h-4">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ))}
                    <span>({moniteur.nb_avis} avis)</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
