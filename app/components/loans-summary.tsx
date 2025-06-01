
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingDown, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/currency';
import { Loan, LoanStats } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface LoansSummaryProps {
  refreshTrigger?: number;
}

export function LoansSummary({ refreshTrigger }: LoansSummaryProps) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState<LoanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    try {
      const [loansResponse, statsResponse] = await Promise.all([
        fetch('/api/loans'),
        fetch('/api/loans/stats')
      ]);

      if (loansResponse.ok) {
        const loansData = await loansResponse.json();
        setLoans(loansData.slice(0, 3)); // Show only top 3 loans
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching loans data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || loans.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <CreditCard className="h-5 w-5" />
            Loan Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <CreditCard className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 mb-4">No loans tracked yet</p>
            <Button
              onClick={() => router.push('/loans')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Loan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <CreditCard className="h-5 w-5" />
            Loan Management
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/loans')}
            className="text-red-600 hover:text-red-700 hover:bg-red-100"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-red-600">{stats.totalLoans}</p>
            <p className="text-xs text-red-500">Active Loans</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.totalDebt).replace('₹', '₹')}
            </p>
            <p className="text-xs text-red-500">Total Debt</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.monthlyEMI).replace('₹', '₹')}
            </p>
            <p className="text-xs text-red-500">Monthly EMI</p>
          </div>
        </div>

        {/* Top Loans */}
        <div className="space-y-3">
          {loans.map((loan, index) => {
            const paidAmount = loan.principalAmount - loan.currentBalance;
            const progress = loan.principalAmount > 0 ? (paidAmount / loan.principalAmount) * 100 : 0;
            
            return (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/60 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 text-sm">{loan.name}</h4>
                  <span className="text-xs font-medium text-red-600">
                    {progress.toFixed(0)}% paid
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Outstanding: {formatCurrency(loan.currentBalance)}</span>
                  <span>EMI: {formatCurrency(loan.emiAmount)}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <Button
          onClick={() => router.push('/loans')}
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50"
        >
          <TrendingDown className="h-4 w-4 mr-2" />
          Manage Loans
        </Button>
      </CardContent>
    </Card>
  );
}
