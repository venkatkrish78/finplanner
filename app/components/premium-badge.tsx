'use client'

import { Crown, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PremiumBadgeProps {
  isPremium: boolean
  variant?: 'default' | 'small' | 'header'
  className?: string
}

export function PremiumBadge({ isPremium, variant = 'default', className = '' }: PremiumBadgeProps) {
  if (!isPremium) {
    if (variant === 'header') {
      return (
        <Badge variant="outline" className={`text-xs ${className}`}>
          Free
        </Badge>
      )
    }
    return null
  }

  const variants = {
    default: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1',
    small: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-0.5 text-xs',
    header: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 text-xs'
  }

  return (
    <Badge className={`${variants[variant]} ${className} flex items-center gap-1`}>
      {variant === 'small' ? (
        <Crown className="h-3 w-3" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      Premium
    </Badge>
  )
}
