import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SK Dashboard — Manage Your Credit Portfolio',
  description: 'Access your smart credit portfolio, manage supply chain financing, and monitor real-time credit metrics across LATAM.',
  keywords: ['credit dashboard', 'portfolio management', 'smart kapital', 'LATAM finance'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'SK Dashboard',
    description: 'Manage your credit portfolio with SK.',
    url: '/',
    siteName: 'SK Dashboard',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    shortcut: ['/icon.svg'],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&amp;display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
