import type { Metadata, Viewport } from 'next'
import './globals.css'
import { MobileNav } from '@/components/mobile-nav'

export const metadata: Metadata = {
  title: 'Easy Drive',
  description: 'Trouvez votre moniteur auto-école idéal en Île-de-France.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Easy Drive',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0F1E',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="bg-background">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased pb-safe">
        {children}
        <MobileNav />
      </body>
    </html>
  )
}
