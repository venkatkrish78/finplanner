
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowRight, Plus, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/currency';
import Link from 'next/link';

interface Investment {
  id: string;
  name: string;
  type: string;
  currentValue: number;
  investedAmount: number;
  gainLoss: number;
  gainLossPercentage: number;
}

interface InvestmentData {
  totalValue: number;
  investments: Investment[];
}

interface InvestmentSnapshotWidgetProps {
  data: InvestmentData;
  onDataChange?: () => void;
}

export function InvestmentSnapshotWidget({ data, onDataChange }: InvestmentSnapshotWidgetProps) {
  const totalInvested = data.investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
  const totalGainLoss = data.totalValue - totalInvested;
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <CardTitle className="text-lg">Investments</CardTitle>
        </div>
        <Link href="/investments">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        {data.investments.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No investments tracked</p>
            <Link href="/investments">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Investment
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Portfolio Summary */}
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Value</span>
                  <span className="text-lg font-bold">{formatCurrency(data.totalValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Invested</span>
                  <span className="text-sm font-medium">{formatCurrency(totalInvested)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Gain/Loss</span>
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
            </div>

            {/* Top Investments */}
            <div className="space-y-2">
              {data.investments.slice(0, 2).map((investment, index) => (
                <motion.div
                  key={investment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{investment.name}</h4>
                      <p className="text-xs text-muted-foreground">{investment.type}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(investment.currentValue)}</div>
                      <div className={`text-xs flex items-center gap-1 ${investment.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {investment.gainLoss >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {investment.gainLossPercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {data.investments.length > 2 && (
              <div className="text-center pt-2">
                <Link href="/investments">
                  <Button variant="outline" size="sm">
                    View {data.investments.length - 2} More
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
