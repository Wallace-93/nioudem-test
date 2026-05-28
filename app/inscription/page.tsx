"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import Link from "next/link"

type FormData = {
  prenom: string
  nom: string
  email: string
  telephone: string
  password: string
  confirmPassword: string
  niveau: string
  typePermis: string
  boiteVitesses: string
  specialites: string[]
  budget: number
  zone: string
  rayon: string
  creneaux: string[]
}

const niveaux = [
  { value: "debutant", label: "Débutant complet" },
  { value: "quelques-lecons", label: "Quelques leçons déjà faites" },
  { value: "reprise", label: "Reprise après interruption" },
  { value: "echec-examen", label: "Échec à l'examen" },
]

const typesPermis = [
  { value: "B", label: "B — Voiture" },
  { value: "A", label: "A — Moto" },
  { value: "BE", label: "BE — Remorque" },
]

const boitesVitesses = [
  { value: "manuelle", label: "Manuelle" },
  { value: "automatique", label: "Automatique" },
  { value: "indifferent", label: "Indifférent" },
]

const specialitesOptions = [
  { value: "anxieux", label: "Élève anxieux" },
  { value: "accompagnee", label: "Conduite accompagnée" },
  { value: "autoroute", label: "Conduite sur autoroute" },
  { value: "examen", label: "Préparation examen" },
  { value: "nuit", label: "Conduite de nuit" },
  { value: "seniors", label: "Seniors" },
]

const rayons = [
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "15", label: "15 km" },
  { value: "20+", label: "20 km+" },
]

const creneauxOptions = [
  { value: "matin-semaine", label: "Matin semaine" },
  { value: "aprem-semaine", label: "Après-midi semaine" },
  { value: "soir-semaine", label: "Soir semaine" },
  { value: "samedi", label: "Samedi" },
  { value: "dimanche", label: "Dimanche" },
]

