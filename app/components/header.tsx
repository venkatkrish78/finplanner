'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  BarChart3, 
  CreditCard, 
  Target, 
  Building2, 
  TrendingUp, 
  Menu,
  Calculator,
  PiggyBank,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Bills', href: '/bills', icon: Building2 },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Loans', href: '/loans', icon: Calculator },
  { name: 'Investments', href: '/investments', icon: TrendingUp },
]

export function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { data: session, status } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  const getUserInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  const getUserDisplayName = () => {
    if (session?.user?.name) return session.user.name
    if (session?.user?.email) return session.user.email.split('@')[0]
    return 'User'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-professional-blue to-professional-blue-light rounded-lg">
              <PiggyBank className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-professional-blue to-professional-blue-light bg-clip-text text-transparent">
              FinPlanner
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "relative px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "text-professional-blue bg-blue-50"
                        : "text-slate-600 hover:text-professional-blue hover:bg-slate-50"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-professional-blue"
                        layoutId="activeTab"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* User Menu & Mobile Navigation */}
          <div className="flex items-center space-x-4">
            {/* User Menu - Desktop */}
            {session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="hidden md:flex">
                  <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                      <AvatarFallback className="bg-professional-blue text-white text-xs">
                        {getUserInitials(session.user?.name, session.user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-slate-900">
                        {getUserDisplayName()}
                      </span>
                      <span className="text-xs text-slate-500">
                        {session.user?.email}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{getUserDisplayName()}</p>
                      <p className="text-xs text-slate-500">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Navigation */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center space-x-2 px-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-professional-blue to-professional-blue-light rounded-lg">
                      <PiggyBank className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-professional-blue to-professional-blue-light bg-clip-text text-transparent">
                      FinPlanner
                    </span>
                  </div>

                  {/* User Info - Mobile */}
                  {session && (
                    <div className="flex items-center space-x-3 px-4 py-3 bg-slate-50 rounded-lg mx-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                        <AvatarFallback className="bg-professional-blue text-white">
                          {getUserInitials(session.user?.name, session.user?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">
                          {getUserDisplayName()}
                        </span>
                        <span className="text-xs text-slate-500">
                          {session.user?.email}
                        </span>
                      </div>
                    </div>
                  )}

                  <nav className="flex flex-col space-y-2">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                        >
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start px-4 py-3 text-left",
                              isActive
                                ? "text-professional-blue bg-blue-50"
                                : "text-slate-600 hover:text-professional-blue hover:bg-slate-50"
                            )}
                          >
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.name}
                          </Button>
                        </Link>
                      )
                    })}
                  </nav>

                  {/* Logout Button - Mobile */}
                  {session && (
                    <div className="px-4 pt-4 border-t">
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start px-4 py-3 text-left text-red-600 hover:text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Log out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
