"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { useRouter, useParams } from "next/navigation"

type Moniteur = {
  id: string
  diplome: string
  specialites: string[]
  tarif_horaire: number
  zone: string
  boite_auto: boolean
  bio: string
  note_moyenne: number
  nb_avis: number
  profiles: { prenom: string; nom: string }
}

type Dispo = { jour_semaine: string; creneau: string; actif: boolean }

const JOURS_COMPLETS: Record<string, string> = {
  Lun: "Lundi", Mar: "Mardi", Mer: "Mercredi",
  Jeu: "Jeudi", Ven: "Vendredi", Sam: "Samedi", Dim: "Dimanche"
}

function getProchainsDates(jour: string): Date[] {
  const jourIndex: Record<string, number> = { Lun: 1, Mar: 2, Mer: 3, Jeu: 4, Ven: 5, Sam: 6, Dim: 0 }
  const today = new Date()
  const dates: Date[] = []
  for (let i = 1; i <= 21; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    if (d.getDay() === jourIndex[jour]) dates.push(d)
  }
  return dates.slice(0, 3)
}

function heureFromCreneau(creneau: string): string {
  if (creneau === "Matin") return "09:00"
  if (creneau === "Après-midi") return "14:00"
  return "18:00"
}

export default function ReservationPage() {
  const params = useParams()
  const moniteurId = params.moniteurId as string
  const [moniteur, setMoniteur] = useState<Moniteur | null>(null)
  const [dispos, setDispos] = useState<Dispo[]>([])
  const [eleve, setEleve] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<"choix" | "confirmation" | "succes">("choix")
  const [selectedJour, setSelectedJour] = useState<string | null>(null)
  const [selectedCreneau, setSelectedCreneau] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [adresseRdv, setAdresseRdv] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/connexion"); return }

      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      if (prof?.role !== "eleve") { router.push("/dashboard"); return }

      const { data: elv } = await supabase.from("eleves").select("*").eq("user_id", user.id).single()
      setEleve(elv)

      const { data: mon } = await supabase
        .from("moniteurs").select("*, profiles(prenom, nom)")
        .eq("id", moniteurId).single()
      setMoniteur(mon)

      const { data: d } = await supabase
        .from("disponibilites").select("*")
        .eq("moniteur_id", moniteurId).eq("actif", true)
      setDispos(d || [])

      setLoading(false)
    }
    load()
  }, [moniteurId])

  async function confirmerReservation() {
    if (!selectedDate || !selectedCreneau || !eleve || !moniteur) return
    setSubmitting(true)
    setError(null)

    const dateHeure = new Date(selectedDate)
    const [h, m] = heureFromCreneau(selectedCreneau).split(":")
    dateHeure.setHours(parseInt(h), parseInt(m), 0, 0)

    const { error: resError } = await supabase.from("reservations").insert({
      eleve_id: eleve.id,
      moniteur_id: moniteur.id,
      date_heure: dateHeure.toISOString(),
      duree_minutes: 45,
      statut: "en_attente",
      montant: moniteur.tarif_horaire,
      commission: Math.round(moniteur.tarif_horaire * 0.15),
      adresse_rdv: adresseRdv || null,
    })

    if (resError) {
      setError("Erreur lors de la réservation : " + resError.message)
      setSubmitting(false)
      return
    }

    // Récupérer les emails pour les notifications
    const { data: userData } = await supabase.auth.getUser()
    const emailEleve = userData?.user?.email || ""

    const { data: moniteurProfile } = await supabase
      .from("profiles").select("id")
      .eq("id", moniteur.profiles ? (moniteur as any).user_id : "")
      .single()

    const { data: moniteurUser } = await supabase.auth.admin?.getUserById?.((moniteur as any).user_id)
    const emailMoniteur = (moniteurUser as any)?.data?.user?.email || ""

    // Envoyer emails en parallèle
    const emailData = {
      prenomEleve: eleve.profiles?.prenom || "",
      nomEleve: eleve.profiles?.nom || "",
      prenomMoniteur: moniteur.profiles?.prenom || "",
      nomMoniteur: moniteur.profiles?.nom || "",
      dateHeure: dateHeure.toISOString(),
      zone: moniteur.zone,
      montant: moniteur.tarif_horaire,
      adresseRdv: adresseRdv || undefined,
    }

    await Promise.allSettled([
      fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "reservation_eleve",
          data: { ...emailData, emailEleve },
        }),
      }),
      emailMoniteur && fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "nouvelle_demande_moniteur",
          data: { ...emailData, emailMoniteur },
        }),
      }),
    ])

    setSubmitting(false)
    setStep("succes")
  }

  const joursDispos = [...new Set(dispos.map(d => d.jour_semaine))]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  )

  if (!moniteur) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-muted-foreground">Moniteur introuvable.</p>
        <Link href="/resultats" className="mt-4 inline-block text-primary hover:underline text-sm">← Retour aux résultats</Link>
      </div>
    </div>
  )

  return (
    <div className="font-sans text-foreground min-h-screen">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-3 flex items-center justify-between bg-background/85 backdrop-blur-md border-b border-border">
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">Easy Drive</span>
            <span className="font-light"> Drive</span>
          </span>
          <span className="text-[10px] font-black tracking-[0.15em] uppercase" style={{ background: "linear-gradient(135deg,#00F5A0,#00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>auto-école 2.0</span>
        </Link>
        <Link href="/resultats" className="text-muted-foreground text-sm hover:text-primary transition-colors">← Retour aux résultats</Link>
      </nav>

      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">

        {/* Page succès */}
        {step === "succes" && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00F5A0] to-[#00D4FF] flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-3">
              Demande envoyée{" "}
              <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">!</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-2 max-w-md mx-auto">
              Votre demande de réservation a été transmise à <strong className="text-foreground">{moniteur.profiles?.prenom} {moniteur.profiles?.nom}</strong>.
            </p>
            <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
              Le moniteur dispose de <strong className="text-foreground">24h</strong> pour confirmer ou refuser. Vous serez notifié dès sa réponse.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/dashboard/eleve" className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
                Voir mes réservations →
              </Link>
              <Link href="/resultats" className="px-6 py-3 rounded-xl text-sm font-semibold border border-border hover:border-primary hover:text-primary active:scale-95 transition-all">
                Chercher un autre moniteur
              </Link>
            </div>
          </div>
        )}

        {/* Choix créneau */}
        {step === "choix" && (
          <>
            {/* Carte moniteur */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-8 flex gap-4 items-start">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00F5A0] to-[#00D4FF] flex items-center justify-center text-background font-black text-lg flex-shrink-0">
                {moniteur.profiles?.prenom?.[0]}{moniteur.profiles?.nom?.[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold">{moniteur.profiles?.prenom} {moniteur.profiles?.nom}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>⭐ {moniteur.note_moyenne?.toFixed(1)} ({moniteur.nb_avis} avis)</span>
                  <span>·</span>
                  <span>📍 {moniteur.zone}</span>
                  <span>·</span>
                  <span>{moniteur.diplome}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(moniteur.specialites || []).slice(0, 3).map(s => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-black">{moniteur.tarif_horaire}€</div>
                <div className="text-xs text-muted-foreground">/ 45 min</div>
              </div>
            </div>

            <h1 className="text-2xl font-black tracking-tight mb-6">Choisissez un créneau</h1>

            {joursDispos.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="text-lg font-bold mb-2">Aucun créneau disponible</h3>
                <p className="text-muted-foreground text-sm mb-4">Ce moniteur n'a pas encore renseigné ses disponibilités.</p>
                <Link href="/resultats" className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
                  Voir d'autres moniteurs
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {joursDispos.map((jour) => {
                  const creneauxDuJour = dispos.filter(d => d.jour_semaine === jour).map(d => d.creneau)
                  const dates = getProchainsDates(jour)
                  return (
                    <div key={jour} className="bg-card border border-border rounded-2xl p-5">
                      <div className="font-bold text-sm mb-4">{JOURS_COMPLETS[jour]}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {dates.map((date) => (
                          creneauxDuJour.map((creneau) => {
                            const isSelected = selectedDate?.toDateString() === date.toDateString() && selectedCreneau === creneau
                            return (
                              <button
                                key={`${date.toISOString()}-${creneau}`}
                                onClick={() => { setSelectedJour(jour); setSelectedCreneau(creneau); setSelectedDate(date) }}
                                className={`p-4 rounded-xl text-left transition-all active:scale-95 border ${
                                  isSelected
                                    ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background border-transparent"
                                    : "border-border hover:border-primary/50 bg-background/50"
                                }`}
                              >
                                <div className="font-bold text-sm">
                                  {date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                                </div>
                                <div className={`text-xs mt-0.5 ${isSelected ? "text-background/70" : "text-muted-foreground"}`}>
                                  {creneau} · {heureFromCreneau(creneau)}
                                </div>
                              </button>
                            )
                          })
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {selectedDate && selectedCreneau && (
              <div className="mt-8 sticky bottom-4">
                <div className="bg-card border border-[#00F5A0]/30 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-lg">
                  <div>
                    <div className="font-bold text-sm">
                      {selectedDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} · {selectedCreneau}
                    </div>
                    <div className="text-xs text-muted-foreground">avec {moniteur.profiles?.prenom} {moniteur.profiles?.nom} · {heureFromCreneau(selectedCreneau)}</div>
                  </div>
                  <button onClick={() => setStep("confirmation")}
                    className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all whitespace-nowrap">
                    Confirmer →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Confirmation */}
        {step === "confirmation" && selectedDate && selectedCreneau && (
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-black tracking-tight mb-6">Confirmer la réservation</h1>

            {/* Adresse de rendez-vous */}
            <div className="bg-card border border-border rounded-2xl p-5 mb-5">
              <label className="text-sm font-bold block mb-2">📍 Point de rendez-vous <span className="text-muted-foreground font-normal">(optionnel)</span></label>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Par défaut, la leçon démarre depuis votre zone de recherche. Vous pouvez indiquer une adresse différente — le moniteur vérifiera que c'est dans son rayon.
              </p>
              <input
                type="text"
                id="adresse-rdv"
                name="adresse-rdv"
                value={adresseRdv}
                onChange={(e) => setAdresseRdv(e.target.value)}
                placeholder="Ex: 15 rue de la Paix, Paris 2e"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm transition-colors"
                autoComplete="street-address"
              />
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 mb-6 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-sm text-muted-foreground">Moniteur</span>
                <span className="font-semibold text-sm">{moniteur.profiles?.prenom} {moniteur.profiles?.nom}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="font-semibold text-sm">
                  {selectedDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-sm text-muted-foreground">Créneau</span>
                <span className="font-semibold text-sm">{selectedCreneau} · {heureFromCreneau(selectedCreneau)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-sm text-muted-foreground">Durée</span>
                <span className="font-semibold text-sm">45 minutes</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-sm text-muted-foreground">Zone moniteur</span>
                <span className="font-semibold text-sm">{moniteur.zone}</span>
              </div>
              {adresseRdv && (
                <div className="flex justify-between items-start pb-4 border-b border-border gap-4">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Point de RDV</span>
                  <span className="font-semibold text-sm text-right">{adresseRdv}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-base font-bold">Total</span>
                <span className="text-2xl font-black bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">
                  {moniteur.tarif_horaire}€
                </span>
              </div>
            </div>

            <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-xl p-4 mb-6 text-xs text-muted-foreground leading-relaxed">
              ⚠️ Le paiement sera demandé après confirmation par le moniteur. Annulation gratuite jusqu'à 24h avant la leçon.
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep("choix")}
                className="flex-1 py-3.5 rounded-xl text-sm font-semibold border border-border hover:border-primary hover:text-primary active:scale-95 transition-all">
                Modifier
              </button>
              <button onClick={confirmerReservation} disabled={submitting}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Envoi...
                  </>
                ) : "Envoyer la demande"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
