
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowRight, Plus, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/currency';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import '@/lib/chart-config';

const Doughnut = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), {
  ssr: false,
  loading: () => <div className="h-32 bg-muted animate-pulse rounded"></div>
});

interface Investment {
  id: string;
  name: string;
  type: string;
  currentValue: number;
  investedAmount: number;
  gainLoss: number;
  gainLossPercentage: number;
}

interface InvestmentSnapshotWidgetProps {
  data: {
    totalValue: number;
    investments: Investment[];
  };
  onDataChange?: () => void;
}

export function InvestmentSnapshotWidget({ data, onDataChange }: InvestmentSnapshotWidgetProps) {
  const totalInvested = data.investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
  const totalGainLoss = data.totalValue - totalInvested;
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  // Prepare chart data
  const chartData = {
    labels: data.investments.map(inv => inv.name),
    datasets: [{
      data: data.investments.map(inv => inv.currentValue),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
      ],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <CardTitle className="text-lg">Investment Snapshot</CardTitle>
        </div>
        <Link href="/investments">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.investments.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No investments yet</p>
            <Link href="/investments">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Investment
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Total Value Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Portfolio Value</span>
                <span className="text-lg font-bold">
                  {formatCurrency(data.totalValue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total Invested</span>
                <span className="text-sm">{formatCurrency(totalInvested)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Gain/Loss</span>
                <div className="flex items-center gap-1">
                  {totalGainLoss >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(totalGainLoss))} ({totalGainLossPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Asset Allocation Chart */}
            {data.investments.length > 1 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Asset Allocation</h4>
                <div className="h-32">
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
              </div>
            )}

            {/* Top Investments */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Top Investments</h4>
              <div className="space-y-2">
                {data.investments.slice(0, 3).map((investment, index) => (
                  <motion.div
                    key={investment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center p-2 border rounded"
                  >
                    <div>
                      <div className="text-sm font-medium">{investment.name}</div>
                      <div className="text-xs text-muted-foreground">{investment.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatCurrency(investment.currentValue)}
                      </div>
                      <div className={`text-xs flex items-center gap-1 ${
                        investment.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {investment.gainLoss >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {investment.gainLossPercentage.toFixed(1)}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {data.investments.length > 3 && (
              <div className="text-center">
                <Link href="/investments">
                  <Button variant="outline" size="sm">
                    View {data.investments.length - 3} more investments
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
