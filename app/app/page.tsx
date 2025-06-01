
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { FinancialOverviewCards } from '@/components/financial-overview-cards';
import { QuickActionsBar } from '@/components/quick-actions-bar';
import { GoalsProgressWidget } from '@/components/goals-progress-widget';
import { LoansStatusWidget } from '@/components/loans-status-widget';
import { InvestmentSnapshotWidget } from '@/components/investment-snapshot-widget';
import { UpcomingItemsWidget } from '@/components/upcoming-items-widget';
import { RecentActivitySection } from '@/components/recent-activity-section';
import { SmartInsightsWidget } from '@/components/smart-insights-widget';
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
  recentActivity: Array<{
    id: string;
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    date: Date;
    categoryName: string;
  }>;
  categoryBreakdown: Array<{
    categoryName: string;
    amount: number;
  }>;
  insights: Array<{
    type: 'positive' | 'warning' | 'info';
    message: string;
  }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/dashboard');
      
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

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Financial Overview Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <Skeleton className="h-40" />

          {/* Widgets Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
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
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Welcome to FinPlanner! 🎉</h1>
          <p className="text-muted-foreground mb-8">
            Your comprehensive financial management dashboard. Start by adding your financial data to get personalized insights.
          </p>
          <QuickActionsBar />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Financial Dashboard
          </h1>
          <p className="text-muted-foreground">
            Your complete financial overview with smart insights and actionable data
          </p>
        </div>

        {/* Financial Overview Cards */}
        <FinancialOverviewCards data={data.financialOverview} />

        {/* Quick Actions */}
        <QuickActionsBar />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <GoalsProgressWidget goals={data.goals} />
            <UpcomingItemsWidget items={data.upcomingItems} />
          </div>

          {/* Middle Column */}
          <div className="space-y-6">
            <LoansStatusWidget loans={data.loans} />
            <CategoryBreakdownWidget data={data.categoryBreakdown} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <InvestmentSnapshotWidget data={data.investments} />
            <SmartInsightsWidget insights={data.insights} />
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivitySection activities={data.recentActivity} />
      </motion.div>
    </div>
  );
}
