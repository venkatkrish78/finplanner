
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/currency';

interface FinancialOverviewProps {
  data: {
    netWorth: number;
    currentMonthIncome: number;
    currentMonthExpenses: number;
    incomeTrend: number;
    expenseTrend: number;
    savingsRate: number;
  };
  cardType?: 'netWorth' | 'income' | 'expenses' | 'savingsRate';
}

export function FinancialOverviewCards({ data, cardType }: FinancialOverviewProps) {
  // If cardType is specified, render single card
  if (cardType) {
    const cardConfig = {
      netWorth: {
        title: 'Net Worth',
        value: data.netWorth,
        icon: DollarSign,
        trend: null,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        isPercentage: false
      },
      income: {
        title: 'Monthly Income',
        value: data.currentMonthIncome,
        icon: TrendingUp,
        trend: data.incomeTrend,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        isPercentage: false
      },
      expenses: {
        title: 'Monthly Expenses',
        value: data.currentMonthExpenses,
        icon: CreditCard,
        trend: data.expenseTrend,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        isPercentage: false
      },
      savingsRate: {
        title: 'Savings Rate',
        value: data.savingsRate,
        icon: PiggyBank,
        trend: null,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        isPercentage: true
      }
    };

    const card = cardConfig[cardType];

    return (
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {card.title}
          </CardTitle>
          <div className={`p-2 rounded-lg ${card.bgColor}`}>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="text-2xl font-bold">
            {card.isPercentage 
              ? `${card.value.toFixed(1)}%`
              : formatCurrency(card.value)
            }
          </div>
          {card.trend !== null && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {card.trend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : card.trend < 0 ? (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              ) : null}
              <span className={card.trend > 0 ? 'text-green-500' : card.trend < 0 ? 'text-red-500' : ''}>
                {card.trend > 0 ? '+' : ''}{card.trend.toFixed(1)}% from last month
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Legacy grid layout for backward compatibility
  const cards = [
    {
      title: 'Net Worth',
      value: data.netWorth,
      icon: DollarSign,
      trend: null,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Monthly Income',
      value: data.currentMonthIncome,
      icon: TrendingUp,
      trend: data.incomeTrend,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Monthly Expenses',
      value: data.currentMonthExpenses,
      icon: CreditCard,
      trend: data.expenseTrend,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Savings Rate',
      value: data.savingsRate,
      icon: PiggyBank,
      trend: null,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      isPercentage: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="text-2xl font-bold">
                {card.isPercentage 
                  ? `${card.value.toFixed(1)}%`
                  : formatCurrency(card.value)
                }
              </div>
              {card.trend !== null && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {card.trend > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : card.trend < 0 ? (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  ) : null}
                  <span className={card.trend > 0 ? 'text-green-500' : card.trend < 0 ? 'text-red-500' : ''}>
                    {card.trend > 0 ? '+' : ''}{card.trend.toFixed(1)}% from last month
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