export default function InscriptionPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<FormData>({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
    niveau: "",
    typePermis: "",
    boiteVitesses: "",
    specialites: [],
    budget: 50,
    zone: "",
    rayon: "",
    creneaux: [],
  })

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => { const e = { ...prev }; delete e[field]; return e })
    }
  }

  const toggleArrayField = (field: "specialites" | "creneaux", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }))
  }

  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!formData.prenom.trim()) e.prenom = "Prénom requis"
    if (!formData.nom.trim()) e.nom = "Nom requis"
    if (!formData.email.trim()) e.email = "Email requis"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Email invalide"
    if (!formData.telephone.trim()) e.telephone = "Téléphone requis"
    if (!formData.password) e.password = "Mot de passe requis"
    else if (formData.password.length < 8) e.password = "Minimum 8 caractères"
    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Les mots de passe ne correspondent pas"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    const e: Record<string, string> = {}
    if (!formData.niveau) e.niveau = "Sélectionnez votre niveau"
    if (!formData.typePermis) e.typePermis = "Sélectionnez un type de permis"
    if (!formData.boiteVitesses) e.boiteVitesses = "Sélectionnez une préférence"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep3 = () => {
    const e: Record<string, string> = {}
    if (!formData.zone.trim()) e.zone = "Entrez une ville ou code postal"
    if (!formData.rayon) e.rayon = "Sélectionnez un rayon"
    if (formData.creneaux.length === 0) e.creneaux = "Sélectionnez au moins un créneau"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
  }

  const handlePrevious = () => { if (step > 1) setStep(step - 1) }

  const handleSubmit = async () => {
    if (!validateStep3()) return
    setLoading(true)
    setError(null)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (authError || !authData.user) {
      const msg = authError?.message || ""
      const code = (authError as any)?.code || ""
      console.error("Auth error:", authError)
      if (msg.includes("already registered") || msg.includes("already exists") || code === "user_already_exists") {
        setError("Un compte existe déjà avec cet email. Connectez-vous ou utilisez un autre email.")
      } else if (msg.includes("password") || code === "weak_password") {
        setError("Mot de passe invalide — minimum 8 caractères.")
      } else if (msg.includes("email") || code === "invalid_email") {
        setError("Adresse email invalide.")
      } else if (msg.includes("rate limit") || code === "over_email_send_rate_limit") {
        setError("Trop de tentatives. Attendez quelques minutes avant de réessayer.")
      } else {
        setError(`Erreur : ${msg || JSON.stringify(authError) || "inconnue"}. Vérifiez vos informations et réessayez.`)
      }
      setLoading(false)
      return
    }

    const userId = authData.user.id

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      role: "eleve",
      prenom: formData.prenom,
      nom: formData.nom,
      telephone: formData.telephone,
    })

    if (profileError) {
      setError("Compte créé mais erreur profil : " + profileError.message + ". Contactez le support.")
      setLoading(false)
      return
    }

    const { error: eleveError } = await supabase.from("eleves").insert({
      user_id: userId,
      niveau: formData.niveau,
      type_permis: formData.typePermis,
      zone_recherche: formData.zone,
      budget_max: formData.budget,
      specialites: formData.specialites,
      creneaux: formData.creneaux,
    })

    if (eleveError) {
      setError("Compte créé mais erreur données : " + eleveError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setSuccess(true)
  }

  const steps = [
    { num: 1, label: "Informations" },
    { num: 2, label: "Vos besoins" },
    { num: 3, label: "Disponibilités" },
  ]

  // Page de succès
  if (success) {
    return (
      <div className="font-sans text-foreground min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00F5A0] to-[#00D4FF] flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-3">
              Bienvenue sur{" "}
              <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">
                Easy Drive !
              </span>
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-2">
              Votre inscription a bien été prise en compte, <strong className="text-foreground">{formData.prenom}</strong>.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Notre équipe va analyser votre profil et vous recontacter très prochainement à l'adresse <strong className="text-foreground">{formData.email}</strong> avec une sélection de moniteurs compatibles.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/resultats"
                className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all"
              >
                Voir les moniteurs maintenant
              </Link>
              <Link
                href="/"
                className="px-6 py-3 rounded-xl text-sm font-semibold border border-border hover:border-primary hover:text-primary active:scale-95 transition-all"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="font-sans text-foreground min-h-screen">
      <Navbar />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,245,160,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_50%,rgba(0,212,255,0.06)_0%,transparent_60%)]" />
      </div>

      <main className="relative z-10 pt-32 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
              Inscription{" "}
              <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">élève</span>
            </h1>
            <p className="text-muted-foreground">Trouvez le moniteur idéal en quelques étapes</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step === s.num
                      ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background"
                      : step > s.num
                      ? "bg-primary/20 text-primary border-2 border-primary"
                      : "bg-card border-2 border-border text-muted-foreground"
                  }`}>
                    {step > s.num ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : s.num}
                  </div>
                  <span className={`text-xs mt-2 hidden sm:block ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className={`w-16 md:w-24 h-0.5 mx-2 ${step > s.num ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 md:p-10">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold mb-6">Informations personnelles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prenom" className="block text-sm font-medium mb-2">Prénom</label>
                    <input id="prenom" name="prenom" type="text" value={formData.prenom} onChange={(e) => updateField("prenom", e.target.value)} autoComplete="given-name"
                      className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.prenom ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none transition-colors`}
                      placeholder="Jean" />
                    {errors.prenom && <p className="text-destructive text-xs mt-1">{errors.prenom}</p>}
                  </div>
                  <div>
                    <label htmlFor="nom" className="block text-sm font-medium mb-2">Nom</label>
                    <input id="nom" name="nom" type="text" value={formData.nom} onChange={(e) => updateField("nom", e.target.value)} autoComplete="family-name"
                      className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.nom ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none transition-colors`}
                      placeholder="Dupont" />
                    {errors.nom && <p className="text-destructive text-xs mt-1">{errors.nom}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                  <input id="email" name="email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} autoComplete="email"
                    className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.email ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none transition-colors`}
                    placeholder="jean.dupont@email.com" />
                  {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium mb-2">Téléphone</label>
                  <input id="telephone" name="telephone" type="tel" value={formData.telephone} onChange={(e) => updateField("telephone", e.target.value)} autoComplete="tel"
                    className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.telephone ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none transition-colors`}
                    placeholder="06 12 34 56 78" />
                  {errors.telephone && <p className="text-destructive text-xs mt-1">{errors.telephone}</p>}
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">Mot de passe</label>
                  <input id="password" name="password" type="password" value={formData.password} onChange={(e) => updateField("password", e.target.value)} autoComplete="new-password"
                    className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.password ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none transition-colors`}
                    placeholder="Minimum 8 caractères" />
                  {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
                  <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} autoComplete="new-password"
                    className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.confirmPassword ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none transition-colors`}
                    placeholder="Répétez votre mot de passe" />
                  {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-8">
                <h2 className="text-xl font-bold mb-6">Vos besoins</h2>
                <div>
                  <label className="block text-sm font-medium mb-3">Niveau actuel</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {niveaux.map((n) => (
                      <button key={n.value} type="button" onClick={() => updateField("niveau", n.value)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all active:scale-95 ${
                          formData.niveau === n.value
                            ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background"
                            : "bg-background border border-border hover:border-primary/50"
                        }`}>{n.label}</button>
                    ))}
                  </div>
                  {errors.niveau && <p className="text-destructive text-xs mt-2">{errors.niveau}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">Type de permis souhaité</label>
                  <div className="flex flex-wrap gap-3">
                    {typesPermis.map((t) => (
                      <button key={t.value} type="button" onClick={() => updateField("typePermis", t.value)}
                        className={`px-5 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                          formData.typePermis === t.value
                            ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background"
                            : "bg-background border border-border hover:border-primary/50"
                        }`}>{t.label}</button>
                    ))}
                  </div>
                  {errors.typePermis && <p className="text-destructive text-xs mt-2">{errors.typePermis}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">Boîte de vitesses préférée</label>
                  <div className="flex flex-wrap gap-3">
                    {boitesVitesses.map((b) => (
                      <button key={b.value} type="button" onClick={() => updateField("boiteVitesses", b.value)}
                        className={`px-5 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                          formData.boiteVitesses === b.value
                            ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background"
                            : "bg-background border border-border hover:border-primary/50"
                        }`}>{b.label}</button>
                    ))}
                  </div>
                  {errors.boiteVitesses && <p className="text-destructive text-xs mt-2">{errors.boiteVitesses}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">Spécialités recherchées</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {specialitesOptions.map((s) => (
                      <button key={s.value} type="button" onClick={() => toggleArrayField("specialites", s.value)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all active:scale-95 flex items-center gap-2 ${
                          formData.specialites.includes(s.value)
                            ? "bg-primary/20 border-2 border-primary text-primary"
                            : "bg-background border border-border hover:border-primary/50"
                        }`}>
                        <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                          formData.specialites.includes(s.value) ? "bg-primary border-primary" : "border-muted-foreground"
                        }`}>
                          {formData.specialites.includes(s.value) && (
                            <svg className="w-3 h-3 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Budget par leçon : <span className="text-primary font-bold">{formData.budget}€</span>
                  </label>
                  <input type="range" min="30" max="90" value={formData.budget}
                    onChange={(e) => updateField("budget", parseInt(e.target.value))}
                    className="w-full accent-[#00F5A0]" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>30€</span><span>90€</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-8">
                <h2 className="text-xl font-bold mb-6">Disponibilités et zone</h2>
                <div>
                  <label htmlFor="zone" className="block text-sm font-medium mb-2">Zone de conduite</label>
                  <input id="zone" name="zone" type="text" value={formData.zone} onChange={(e) => updateField("zone", e.target.value)} autoComplete="address-level2"
                    className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.zone ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none transition-colors`}
                    placeholder="Ville ou code postal (ex: Paris, 75001)" />
                  {errors.zone && <p className="text-destructive text-xs mt-1">{errors.zone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">Rayon maximum</label>
                  <div className="flex flex-wrap gap-3">
                    {rayons.map((r) => (
                      <button key={r.value} type="button" onClick={() => updateField("rayon", r.value)}
                        className={`px-5 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                          formData.rayon === r.value
                            ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background"
                            : "bg-background border border-border hover:border-primary/50"
                        }`}>{r.label}</button>
                    ))}
                  </div>
                  {errors.rayon && <p className="text-destructive text-xs mt-2">{errors.rayon}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">Créneaux souhaités</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {creneauxOptions.map((c) => (
                      <button key={c.value} type="button" onClick={() => toggleArrayField("creneaux", c.value)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all active:scale-95 flex items-center gap-2 ${
                          formData.creneaux.includes(c.value)
                            ? "bg-primary/20 border-2 border-primary text-primary"
                            : "bg-background border border-border hover:border-primary/50"
                        }`}>
                        <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                          formData.creneaux.includes(c.value) ? "bg-primary border-primary" : "border-muted-foreground"
                        }`}>
                          {formData.creneaux.includes(c.value) && (
                            <svg className="w-3 h-3 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {c.label}
                      </button>
                    ))}
                  </div>
                  {errors.creneaux && <p className="text-destructive text-xs mt-2">{errors.creneaux}</p>}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4 mt-10">
              {step > 1 && (
                <button type="button" onClick={handlePrevious}
                  className="flex-1 px-6 py-3.5 rounded-xl text-sm font-semibold border border-border hover:border-primary hover:text-primary active:scale-95 transition-all">
                  Précédent
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={handleNext}
                  className="flex-1 px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 hover:-translate-y-0.5 transition-all">
                  Suivant
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={loading}
                  className="flex-1 px-6 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Inscription en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Trouver mon moniteur
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Déjà inscrit ?{" "}
            <Link href="/connexion" className="text-primary hover:underline font-semibold">Se connecter</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
