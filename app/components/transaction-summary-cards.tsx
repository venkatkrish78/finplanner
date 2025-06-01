
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface TransactionSummaryCardsProps {
  year: number;
  month?: number;
  view: 'monthly' | 'yearly';
}

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  incomeTransactions: number;
  expenseTransactions: number;
  totalTransactions: number;
  period: string;
}

export function TransactionSummaryCards({ year, month, view }: TransactionSummaryCardsProps) {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [year, month, view]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ year: year.toString() });
      if (month && view === 'monthly') {
        params.append('month', month.toString());
      }
      
      const response = await fetch(`/api/transactions/summary?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSummaryData(data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="professional-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Failed to load summary data</p>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Income',
      value: summaryData.totalIncome,
      count: summaryData.incomeTransactions,
      icon: TrendingUp,
      color: 'emerald',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
      trend: 'positive'
    },
    {
      title: 'Total Expenses',
      value: summaryData.totalExpense,
      count: summaryData.expenseTransactions,
      icon: TrendingDown,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      trend: 'negative'
    },
    {
      title: 'Net Balance',
      value: Math.abs(summaryData.netBalance),
      count: null,
      icon: summaryData.netBalance >= 0 ? ArrowDownRight : ArrowUpRight,
      color: summaryData.netBalance >= 0 ? 'emerald' : 'red',
      bgColor: summaryData.netBalance >= 0 ? 'bg-emerald-100' : 'bg-red-100',
      textColor: summaryData.netBalance >= 0 ? 'text-emerald-600' : 'text-red-600',
      trend: summaryData.netBalance >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Total Transactions',
      value: summaryData.totalTransactions,
      count: null,
      icon: Tag,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-professional-blue',
      trend: 'neutral'
    }
  ];

  const getMonthName = (monthNum: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1];
  };

  return (
    <div className="space-y-4">
      {/* Period Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-professional-blue to-professional-blue-light rounded-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {view === 'monthly' && month 
                ? `${getMonthName(month)} ${year}` 
                : `Year ${year}`} Summary
            </h2>
            <p className="text-sm text-slate-600">
              Financial overview for the selected period
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="professional-card hover-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 ${card.bgColor} rounded-lg`}>
                  <card.icon className={`h-4 w-4 ${card.textColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${card.textColor}`}>
                  {card.title === 'Total Transactions' 
                    ? card.value.toLocaleString()
                    : formatCurrency(card.value)
                  }
                </div>
                {card.count !== null && (
                  <p className="text-xs text-slate-600 mt-1">
                    {card.count} transaction{card.count !== 1 ? 's' : ''}
                  </p>
                )}
                {card.title === 'Net Balance' && (
                  <p className="text-xs text-slate-600 mt-1">
                    {summaryData.netBalance >= 0 ? 'Surplus' : 'Deficit'}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
