import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RugbyCoach — RCACP 95',
  description: 'Application de gestion d\'équipe — RCACP Cergy-Pontoise',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0a0e15',
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
