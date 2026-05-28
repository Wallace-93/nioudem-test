"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

type Reservation = {
  id: string
  date_heure: string
  montant: number
  moniteurs: {
    id: string
    profiles: { prenom: string; nom: string }
  }
}

function AvisForm() {
  const searchParams = useSearchParams()
  const reservationId = searchParams.get("reservation")
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [note, setNote] = useState(0)
  const [hover, setHover] = useState(0)
  const [commentaire, setCommentaire] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dejaNote, setDejaNote] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/connexion"); return }

      if (!reservationId) {
        // Charger toutes les réservations terminées sans avis
        const { data: eleve } = await supabase
          .from("eleves").select("id").eq("user_id", user.id).single()

        if (!eleve) { setLoading(false); return }

        const { data: res } = await supabase
          .from("reservations")
          .select("id, date_heure, montant, moniteurs(id, profiles(prenom, nom))")
          .eq("eleve_id", eleve.id)
          .eq("statut", "termine")
          .order("date_heure", { ascending: false })
          .limit(1)
          .single()

        if (res) {
          // Vérifier si déjà noté
          const { data: existingAvis } = await supabase
            .from("avis").select("id").eq("reservation_id", res.id).single()
          if (existingAvis) { setDejaNote(true) }
          setReservation(res as any)
        }
      } else {
        const { data: res } = await supabase
          .from("reservations")
          .select("id, date_heure, montant, moniteurs(id, profiles(prenom, nom))")
          .eq("id", reservationId)
          .single()

        if (res) {
          const { data: existingAvis } = await supabase
            .from("avis").select("id").eq("reservation_id", reservationId).single()
          if (existingAvis) setDejaNote(true)
          setReservation(res as any)
        }
      }
      setLoading(false)
    }
    load()
  }, [reservationId])

  async function submitAvis() {
    if (!note || !reservation) return
    setSubmitting(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/connexion"); return }

    const { data: eleve } = await supabase
      .from("eleves").select("id").eq("user_id", user.id).single()

    const { error: avisError } = await supabase.from("avis").insert({
      reservation_id: reservation.id,
      moniteur_id: reservation.moniteurs.id,
      eleve_id: eleve?.id,
      note,
      commentaire: commentaire.trim() || null,
    })

    if (avisError) {
      setError("Erreur : " + avisError.message)
      setSubmitting(false)
      return
    }

    // Marquer la réservation comme terminée avec avis
    setSuccess(true)
    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  )

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00F5A0] to-[#00D4FF] flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-black mb-3">Merci pour votre avis !</h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          Votre avis aide les autres élèves à choisir le bon moniteur. {note >= 4 ? "Ravi que vous ayez passé une bonne leçon 🎉" : "Merci pour votre retour honnête."}
        </p>
        <Link href="/dashboard/eleve" className="inline-block px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
          Retour à mon espace →
        </Link>
      </div>
    </div>
  )

  if (!reservation) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-4xl mb-4">📋</div>
        <h2 className="text-lg font-bold mb-2">Aucune leçon à noter</h2>
        <p className="text-muted-foreground text-sm mb-4">Vous n'avez pas encore de leçon terminée à évaluer.</p>
        <Link href="/dashboard/eleve" className="text-primary hover:underline text-sm">← Retour au dashboard</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F5A0] to-[#00D4FF] flex items-center justify-center mx-auto mb-4 text-background font-black text-xl">
            {reservation.moniteurs?.profiles?.prenom?.[0]}{reservation.moniteurs?.profiles?.nom?.[0]}
          </div>
          <h1 className="text-2xl font-black mb-1">Évaluez votre leçon</h1>
          <p className="text-muted-foreground text-sm">
            avec <strong className="text-foreground">{reservation.moniteurs?.profiles?.prenom} {reservation.moniteurs?.profiles?.nom}</strong>
            {" · "}{new Date(reservation.date_heure).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
          </p>
        </div>

        {dejaNote ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="text-3xl mb-3">✅</div>
            <p className="text-muted-foreground text-sm">Vous avez déjà noté cette leçon.</p>
            <Link href="/dashboard/eleve" className="mt-4 inline-block text-primary hover:underline text-sm">← Retour au dashboard</Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-8 flex flex-col gap-6">

            {/* Étoiles */}
            <div>
              <label className="text-sm font-bold block mb-4 text-center">Votre note</label>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s}
                    onClick={() => setNote(s)}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-all active:scale-90">
                    <svg
                      className={`w-10 h-10 transition-all ${
                        s <= (hover || note) ? "text-[#C9A84C] scale-110" : "text-border"
                      }`}
                      fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </button>
                ))}
              </div>
              {note > 0 && (
                <p className="text-center text-sm font-semibold mt-3" style={{ color: note >= 4 ? "#00F5A0" : note >= 3 ? "#C9A84C" : "#ef4444" }}>
                  {note === 5 ? "Excellent !" : note === 4 ? "Très bien" : note === 3 ? "Bien" : note === 2 ? "Moyen" : "Décevant"}
                </p>
              )}
            </div>

            {/* Commentaire */}
            <div>
              <label htmlFor="commentaire" className="text-sm font-bold block mb-2">
                Commentaire <span className="text-muted-foreground font-normal">(optionnel)</span>
              </label>
              <textarea
                id="commentaire"
                value={commentaire}
                onChange={e => setCommentaire(e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Décrivez votre expérience : la pédagogie, la ponctualité, l'ambiance de la leçon..."
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm transition-colors resize-none"
              />
              <div className="text-xs text-muted-foreground text-right mt-1">{commentaire.length}/500</div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button onClick={submitAvis} disabled={!note || submitting}
              className="w-full py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Envoi...
                </>
              ) : "Publier mon avis"}
            </button>

            <p className="text-[11px] text-muted-foreground text-center">
              Votre avis sera visible sur le profil public du moniteur après validation.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AvisPage() {
  return (
    <div className="font-sans text-foreground min-h-screen">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-3 flex items-center justify-between bg-background/85 backdrop-blur-md border-b border-border">
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">Easy Drive</span>
            <span className="font-light"> Drive</span>
          </span>
          <span className="text-[10px] font-black tracking-[0.15em] uppercase"
            style={{ background: "linear-gradient(135deg,#00F5A0,#00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            auto-école 2.0
          </span>
        </Link>
        <Link href="/dashboard/eleve" className="text-muted-foreground text-sm hover:text-primary transition-colors">
          ← Mon espace
        </Link>
      </nav>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>}>
        <AvisForm />
      </Suspense>
    </div>
  )
}
