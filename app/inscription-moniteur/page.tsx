"use client"

export const dynamic = "force-dynamic"

import { useState, useRef } from "react"
import { Navbar } from "@/components/navbar"
import Image from "next/image"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import Link from "next/link"

type FormData = {
  // Step 1
  prenom: string
  nom: string
  email: string
  telephone: string
  password: string
  confirmPassword: string
  photo: string | null
  // Step 2
  diplome: string
  justificatif: File | null
  experience: string
  specialites: string[]
  typesPermis: string[]
  boiteVitesses: string
  tarif: number
  // Step 3
  ville: string
  rayon: string
  disponibilites: string[]
  statut: string
}

const diplomes = [
  { value: "bepecaser", label: "BEPECASER" },
  { value: "ecsr", label: "Titre Professionnel ECSR" },
  { value: "europeen", label: "Equivalent europeen" },
]

const experiences = [
  { value: "moins-2", label: "Moins de 2 ans" },
  { value: "2-5", label: "2 a 5 ans" },
  { value: "5-10", label: "5 a 10 ans" },
  { value: "plus-10", label: "Plus de 10 ans" },
]

const specialitesOptions = [
  { value: "anxieux", label: "Eleves anxieux" },
  { value: "accompagnee", label: "Conduite accompagnee" },
  { value: "autoroute", label: "Conduite sur autoroute" },
  { value: "examen", label: "Preparation examen" },
  { value: "nuit", label: "Conduite de nuit" },
  { value: "seniors", label: "Seniors" },
  { value: "moto", label: "Permis moto" },
  { value: "ville", label: "Conduite en ville" },
]

const typesPermisOptions = [
  { value: "B", label: "Permis B" },
  { value: "A", label: "Permis A" },
  { value: "BE", label: "Permis BE" },
  { value: "C", label: "Permis C" },
]

const boitesVitesses = [
  { value: "manuelle", label: "Manuelle" },
  { value: "automatique", label: "Automatique" },
  { value: "les-deux", label: "Les deux" },
]

const rayons = [
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "15", label: "15 km" },
  { value: "20+", label: "20 km+" },
]

const statuts = [
  { value: "independant", label: "Independant" },
  { value: "salarie", label: "Salarie auto-ecole" },
  { value: "les-deux", label: "Les deux" },
]

const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
const creneaux = ["Matin", "Apres-midi", "Soir"]

