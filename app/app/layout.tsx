
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinPlanner - Professional Personal Finance Manager',
  description: 'Take control of your finances with FinPlanner - a comprehensive personal finance management platform for tracking expenses, managing investments, and achieving your financial goals.',
  keywords: 'personal finance, expense tracking, investment management, financial planning, budgeting, money management',
  authors: [{ name: 'FinPlanner Team' }],
  creator: 'FinPlanner',
  publisher: 'FinPlanner',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://finplanner.app'),
  openGraph: {
    title: 'FinPlanner - Professional Personal Finance Manager',
    description: 'Take control of your finances with FinPlanner - a comprehensive personal finance management platform.',
    url: 'https://finplanner.app',
    siteName: 'FinPlanner',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinPlanner - Professional Personal Finance Manager',
    description: 'Take control of your finances with FinPlanner - a comprehensive personal finance management platform.',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
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
      </body>
    </html>
  )
}
