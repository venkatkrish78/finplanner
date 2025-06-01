
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, CreditCard, Target, Receipt, Banknote, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

interface QuickActionsBarProps {
  onDataChange?: () => void;
}

export function QuickActionsBar({ onDataChange }: QuickActionsBarProps = {}) {
  const actions = [
    {
      id: 'transaction',
      label: 'Add Transaction',
      icon: CreditCard,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Record income or expense',
      href: '/transactions'
    },
    {
      id: 'goal',
      label: 'New Goal',
      icon: Target,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Set financial target',
      href: '/goals'
    },
    {
      id: 'bill',
      label: 'Add Bill',
      icon: Receipt,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Schedule recurring payment',
      href: '/bills'
    },
    {
      id: 'loan',
      label: 'Add Loan',
      icon: Banknote,
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Track debt or lending',
      href: '/loans'
    },
    {
      id: 'investment',
      label: 'Add Investment',
      icon: TrendingUp,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Record investment',
      href: '/investments'
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Plus className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">Add new financial data quickly</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200 w-full"
                >
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
