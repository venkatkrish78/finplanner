
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/currency';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import '@/lib/chart-config';

const Doughnut = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), {
  ssr: false,
  loading: () => <div className="h-48 bg-muted animate-pulse rounded"></div>
});

interface CategoryBreakdown {
  categoryName: string;
  amount: number;
}

interface CategoryBreakdownWidgetProps {
  data: CategoryBreakdown[];
  onDataChange?: () => void;
}

export function CategoryBreakdownWidget({ data, onDataChange }: CategoryBreakdownWidgetProps) {
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  const chartData = {
    labels: data.map(item => item.categoryName),
    datasets: [{
      data: data.map(item => item.amount),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
      ],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const percentage = ((context.parsed / totalAmount) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <PieChart className="h-5 w-5 text-indigo-600" />
          </div>
          <CardTitle className="text-lg">Expense Breakdown</CardTitle>
        </div>
        <Link href="/transactions">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View Details
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pb-6">
        {data.length === 0 ? (
          <div className="text-center py-8">
            <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No expense data for this month</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="h-48">
              <Doughnut data={chartData} options={chartOptions} />
            </div>

            {/* Category List */}
            <div className="space-y-2">
              {data.slice(0, 6).map((item, index) => {
                const percentage = ((item.amount / totalAmount) * 100).toFixed(1);
                const color = chartData.datasets[0].backgroundColor[index % chartData.datasets[0].backgroundColor.length];
                
                return (
                  <motion.div
                    key={item.categoryName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm font-medium">{item.categoryName}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(item.amount)}</div>
                      <div className="text-xs text-muted-foreground">{percentage}%</div>
                    </div>
                  </motion.div>
                );
              })}
              
              {data.length > 6 && (
                <div className="text-center pt-2">
                  <Link href="/transactions">
                    <Button variant="outline" size="sm">
                      View {data.length - 6} More Categories
                    </Button>
                  </Link>
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Expenses</span>
                  <span className="text-lg font-bold">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