export default function InscriptionMoniteurPage() {
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [justificatifName, setJustificatifName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const justificatifInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<FormData>({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
    photo: null,
    diplome: "",
    justificatif: null,
    experience: "",
    specialites: [],
    typesPermis: [],
    boiteVitesses: "",
    tarif: 50,
    ville: "",
    rayon: "",
    disponibilites: [],
    statut: "",
  })

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const toggleArrayField = (field: "specialites" | "typesPermis" | "disponibilites", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
        updateField("photo", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleJustificatifDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setJustificatifName(file.name)
      updateField("justificatif", file)
    }
  }

  const handleJustificatifChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setJustificatifName(file.name)
      updateField("justificatif", file)
    }
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.prenom.trim()) newErrors.prenom = "Prenom requis"
    if (!formData.nom.trim()) newErrors.nom = "Nom requis"
    if (!formData.email.trim()) newErrors.email = "Email requis"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email invalide"
    if (!formData.telephone.trim()) newErrors.telephone = "Telephone requis"
    if (!formData.password) newErrors.password = "Mot de passe requis"
    else if (formData.password.length < 8) newErrors.password = "Minimum 8 caracteres"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.diplome) newErrors.diplome = "Selectionnez votre diplome"
    if (!formData.experience) newErrors.experience = "Selectionnez votre experience"
    if (formData.typesPermis.length === 0) newErrors.typesPermis = "Selectionnez au moins un type de permis"
    if (!formData.boiteVitesses) newErrors.boiteVitesses = "Selectionnez une option"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.ville.trim()) newErrors.ville = "Entrez votre ville principale"
    if (!formData.rayon) newErrors.rayon = "Selectionnez un rayon"
    if (formData.disponibilites.length === 0) newErrors.disponibilites = "Selectionnez au moins une disponibilite"
    if (!formData.statut) newErrors.statut = "Selectionnez votre statut"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

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
      if (msg.includes("already registered") || msg.includes("already exists")) {
        setError("Un compte existe déjà avec cet email. Connectez-vous ou utilisez un autre email.")
      } else if (msg.includes("password")) {
        setError("Mot de passe invalide — minimum 8 caractères.")
      } else if (msg.includes("email")) {
        setError("Adresse email invalide.")
      } else {
        setError("Erreur lors de la création du compte : " + (authError?.message || "erreur inconnue"))
      }
      setLoading(false)
      return
    }

    const userId = authData.user.id

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      role: "moniteur",
      prenom: formData.prenom,
      nom: formData.nom,
      telephone: formData.telephone,
    })

    if (profileError) {
      setError("Compte créé mais erreur profil : " + profileError.message + ". Contactez le support.")
      setLoading(false)
      return
    }

    const { error: moniteurError } = await supabase.from("moniteurs").insert({
      user_id: userId,
      diplome: formData.diplome,
      specialites: formData.specialites,
      tarif_horaire: formData.tarif,
      zone: formData.ville,
      rayon_km: parseInt(formData.rayon) || 15,
      boite_auto: formData.boiteVitesses === "automatique" || formData.boiteVitesses === "les-deux",
      verifie: false,
    })

    if (moniteurError) {
      setError("Compte créé mais erreur profil moniteur : " + moniteurError.message)
      setLoading(false)
      return
    }

    // Notifier l'admin
    fetch("/api/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "nouveau_moniteur_admin",
        data: {
          emailAdmin: "fallies.project@gmail.com",
          prenomMoniteur: formData.prenom,
          nomMoniteur: formData.nom,
          diplome: formData.diplome,
          zone: formData.ville,
          telephone: formData.telephone,
          adminUrl: "https://easy-drive.onrender.com/admin",
        }
      })
    })

    setLoading(false)
    setSuccess(true)
  }

  const steps = [
    { num: 1, label: "Informations personnelles" },
    { num: 2, label: "Profil professionnel" },
    { num: 3, label: "Zone et disponibilites" },
  ]

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
              Votre profil est{" "}
              <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">
                en cours de vérification !
              </span>
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-2">
              Merci <strong className="text-foreground">{formData.prenom}</strong>, votre inscription a bien été prise en compte.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Notre équipe va vérifier votre diplôme et activer votre profil sous <strong className="text-foreground">48h</strong>. Vous serez recontacté à l&apos;adresse <strong className="text-foreground">{formData.email}</strong>.
            </p>
            <Link href="/" className="inline-block px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="font-sans text-foreground min-h-screen">
      <Navbar />

      {/* Background effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,245,160,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_50%,rgba(0,212,255,0.06)_0%,transparent_60%)]" />
      </div>

      <main className="relative z-10 pt-32 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
              Inscription gratuite
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
              Devenez{" "}
              <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">moniteur</span>
            </h1>
            <p className="text-muted-foreground">
              Rejoignez la communaute Easy Drive
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step === s.num
                        ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background"
                        : step > s.num
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-card border-2 border-border text-muted-foreground"
                    }`}
                  >
                    {step > s.num ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s.num
                    )}
                  </div>
                  <span className={`text-xs mt-2 hidden sm:block ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-16 md:w-24 h-0.5 mx-2 ${step > s.num ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-card border border-border rounded-3xl p-8 md:p-10">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6">Informations personnelles</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prenom</label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => updateField("prenom", e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.prenom ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none transition-colors`}
                      id="prenom" name="prenom" autoComplete="given-name" placeholder="Jean"
                    />
                    {errors.prenom && <p className="text-destructive text-xs mt-1">{errors.prenom}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => updateField("nom", e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.nom ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none transition-colors`}
                      placeholder="Dupont"
                    />
                    {errors.nom && <p className="text-destructive text-xs mt-1">{errors.nom}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email professionnel</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.email ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none transition-colors`}
                    placeholder="jean.dupont@email.com"
                  />
                  {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Telephone</label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => updateField("telephone", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.telephone ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none transition-colors`}
                    id="telephone" name="telephone" autoComplete="tel" placeholder="06 12 34 56 78"
                  />
                  {errors.telephone && <p className="text-destructive text-xs mt-1">{errors.telephone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mot de passe</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.password ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none transition-colors`}
                    placeholder="Minimum 8 caracteres"
                  />
                  {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.confirmPassword ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none transition-colors`}
                    placeholder="Repetez votre mot de passe"
                  />
                  {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* Photo upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Photo de profil</label>
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-full bg-background border-2 border-dashed border-border hover:border-primary cursor-pointer flex items-center justify-center overflow-hidden transition-colors"
                    >
                      {photoPreview ? (
                        <Image src={photoPreview} alt="Preview" width={80} height={80} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Cliquez pour ajouter une photo</p>
                      <p className="text-xs">JPG, PNG. Max 2MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-8">
                <h2 className="text-xl font-bold mb-6">Profil professionnel</h2>

                <div>
                  <label className="block text-sm font-medium mb-3">Type de diplome</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {diplomes.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => updateField("diplome", d.value)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium text-center transition-all ${
                          formData.diplome === d.value
                            ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background"
                            : "bg-background border border-border hover:border-primary/50"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  {errors.diplome && <p className="text-destructive text-xs mt-2">{errors.diplome}</p>}
                </div>

                {/* Justificatif upload */}
                <div>
                  <label className="block text-sm font-medium mb-3">Justificatif de diplome</label>
                  <div
                    onClick={() => justificatifInputRef.current?.click()}
                    onDrop={handleJustificatifDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    {justificatifName ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">{justificatifName}</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-10 h-10 mx-auto text-muted-foreground mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-muted-foreground">Glissez-deposez ou cliquez pour telecharger</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG. Max 5MB</p>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-primary/80 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Votre diplome sera verifie sous 48h
                  </p>
                  <input
                    ref={justificatifInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleJustificatifChange}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">{"Annees d'experience"}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {experiences.map((e) => (
                      <button
                        key={e.value}
                        type="button"
                        onClick={() => updateField("experience", e.value)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium text-center transition-all ${
                          formData.experience === e.value
                            ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background"
                            : "bg-background border border-border hover:border-primary/50"
                        }`}
                      >
                        {e.label}
                      </button>
                    ))}
                  </div>
                  {errors.experience && <p className="text-destructive text-xs mt-2">{errors.experience}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Specialites proposees</label>
                  <div className="grid grid-cols-2 gap-3">
                    {specialitesOptions.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => toggleArrayField("specialites", s.value)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all flex items-center gap-2 ${
                          formData.specialites.includes(s.value)
                            ? "bg-primary/20 border-2 border-primary text-primary"
                            : "bg-background border border-border hover:border-primary/50"
                        }`}
                      >
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
                  <label className="block text-sm font-medium mb-3">Types de permis enseignes</label>
                  <div className="flex flex-wrap gap-3">
                    {typesPermisOptions.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => toggleArrayField("typesPermis", t.value)}
                        className={`px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                          formData.typesPermis.includes(t.value)
                            ? "bg-primary/20 border-2 border-primary text-primary"
                            : "bg-background border border-border hover:border-primary/50"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                          formData.typesPermis.includes(t.value) ? "bg-primary border-primary" : "border-muted-foreground"
                        }`}>
                          {formData.typesPermis.includes(t.value) && (
                            <svg className="w-3 h-3 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {errors.typesPermis && <p className="text-destructive text-xs mt-2">{errors.typesPermis}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Boite proposee</label>
                  <div className="flex flex-wrap gap-3">
                    {boitesVitesses.map((b) => (
                      <button
                        key={b.value}
                        type="button"
                        onClick={() => updateField("boiteVitesses", b.value)}
                        className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                          formData.boiteVitesses === b.value
                            ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background"
                            : "bg-background border border-border hover:border-primary/50"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                  {errors.boiteVitesses && <p className="text-destructive text-xs mt-2">{errors.boiteVitesses}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Tarif par lecon de 45 min : <span className="text-primary font-bold">{formData.tarif} EUR</span>
                  </label>
                  <div className="relative pt-2">
                    <input
                      type="range"
                      min="30"
                      max="90"
                      value={formData.tarif}
                      onChange={(e) => updateField("tarif", parseInt(e.target.value))}
                      className="w-full h-2 bg-background border border-border rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #00F5A0 0%, #00D4FF ${((formData.tarif - 30) / 60) * 100}%, var(--background) ${((formData.tarif - 30) / 60) * 100}%, var(--background) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>30 EUR</span>
                      <span>90 EUR</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-8">
                <h2 className="text-xl font-bold mb-6">Zone et disponibilites</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">{"Ville principale d'intervention"}</label>
                  <input
                    type="text"
                    value={formData.ville}
                    onChange={(e) => updateField("ville", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-background border ${errors.ville ? "border-destructive" : "border-border"} focus:border-primary focus:outline-none transition-colors`}
                    placeholder="Ex: Paris, Lyon, Marseille..."
                  />
                  {errors.ville && <p className="text-destructive text-xs mt-1">{errors.ville}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">{"Rayon d'intervention"}</label>
                  <div className="flex flex-wrap gap-3">
                    {rayons.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => updateField("rayon", r.value)}
                        className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                          formData.rayon === r.value
                            ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background"
                            : "bg-background border border-border hover:border-primary/50"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  {errors.rayon && <p className="text-destructive text-xs mt-2">{errors.rayon}</p>}
                </div>

                {/* Availability Grid */}
                <div>
                  <label className="block text-sm font-medium mb-3">Disponibilites</label>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="p-2"></th>
                          {creneaux.map((c) => (
                            <th key={c} className="p-2 text-xs font-medium text-muted-foreground">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {jours.map((jour) => (
                          <tr key={jour}>
                            <td className="p-2 text-sm font-medium">{jour}</td>
                            {creneaux.map((creneau) => {
                              const key = `${jour}-${creneau}`
                              const isSelected = formData.disponibilites.includes(key)
                              return (
                                <td key={creneau} className="p-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleArrayField("disponibilites", key)}
                                    className={`w-full h-10 rounded-lg transition-all ${
                                      isSelected
                                        ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] shadow-lg shadow-primary/20"
                                        : "bg-background border border-border hover:border-primary/50"
                                    }`}
                                  />
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {errors.disponibilites && <p className="text-destructive text-xs mt-2">{errors.disponibilites}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Statut</label>
                  <div className="flex flex-wrap gap-3">
                    {statuts.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => updateField("statut", s.value)}
                        className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                          formData.statut === s.value
                            ? "bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background"
                            : "bg-background border border-border hover:border-primary/50"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  {errors.statut && <p className="text-destructive text-xs mt-2">{errors.statut}</p>}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-10 pt-6 border-t border-border">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 rounded-xl text-sm font-medium bg-background border border-border hover:border-primary/50 transition-colors"
                >
                  Retour
                </button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 transition-opacity"
                >
                  Continuer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-10 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Inscription en cours...
                    </>
                  ) : "Créer mon profil moniteur"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
