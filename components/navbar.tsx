"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-client"
import { useRouter, usePathname } from "next/navigation"

export function Navbar({ backLink }: { backLink?: { href: string; label: string } }) {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-3 flex items-center justify-between bg-background/85 backdrop-blur-md border-b border-border">
      <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col">
        <span className="text-xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] bg-clip-text text-transparent">Easy</span>
          <span className="font-light text-foreground"> Drive</span>
        </span>
        <span className="text-[10px] font-black tracking-[0.15em] uppercase"
          style={{
            background: "linear-gradient(135deg, #00F5A0, #00D4FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 4px rgba(0,245,160,0.7))",
            animation: "laserPulse 2s ease-in-out infinite"
          }}>
          auto-école 2.0
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-6">
        {backLink ? (
          <Link href={backLink.href} className="text-muted-foreground text-sm hover:text-primary transition-colors">
            ← {backLink.label}
          </Link>
        ) : (
          <>
            <Link href="/vision" className={`text-sm font-medium transition-colors ${pathname === "/vision" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>Notre vision</Link>
            <Link href="/resultats" className={`text-sm font-medium transition-colors ${pathname === "/resultats" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>Moniteurs</Link>
            {user && <Link href="/messages" className={`text-sm font-medium transition-colors ${pathname?.startsWith("/messages") ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>Messages</Link>}
          </>
        )}

        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
              Mon espace →
            </Link>
            <button onClick={handleLogout} className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">
              Déconnexion
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/connexion" className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">
              Se connecter
            </Link>
            <Link href="/inscription" className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background hover:opacity-90 active:scale-95 transition-all">
              Commencer
            </Link>
          </div>
        )}
      </div>

      <div className="md:hidden">
        {user ? (
          <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background active:scale-95 transition-all">
            Mon espace
          </Link>
        ) : (
          <Link href="/inscription" className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#00F5A0] to-[#00D4FF] text-background active:scale-95 transition-all">
            Commencer
          </Link>
        )}
      </div>
    </nav>
  )
}
