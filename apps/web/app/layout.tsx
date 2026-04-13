import type { Metadata } from 'next'
import { Playfair_Display, Open_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-opensans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Velunisa | Wax Melts Artesanales Ecuador',
    template: '%s | Velunisa',
  },
  description:
    'Wax melts artesanales premium para Baby Shower, Bodas, Cumpleaños y Días Especiales. Diseños únicos con fragancias irresistibles. Envíos a todo Ecuador.',
  keywords: [
    'wax melts',
    'ceras aromáticas',
    'baby shower',
    'bodas',
    'cumpleaños',
    'Ecuador',
    'Velunisa',
    'aromaterapia',
    'velas decorativas',
  ],
  authors: [{ name: 'Velunisa' }],
  creator: 'Velunisa',
  openGraph: {
    type: 'website',
    locale: 'es_EC',
    url: 'https://velunisa.com',
    siteName: 'Velunisa',
    title: 'Velunisa | Wax Melts Artesanales Ecuador',
    description:
      'Wax melts artesanales premium para Baby Shower, Bodas, Cumpleaños y Días Especiales.',
    images: [
      {
        url: 'https://velunisa.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Velunisa - Wax Melts Artesanales',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Velunisa | Wax Melts Artesanales Ecuador',
    description: 'Wax melts artesanales premium para cada ocasión especial.',
    images: ['https://velunisa.com/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${openSans.variable}`}>
      <body className="font-sans">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#4F5353',
                color: '#ECDBCE',
                fontFamily: 'var(--font-opensans)',
                fontSize: '14px',
                borderRadius: '8px',
              },
              success: {
                iconTheme: {
                  primary: '#ECDBCE',
                  secondary: '#4F5353',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
