
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { FinancialOverviewCards } from '@/components/financial-overview-cards';
import { QuickActionsBar } from '@/components/quick-actions-bar';
import { GoalsProgressWidget } from '@/components/goals-progress-widget';
import { LoansStatusWidget } from '@/components/loans-status-widget';
import { InvestmentSnapshotWidget } from '@/components/investment-snapshot-widget';
import { UpcomingItemsWidget } from '@/components/upcoming-items-widget';
import { CategoryBreakdownWidget } from '@/components/category-breakdown-widget';

interface DashboardData {
  financialOverview: {
    netWorth: number;
    currentMonthIncome: number;
    currentMonthExpenses: number;
    incomeTrend: number;
    expenseTrend: number;
    savingsRate: number;
  };
  goals: Array<{
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    progress: number;
    remainingAmount: number;
    linkedInvestmentValue?: number;
    totalContributions?: number;
  }>;
  loans: Array<{
    id: string;
    name: string;
    totalAmount: number;
    outstandingAmount: number;
    progress: number;
    nextDueDate: Date | null;
    emiAmount: number;
  }>;
  investments: {
    totalValue: number;
    investments: Array<{
      id: string;
      name: string;
      type: string;
      currentValue: number;
      investedAmount: number;
      gainLoss: number;
      gainLossPercentage: number;
    }>;
  };
  upcomingItems: Array<{
    id: string;
    name: string;
    amount: number;
    dueDate: Date;
    type: 'bill' | 'loan';
  }>;
  categoryBreakdown: Array<{
    categoryName: string;
    amount: number;
  }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add cache busting parameter for real-time updates
      const response = await fetch(`/api/dashboard?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to trigger refresh from child components
  const handleDataRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="space-y-4">
          {/* Header Skeleton */}
          <div className="space-y-2 mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Boxed Dashboard Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 gap-4">
            {/* Financial Overview Cards - Top Row */}
            <div className="xl:col-span-3">
              <Card className="h-32">
                <Skeleton className="h-full w-full" />
              </Card>
            </div>
            <div className="xl:col-span-3">
              <Card className="h-32">
                <Skeleton className="h-full w-full" />
              </Card>
            </div>
            <div className="xl:col-span-3">
              <Card className="h-32">
                <Skeleton className="h-full w-full" />
              </Card>
            </div>
            <div className="xl:col-span-3">
              <Card className="h-32">
                <Skeleton className="h-full w-full" />
              </Card>
            </div>

            {/* Quick Actions - Second Row */}
            <div className="md:col-span-2 lg:col-span-3 xl:col-span-12">
              <Card className="h-40">
                <Skeleton className="h-full w-full" />
              </Card>
            </div>

            {/* Widget Grid - Third Row (Equal Sizing for 4 Target Tiles) */}
            <div className="md:col-span-1 lg:col-span-1 xl:col-span-3">
              <Card className="h-80">
                <Skeleton className="h-full w-full" />
              </Card>
            </div>
            <div className="md:col-span-1 lg:col-span-1 xl:col-span-3">
              <Card className="h-80">
                <Skeleton className="h-full w-full" />
              </Card>
            </div>
            <div className="md:col-span-1 lg:col-span-1 xl:col-span-3">
              <Card className="h-80">
                <Skeleton className="h-full w-full" />
              </Card>
            </div>
            <div className="md:col-span-1 lg:col-span-1 xl:col-span-3">
              <Card className="h-80">
                <Skeleton className="h-full w-full" />
              </Card>
            </div>

            {/* Category Breakdown - Fourth Row */}
            <div className="md:col-span-2 lg:col-span-3 xl:col-span-12">
              <Card className="h-64">
                <Skeleton className="h-full w-full" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Dashboard Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Welcome to FinPlanner! 🎉</h1>
          <p className="text-muted-foreground mb-8">
            Your comprehensive financial management dashboard. Start by adding your financial data to get personalized insights.
          </p>
          <div className="max-w-4xl mx-auto">
            <QuickActionsBar onDataChange={handleDataRefresh} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Financial Dashboard
          </h1>
          <p className="text-muted-foreground">
            Your complete financial overview with smart insights and actionable data
          </p>
        </div>

        {/* Boxed Dashboard Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 gap-4">
          {/* Financial Overview Cards - Top Row (4 boxes) */}
          <motion.div 
            className="xl:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <FinancialOverviewCards 
              data={data.financialOverview} 
              cardType="netWorth"
            />
          </motion.div>
          
          <motion.div 
            className="xl:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FinancialOverviewCards 
              data={data.financialOverview} 
              cardType="income"
            />
          </motion.div>
          
          <motion.div 
            className="xl:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <FinancialOverviewCards 
              data={data.financialOverview} 
              cardType="expenses"
            />
          </motion.div>
          
          <motion.div 
            className="xl:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <FinancialOverviewCards 
              data={data.financialOverview} 
              cardType="savingsRate"
            />
          </motion.div>

          {/* Quick Actions - Second Row (Full Width) */}
          <motion.div 
            className="md:col-span-2 lg:col-span-3 xl:col-span-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <QuickActionsBar onDataChange={handleDataRefresh} />
          </motion.div>

          {/* Widget Grid - Third Row (Equal Sizing for 4 Target Tiles) */}
          <motion.div 
            className="md:col-span-1 lg:col-span-1 xl:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GoalsProgressWidget goals={data.goals} onDataChange={handleDataRefresh} />
          </motion.div>

          <motion.div 
            className="md:col-span-1 lg:col-span-1 xl:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <LoansStatusWidget loans={data.loans} onDataChange={handleDataRefresh} />
          </motion.div>

          <motion.div 
            className="md:col-span-1 lg:col-span-1 xl:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <InvestmentSnapshotWidget data={data.investments} onDataChange={handleDataRefresh} />
          </motion.div>

          <motion.div 
            className="md:col-span-1 lg:col-span-1 xl:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <UpcomingItemsWidget items={data.upcomingItems} onDataChange={handleDataRefresh} />
          </motion.div>

          {/* Category Breakdown - Fourth Row (Full Width) */}
          <motion.div 
            className="md:col-span-2 lg:col-span-3 xl:col-span-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <CategoryBreakdownWidget data={data.categoryBreakdown} onDataChange={handleDataRefresh} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
