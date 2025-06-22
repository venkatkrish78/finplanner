import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import Header from '@/components/header'
import { AuthProvider } from '@/components/providers/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinPlanner AI - AI Financial Coach',
  description: 'Your intelligent financial planning companion powered by AI. Track expenses, set goals, and get personalized financial insights with advanced AI coaching.',
  keywords: 'AI financial coach, personal finance, expense tracking, investment management, financial planning, budgeting, money management, artificial intelligence',
  authors: [{ name: 'FinPlanner AI Team' }],
  creator: 'FinPlanner AI',
  publisher: 'FinPlanner AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://finplanner.app'),
  openGraph: {
    title: 'FinPlanner AI - AI Financial Coach',
    description: 'Your intelligent financial planning companion powered by AI. Get personalized financial insights and coaching.',
    url: 'https://finplanner.app',
    siteName: 'FinPlanner AI',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'FinPlanner AI - AI Financial Coach',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinPlanner AI - AI Financial Coach',
    description: 'Your intelligent financial planning companion powered by AI',
    images: ['/logo.png'],
    creator: '@finplanner',
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
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-slate-50">
              <Header />
              <main className="pb-8">
                {children}
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
