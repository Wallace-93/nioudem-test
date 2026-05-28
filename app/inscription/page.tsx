"use client"
export const dynamic = "force-dynamic"
import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

export default function Inscription() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [prenom, setPrenom] = useState("")
  const [nom, setNom] = useState("")
  const [role, setRole] = useState<"eleve" | "moniteur">("eleve")
  const [status, setStatus] = useState("")

<<<<<<< Updated upstream
  async function inscrire() {
    setStatus("Inscription...")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
=======
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
>>>>>>> Stashed changes
    )

    // 1. Créer le compte auth
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setStatus("Erreur : " + error.message); return }
    if (!data.user) { setStatus("Erreur : utilisateur non créé"); return }

    // 2. Créer le profil
    const { error: profError } = await supabase.from("profiles").insert({
      id: data.user.id,
      prenom,
      nom,
      role,
      telephone: ""
    })
    if (profError) { setStatus("Erreur profil : " + profError.message); return }

    // 3. Créer eleve ou moniteur
    if (role === "eleve") {
      await supabase.from("eleves").insert({ user_id: data.user.id })
    } else {
      await supabase.from("moniteurs").insert({
        user_id: data.user.id,
        diplome: "BEPECASER",
        zone: "Paris",
        rayon_km: 15,
        tarif_horaire: 50,
        boite_auto: false,
        verifie: false,
        note_moyenne: 0,
        nb_avis: 0
      })
    }

    setStatus("✅ Compte créé ! Redirection...")
    await new Promise(r => setTimeout(r, 500))
    window.location.replace("/dashboard")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
      <h1>Inscription</h1>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setRole("eleve")}
          style={{ padding: "8px 16px", borderRadius: 8, background: role === "eleve" ? "#00F5A0" : "#1a1f2e", color: role === "eleve" ? "#0A0F1E" : "white", border: "1px solid #333", cursor: "pointer" }}>
          Élève
        </button>
        <button onClick={() => setRole("moniteur")}
          style={{ padding: "8px 16px", borderRadius: 8, background: role === "moniteur" ? "#00F5A0" : "#1a1f2e", color: role === "moniteur" ? "#0A0F1E" : "white", border: "1px solid #333", cursor: "pointer" }}>
          Moniteur
        </button>
      </div>
      {[
        { val: prenom, set: setPrenom, ph: "Prénom", type: "text" },
        { val: nom, set: setNom, ph: "Nom", type: "text" },
        { val: email, set: setEmail, ph: "Email", type: "email" },
        { val: password, set: setPassword, ph: "Mot de passe", type: "password" },
      ].map(({ val, set, ph, type }) => (
        <input key={ph} type={type} placeholder={ph} value={val} onChange={e => set(e.target.value)}
          style={{ padding: 12, borderRadius: 8, border: "1px solid #333", background: "#1a1f2e", color: "white", width: 300 }} />
      ))}
      <button onClick={inscrire}
        style={{ padding: "12px 32px", borderRadius: 8, background: "#00F5A0", color: "#0A0F1E", fontWeight: "bold", border: "none", cursor: "pointer" }}>
        Créer mon compte
      </button>
      {status && <p style={{ color: status.includes("Erreur") ? "#ff6b6b" : "#00F5A0" }}>{status}</p>}
      <Link href="/connexion" style={{ color: "#666" }}>Déjà un compte ? Se connecter</Link>
    </div>
  )
}
