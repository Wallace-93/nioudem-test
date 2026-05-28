"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-client"

type Moniteur = {
  id: string
  diplome: string
  specialites: string[]
  tarif_horaire: number
  zone: string
  rayon_km: number
  boite_auto: boolean
  bio: string
  verifie: boolean
  note_moyenne: number
  nb_avis: number
  profiles: { prenom: string; nom: string }
}

type Dispo = { jour_semaine: string; creneau: string; actif: boolean }
type Avis = { id: string; note: number; commentaire: string; created_at: string; eleves: { profiles: { prenom: string; nom: string } } }

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
const CRENEAUX = ["Matin", "Après-midi", "Soir"]

function Stars({ note, size = "sm" }: { note: number; size?: "sm" | "md" }) {
  const s = size === "md" ? "w-5 h-5" : "w-4 h-4"
  return (
    <div className="flex">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} className={`${s} ${i <= Math.round(note) ? "text-[#C9A84C]" : "text-border"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  )
}

export default function ProfilMoniteur() {
  const params = useParams()
  const id = params.id as string
  const [moniteur, setMoniteur] = useState<Moniteur | null>(null)
  const [dispos, setDispos] = useState<Dispo[]>([])
  const [avis, setAvis] = useState<Avis[]>([])
  const [loading, setLoading] = useState(true)
  const [creneauSelectionne, setCreneauSelectionne] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser()
      setIsConnected(!!user)

      // Load moniteur
      const { data: mon, error } = await supabase
        .from("moniteurs")
        .select("*, profiles(prenom, nom)")
        .eq("id", id)
        .single()

      if (error || !mon) { setLoading(false); return }
      setMoniteur(mon)

      // Load dispos
      const { data: d } = await supabase
        .from("disponibilites")
        .select("*")
        .eq("moniteur_id", id)
        .eq("actif", true)
      setDispos(d || [])

      // Load avis
      const { data: a } = await supabase
        .from("avis")
        .select("*, eleves(profiles(prenom, nom))")
        .eq("moniteur_id", id)
        .order("created_at", { ascending: false })
        .limit(5)
      setAvis(a || [])

      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  )

  if (!moniteur) return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div>
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-xl font-bold mb-2">Moniteur introuvable</h2>
        <p className="text-muted-foreground text-sm mb-4">Ce profil n'existe pas ou a été supprimé.</p>
        <Link href="/resultats" className="text-primary hover:underline text-sm">← Retour aux résultats</Link>
      </div>
    </div>
  )

  const joursDispos = [...new Set(dispos.map(d => d.jour_semaine))]

  return (
    <div className="font-sans text-foreground overflow-x-hidden min-h-screen">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-3 flex items-center justify-between bg-background/85 backdrop-blur-md border-b border-border">
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">Easy Drive</span>
            <span className="font-light text-foreground"> Drive</span>
          </span>
          <span className="text-[10px] font-black tracking-[0.15em] uppercase"
            style={{ background: "linear-gradient(135deg,#00F5A0,#00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            auto-école 2.0
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/resultats" className="text-muted-foreground text-sm hover:text-primary transition-colors">← Retour aux résultats</Link>
          {isConnected ? (
            <Link href="/dashboard" className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
              Mon espace
            </Link>
          ) : (
            <Link href="/connexion" className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
              Se connecter
            </Link>
          )}
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* COLONNE GAUCHE */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Carte identité */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex gap-5 items-start">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-background font-black text-2xl bg-gradient-to-br from-[#00F5A0] to-[#00D4FF] flex-shrink-0">
                  {moniteur.profiles?.prenom?.[0]}{moniteur.profiles?.nom?.[0]}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-xl font-bold">{moniteur.profiles?.prenom} {moniteur.profiles?.nom}</h1>
                    {moniteur.verifie && (
                      <span className="text-[11px] font-semibold text-[#00F5A0] border border-[#00F5A0]/30 bg-[#00F5A0]/10 px-2 py-0.5 rounded-full">✓ Diplôme vérifié</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Stars note={moniteur.note_moyenne} size="md" />
                    <span className="font-bold">{moniteur.note_moyenne?.toFixed(1) || "—"}</span>
                    <span className="text-sm text-muted-foreground">({moniteur.nb_avis} avis)</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>📍 {moniteur.zone} · {moniteur.rayon_km} km</span>
                    <span>🎓 {moniteur.diplome}</span>
                    <span>🚗 {moniteur.boite_auto ? "Boîte auto & manuelle" : "Boîte manuelle"}</span>
                  </div>
                </div>
              </div>
              {moniteur.bio && (
                <p className="mt-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-5">
                  {moniteur.bio}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Note moyenne", value: `${moniteur.note_moyenne?.toFixed(1) || "—"}★`, sub: `${moniteur.nb_avis} avis` },
                { label: "Rayon", value: `${moniteur.rayon_km} km`, sub: "autour de " + moniteur.zone },
                { label: "Tarif", value: `${moniteur.tarif_horaire}€`, sub: "par leçon 45 min" },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">{s.value}</div>
                  <div className="text-xs font-semibold mt-1">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Spécialités */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-base font-bold mb-4">Spécialités</h2>
              <div className="flex flex-wrap gap-2">
                {(moniteur.specialites || []).map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-full text-sm font-medium bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">{s}</span>
                ))}
              </div>
            </div>

            {/* Disponibilités */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-base font-bold mb-4">Disponibilités</h2>
              {dispos.length === 0 ? (
                <p className="text-muted-foreground text-sm">Ce moniteur n'a pas encore renseigné ses disponibilités.</p>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {JOURS.map((jour) => (
                    <div key={jour} className="flex flex-col gap-1.5">
                      <div className="text-xs font-bold text-center text-muted-foreground">{jour}</div>
                      {CRENEAUX.map((c) => {
                        const dispo = dispos.some(d => d.jour_semaine === jour && d.creneau === c)
                        const key = `${jour}-${c}`
                        return (
                          <button key={c} disabled={!dispo}
                            onClick={() => dispo && setCreneauSelectionne(key === creneauSelectionne ? null : key)}
                            className={`text-[10px] py-1.5 rounded-lg font-semibold transition-all ${
                              creneauSelectionne === key
                                ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background"
                                : dispo
                                ? "bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/20 hover:bg-[#00F5A0]/20 active:scale-95"
                                : "bg-card border border-border text-border cursor-not-allowed opacity-30"
                            }`}>
                            {c.slice(0, 3)}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
              {creneauSelectionne && (
                <p className="mt-4 text-xs text-[#00F5A0] font-semibold">✓ Créneau sélectionné : {creneauSelectionne.replace("-", " · ")}</p>
              )}
            </div>

            {/* Avis */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-base font-bold mb-5">Avis des élèves</h2>
              {avis.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucun avis pour l'instant — soyez le premier !</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {avis.map((a) => (
                    <div key={a.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00F5A0]/20 to-[#00D4FF]/20 border border-border flex items-center justify-center text-xs font-bold text-[#00D4FF]">
                            {a.eleves?.profiles?.prenom?.[0]}
                          </div>
                          <span className="text-sm font-semibold">{a.eleves?.profiles?.prenom} {a.eleves?.profiles?.nom?.[0]}.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stars note={a.note} />
                          <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{a.commentaire}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE — Réservation sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-2xl p-6 flex flex-col gap-5">
              <div className="text-center">
                <div className="text-3xl font-black">{moniteur.tarif_horaire}€</div>
                <div className="text-xs text-muted-foreground">/ leçon de 45 minutes</div>
              </div>

              <div className="bg-background/50 rounded-xl p-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diplôme</span>
                  <span className="font-semibold">{moniteur.diplome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Boîte</span>
                  <span className="font-semibold">{moniteur.boite_auto ? "Auto & Manuelle" : "Manuelle"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zone</span>
                  <span className="font-semibold">{moniteur.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rayon</span>
                  <span className="font-semibold">{moniteur.rayon_km} km</span>
                </div>
              </div>

              {isConnected ? (
                <Link href={`/reserver/${moniteur.id}`}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold text-center transition-all active:scale-95 bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 hover:shadow-[0_4px_20px_rgba(0,245,160,0.3)]`}>
                  Réserver une leçon
                </Link>
              ) : (
                <Link href="/connexion"
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-center bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
                  Se connecter pour réserver
                </Link>
              )}

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                Paiement sécurisé · Annulation gratuite 24h avant · Diplôme vérifié par Easy Drive
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
