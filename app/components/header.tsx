
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  BarChart3, 
  CreditCard, 
  Target, 
  Building2, 
  TrendingUp, 
  Menu,
  Calculator,
  PiggyBank
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Bills', href: '/bills', icon: Building2 },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Loans', href: '/loans', icon: Calculator },
  { name: 'Investments', href: '/investments', icon: TrendingUp },
]

export function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
