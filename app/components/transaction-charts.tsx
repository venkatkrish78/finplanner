
'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, PieChart, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';

// Dynamic imports for charts to avoid SSR issues
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), {
  ssr: false,
  loading: () => <ChartSkeleton />
});

const Doughnut = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), {
  ssr: false,
  loading: () => <ChartSkeleton />
});

// Register Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function ChartSkeleton() {
  return (
    <div className="h-[300px] w-full flex items-center justify-center">
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
  );
}

interface TransactionChartsProps {
  year: number;
  month?: number;
  refreshTrigger?: number; // Add refresh trigger prop
}

interface MonthlyTrend {
  month: number;
  year: number;
  income: number;
  expense: number;
  transaction_count: number;
}

interface CategoryBreakdown {
  category_name: string;
  category_color: string;
  transaction_type: string;
  total_amount: number;
  transaction_count: number;
}

export function TransactionCharts({ year, month, refreshTrigger }: TransactionChartsProps) {
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const params = new URLSearchParams({ year: year.toString() });
      if (month) params.append('month', month.toString());
      
      // Add cache busting parameter for real-time updates
      params.append('_t', Date.now().toString());
      
      const response = await fetch(`/api/transactions/analytics?${params}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMonthlyTrends(data.monthlyTrends || []);
        setCategoryBreakdown(data.categoryBreakdown || []);
      } else {
        console.error('Failed to fetch analytics:', response.status);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Refresh when refreshTrigger changes (from parent component)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchAnalytics(true);
    }
  }, [refreshTrigger, fetchAnalytics]);

  const handleManualRefresh = () => {
    fetchAnalytics(true);
  };

  // Prepare monthly trends chart data
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const trendsChartData = {
    labels: monthlyTrends.map(trend => monthNames[trend.month - 1]),
    datasets: [
      {
        label: 'Income',
        data: monthlyTrends.map(trend => parseFloat(trend.income.toString())),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expenses',
        data: monthlyTrends.map(trend => parseFloat(trend.expense.toString())),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const trendsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${month ? `Monthly Trends for ${monthNames[month - 1]} ${year}` : `Monthly Trends for ${year}`}`,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      },
    },
  };

  // Prepare category breakdown chart data
  const expenseCategories = categoryBreakdown.filter(item => item.transaction_type === 'EXPENSE');
  const incomeCategories = categoryBreakdown.filter(item => item.transaction_type === 'INCOME');

  const expenseCategoryData = {
    labels: expenseCategories.map(cat => cat.category_name),
    datasets: [
      {
        data: expenseCategories.map(cat => parseFloat(cat.total_amount.toString())),
        backgroundColor: expenseCategories.map(cat => cat.category_color || '#3B82F6'),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const incomeCategoryData = {
    labels: incomeCategories.map(cat => cat.category_name),
    datasets: [
      {
        data: incomeCategories.map(cat => parseFloat(cat.total_amount.toString())),
        backgroundColor: incomeCategories.map(cat => cat.category_color || '#10B981'),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="professional-card">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <ChartSkeleton />
          </CardContent>
        </Card>
        <Card className="professional-card">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <ChartSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Trends Chart */}
      <Card className="professional-card hover-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-professional-blue" />
            </div>
            Income vs Expenses
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {monthlyTrends.length > 0 ? (
              <Line data={trendsChartData} options={trendsChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No data available for the selected period
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown Chart */}
      <Card className="professional-card hover-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <PieChart className="h-4 w-4 text-red-600" />
            </div>
            Expense Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {expenseCategories.length > 0 ? (
              <Doughnut data={expenseCategoryData} options={categoryChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No expense data available for the selected period
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Income Categories Chart */}
      {incomeCategories.length > 0 && (
        <Card className="professional-card hover-shadow lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <PieChart className="h-4 w-4 text-emerald-600" />
              </div>
              Income Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Doughnut data={incomeCategoryData} options={categoryChartOptions} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
