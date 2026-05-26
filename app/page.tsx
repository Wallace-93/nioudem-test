"use client"
export const dynamic = "force-dynamic"
import Link from "next/link"

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
      <h1>NiouDem Drive</h1>
      <Link href="/connexion" style={{ color: "#00F5A0" }}>Se connecter</Link>
      <Link href="/inscription" style={{ color: "#00F5A0" }}>S'inscrire</Link>
    </div>
  )
}
