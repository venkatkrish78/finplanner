'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Brain, 
  LayoutDashboard, 
  CreditCard, 
  Receipt, 
  Target, 
  Banknote, 
  TrendingUp,
  ChevronDown,
  LogOut,
  Settings,
  User
} from 'lucide-react'

const navigationItems = [
  { 
    name: 'AI Home', 
    href: '/ai-home', 
    icon: Brain,
    gradient: 'from-purple-500 to-blue-500'
  },
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    name: 'Transactions', 
    href: '/transactions', 
    icon: CreditCard,
    gradient: 'from-green-500 to-emerald-500'
  },
  { 
    name: 'Bills', 
    href: '/bills', 
    icon: Receipt,
    gradient: 'from-orange-500 to-red-500'
  },
  { 
    name: 'Goals', 
    href: '/goals', 
    icon: Target,
    gradient: 'from-pink-500 to-rose-500'
  },
  { 
    name: 'Loans', 
    href: '/loans', 
    icon: Banknote,
    gradient: 'from-yellow-500 to-orange-500'
  },
  { 
    name: 'Investments', 
    href: '/investments', 
    icon: TrendingUp,
    gradient: 'from-indigo-500 to-purple-500'
  },
]

export default function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Don't render header on auth pages or home page
  if (pathname === '/' || pathname.startsWith('/auth')) {
    return null
  }

  // Don't render header if not authenticated
  if (status === 'unauthenticated') {
    return null
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="animate-pulse flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
              <div className="w-32 h-6 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse w-10 h-10 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </header>
    )
  }

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      await signOut({ 
        redirect: true,
        callbackUrl: '/auth/signin'
      })
    } catch (error) {
      console.error('Sign out error:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FinPlanner
              </span>
              <div className="text-xs text-gray-500 -mt-1">Professional</div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                >
                  <div className={`p-1.5 bg-gradient-to-r ${item.gradient} rounded-lg opacity-70 group-hover:opacity-100 transition-opacity duration-200`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          {session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-3 hover:bg-gray-50 rounded-xl px-3 py-2"
                  disabled={isLoggingOut}
                >
                  <Avatar className="h-8 w-8 ring-2 ring-gradient-to-r from-blue-400 to-purple-400">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold">
                      {session.user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">
                      {session.user.name}
                    </div>
                    <div className="text-xs text-blue-600 font-medium">Premium Account</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuItem className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="flex items-center space-x-2 text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
