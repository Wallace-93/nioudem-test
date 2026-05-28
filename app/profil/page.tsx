"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

type Profile = { id: string; prenom: string; nom: string; telephone: string; avatar_url: string | null }
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
}

const SPECIALITES_OPTIONS = [
  "Élèves anxieux",
  "Conduite accompagnée",
  "Autoroute",
  "Préparation examen",
  "Conduite de nuit",
  "Seniors",
  "Reprise après interruption",
  "Conduite en ville",
  "Boîte automatique",
  "Permis moto",
]

export default function ProfilEdition() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [moniteur, setMoniteur] = useState<Moniteur | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState("")
  const [saveMsg, setSaveMsg] = useState("")
  const [saveError, setSaveError] = useState("")
  const [activeTab, setActiveTab] = useState<"infos" | "specialites" | "apercu">("infos")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/connexion"); return }

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (!prof || prof.role !== "moniteur") { router.push("/dashboard"); return }
      setProfile(prof)

      const { data: mon } = await supabase.from("moniteurs").select("*").eq("user_id", user.id).single()
      setMoniteur(mon)
    } catch (e) {
      console.error("Load error:", e)
    } finally {
      setLoading(false)
    }
    }
    load()
  }, [])

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setPhotoError("Fichier trop lourd — max 2 MB"); return }
    setUploadingPhoto(true)
    setPhotoError("")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Upload dans Supabase Storage
    const ext = file.name.split(".").pop()
    const path = `avatars/${user.id}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setPhotoError("Erreur upload : " + uploadError.message)
      setUploadingPhoto(false)
      return
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path)
    const avatarUrl = urlData.publicUrl

    await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id)
    setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev)
    setUploadingPhoto(false)
  }

  async function handleSave() {
    if (!moniteur || !profile) return
    setSaving(true)
    setSaveMsg("")
    setSaveError("")

    // Save profile
    const { error: profError } = await supabase.from("profiles").update({
      prenom: profile.prenom,
      nom: profile.nom,
      telephone: profile.telephone,
    }).eq("id", profile.id)

    // Save moniteur
    const { error: monError } = await supabase.from("moniteurs").update({
      bio: moniteur.bio,
      tarif_horaire: moniteur.tarif_horaire,
      zone: moniteur.zone,
      rayon_km: moniteur.rayon_km,
      boite_auto: moniteur.boite_auto,
      specialites: moniteur.specialites,
    }).eq("id", moniteur.id)

    setSaving(false)

    if (profError || monError) {
      setSaveError("Erreur lors de la sauvegarde : " + (profError?.message || monError?.message))
    } else {
      setSaveMsg("Profil sauvegardé avec succès ✓")
      setTimeout(() => setSaveMsg(""), 4000)
    }
  }

  function toggleSpecialite(s: string) {
    if (!moniteur) return
    const current = moniteur.specialites || []
    setMoniteur({
      ...moniteur,
      specialites: current.includes(s)
        ? current.filter(x => x !== s)
        : [...current, s]
    })
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
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
          <span className="text-[10px] font-black tracking-[0.15em] uppercase"
            style={{ background: "linear-gradient(135deg,#00F5A0,#00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            auto-école 2.0
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/moniteur" className="text-muted-foreground text-sm hover:text-primary transition-colors">
            ← Mon dashboard
          </Link>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </nav>

      <div className="pt-20 pb-16 px-4 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8 pt-4">
          <h1 className="text-2xl font-black tracking-tight mb-1">Mon profil public</h1>
          <p className="text-muted-foreground text-sm">Ce que voient les élèves lorsqu'ils consultent votre profil.</p>
        </div>

        {/* Status vérification */}
        {!moniteur?.verifie && (
          <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-xl">⏳</span>
            <div>
              <div className="text-sm font-bold text-[#C9A84C]">Profil en attente de vérification</div>
              <div className="text-xs text-muted-foreground">Votre diplôme est en cours de validation. Votre profil sera visible sous 48h.</div>
            </div>
          </div>
        )}

        {/* Messages */}
        {saveMsg && (
          <div className="bg-[#00F5A0]/10 border border-[#00F5A0]/30 rounded-xl px-4 py-3 mb-5 text-sm text-[#00F5A0] font-semibold">
            ✓ {saveMsg}
          </div>
        )}
        {saveError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5 text-sm text-red-400">
            {saveError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mb-8 w-fit">
          {([
            ["infos", "📋 Informations"],
            ["specialites", "⭐ Spécialités"],
            ["apercu", "👁 Aperçu public"],
          ] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 whitespace-nowrap ${
                activeTab === tab
                  ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}>{label}</button>
          ))}
        </div>

        {/* INFORMATIONS */}
        {activeTab === "infos" && profile && moniteur && (
          <div className="flex flex-col gap-5">

            {/* Avatar */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-bold mb-4">Photo de profil</h2>
              <div className="flex items-center gap-5">
                <div className="relative">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Photo de profil"
                      className="w-20 h-20 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00F5A0] to-[#00D4FF] flex items-center justify-center text-background font-black text-2xl flex-shrink-0">
                      {profile.prenom?.[0]}{profile.nom?.[0]}
                    </div>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 rounded-2xl bg-background/70 flex items-center justify-center">
                      <svg className="w-6 h-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:border-primary hover:text-primary active:scale-95 transition-all inline-block">
                      📷 {profile.avatar_url ? "Changer la photo" : "Ajouter une photo"}
                    </div>
                    <input id="photo-upload" type="file" accept="image/jpeg,image/png,image/webp"
                      className="hidden" onChange={handlePhotoUpload} />
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG ou WebP · Max 2 MB</p>
                  {photoError && <p className="text-xs text-red-400 mt-1">{photoError}</p>}
                </div>
              </div>
            </div>

            {/* Identité */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-bold mb-4">Identité</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prenom" className="text-xs font-medium text-muted-foreground block mb-2">Prénom</label>
                  <input id="prenom" type="text" value={profile.prenom || ""} onChange={e => setProfile({ ...profile, prenom: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm transition-colors" />
                </div>
                <div>
                  <label htmlFor="nom" className="text-xs font-medium text-muted-foreground block mb-2">Nom</label>
                  <input id="nom" type="text" value={profile.nom || ""} onChange={e => setProfile({ ...profile, nom: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm transition-colors" />
                </div>
                <div>
                  <label htmlFor="telephone" className="text-xs font-medium text-muted-foreground block mb-2">Téléphone</label>
                  <input id="telephone" type="tel" value={profile.telephone || ""} onChange={e => setProfile({ ...profile, telephone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-2">Diplôme</label>
                  <input type="text" value={moniteur.diplome || ""} disabled
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-muted-foreground cursor-not-allowed" />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-bold mb-1">Bio / Présentation</h2>
              <p className="text-xs text-muted-foreground mb-4">Décrivez votre approche pédagogique, votre expérience, ce qui vous rend unique. Max 500 caractères.</p>
              <textarea
                value={moniteur.bio || ""}
                onChange={e => setMoniteur({ ...moniteur, bio: e.target.value.slice(0, 500) })}
                rows={5}
                placeholder="Ex : Moniteur indépendant depuis 6 ans, spécialisé dans l'accompagnement des élèves anxieux. Mon approche est bienveillante et progressive..."
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm transition-colors resize-none"
              />
              <div className="text-xs text-muted-foreground text-right mt-1">{(moniteur.bio || "").length}/500</div>
            </div>

            {/* Zone & Tarif */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-bold mb-4">Zone et tarif</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zone" className="text-xs font-medium text-muted-foreground block mb-2">Ville principale d'intervention</label>
                  <input id="zone" type="text" value={moniteur.zone || ""} onChange={e => setMoniteur({ ...moniteur, zone: e.target.value })}
                    placeholder="Ex: Paris 15e, Vincennes..."
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm transition-colors" />
                </div>
                <div>
                  <label htmlFor="rayon" className="text-xs font-medium text-muted-foreground block mb-2">Rayon d'intervention (km)</label>
                  <input id="rayon" type="number" min={5} max={50} value={moniteur.rayon_km || 15} onChange={e => setMoniteur({ ...moniteur, rayon_km: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm transition-colors" />
                </div>
                <div>
                  <label htmlFor="tarif" className="text-xs font-medium text-muted-foreground block mb-2">Tarif par leçon de 45 min (€)</label>
                  <input id="tarif" type="number" min={30} max={150} value={moniteur.tarif_horaire || 50} onChange={e => setMoniteur({ ...moniteur, tarif_horaire: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-2">Type de boîte proposée</label>
                  <div className="flex gap-2 mt-1">
                    {[{ label: "Manuelle", val: false }, { label: "Auto & Manuelle", val: true }].map(({ label, val }) => (
                      <button key={label} type="button" onClick={() => setMoniteur({ ...moniteur, boite_auto: val })}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 border ${
                          moniteur.boite_auto === val
                            ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background border-transparent"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}>{label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SPÉCIALITÉS */}
        {activeTab === "specialites" && moniteur && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-sm font-bold mb-2">Mes spécialités</h2>
            <p className="text-xs text-muted-foreground mb-6">Sélectionnez les domaines dans lesquels vous excellez. Cela améliore votre score de matching avec les élèves.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SPECIALITES_OPTIONS.map((s) => {
                const selected = (moniteur.specialites || []).includes(s)
                return (
                  <button key={s} onClick={() => toggleSpecialite(s)}
                    className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all active:scale-95 border ${
                      selected
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "bg-background border-border hover:border-primary/30 text-foreground"
                    }`}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selected ? "bg-primary border-primary" : "border-muted-foreground"
                    }`}>
                      {selected && (
                        <svg className="w-3 h-3 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{s}</span>
                  </button>
                )
              })}
            </div>
            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {(moniteur.specialites || []).length} spécialité{(moniteur.specialites || []).length > 1 ? "s" : ""} sélectionnée{(moniteur.specialites || []).length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {/* APERÇU PUBLIC */}
        {activeTab === "apercu" && profile && moniteur && (
          <div>
            <p className="text-xs text-muted-foreground mb-5 bg-card border border-border rounded-xl px-4 py-3">
              👁 Voici comment les élèves verront votre profil dans les résultats de recherche.
            </p>

            {/* Carte résultats */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-5">
              <div className="flex gap-4 flex-1 min-w-0 mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-background font-black text-xl bg-gradient-to-br from-[#00F5A0] to-[#00D4FF] flex-shrink-0">
                  {profile.prenom?.[0]}{profile.nom?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-bold">{profile.prenom} {profile.nom}</h3>
                    {moniteur.verifie && (
                      <span className="text-[10px] font-semibold text-[#00F5A0] border border-[#00F5A0]/30 bg-[#00F5A0]/10 px-2 py-0.5 rounded-full">✓ Diplôme vérifié</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(moniteur.note_moyenne || 0) ? "text-[#C9A84C]" : "text-border"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                    <span className="text-sm font-bold">{(moniteur.note_moyenne || 0).toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({moniteur.nb_avis || 0} avis)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(moniteur.specialites || []).slice(0, 3).map(s => (
                      <span key={s} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">{s}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>📍 {moniteur.zone || "Zone non renseignée"} · {moniteur.rayon_km} km</span>
                    <span>🚗 {moniteur.boite_auto ? "Boîte auto & manuelle" : "Boîte manuelle"}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <div className="text-xl font-extrabold">{moniteur.tarif_horaire}€</div>
                  <div className="text-[10px] text-muted-foreground">/ leçon 45 min</div>
                </div>
                <div className="flex gap-2">
                  <div className="px-4 py-2 rounded-xl text-sm font-semibold border border-border text-muted-foreground">Voir profil</div>
                  <div className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background">Réserver</div>
                </div>
              </div>
            </div>

            {/* Bio aperçu */}
            {moniteur.bio && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm font-bold mb-3">Présentation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{moniteur.bio}</p>
              </div>
            )}
          </div>
        )}

        {/* Bouton sauvegarder bas de page */}
        <div className="mt-8 flex items-center gap-4">
          <button onClick={handleSave} disabled={saving}
            className="px-8 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
            {saving ? "Sauvegarde en cours..." : "Sauvegarder les modifications"}
          </button>
          <Link href="/dashboard/moniteur" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Retour au dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
