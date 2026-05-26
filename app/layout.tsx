export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#0A0F1E', color: 'white' }}>
        {children}
      </body>
    </html>
  )
}
