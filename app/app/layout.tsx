import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import Header from '@/components/header'
import { AuthProvider } from '@/components/providers/auth-provider'
import { GlobalCommandBar } from '@/components/global-command-bar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinPlanner AI - AI Financial Coach',
  description: 'Your intelligent financial planning companion powered by AI. Track expenses, set goals, and get personalized financial insights with advanced AI coaching.',
  keywords: 'AI financial coach, personal finance, expense tracking, investment management, financial planning, budgeting, money management, artificial intelligence',
  authors: [{ name: 'FinPlanner AI Team' }],
  creator: 'FinPlanner AI',
  publisher: 'FinPlanner AI',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
              <GlobalCommandBar />
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
