
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { FinancialGoal, GoalType, GoalStatus } from '@/lib/types';

const Chart = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">Loading chart...</div>
});

interface GoalProgressChartProps {
  goals: FinancialGoal[];
}

const goalTypeColors = {
  [GoalType.SAVINGS]: '#10B981',
  [GoalType.DEBT_PAYOFF]: '#EF4444',
  [GoalType.INVESTMENT]: '#3B82F6',
  [GoalType.EMERGENCY_FUND]: '#F59E0B',
  [GoalType.EDUCATION]: '#8B5CF6',
  [GoalType.HOUSE]: '#6366F1',
  [GoalType.VACATION]: '#EC4899',
  [GoalType.RETIREMENT]: '#6B7280',
  [GoalType.OTHER]: '#F59E0B'
};

export function GoalProgressChart({ goals }: GoalProgressChartProps) {
  const activeGoals = goals.filter(goal => goal.status === GoalStatus.ACTIVE);

  // Prepare data for goal type distribution chart
  const goalTypeData = activeGoals.reduce((acc, goal) => {
    acc[goal.goalType] = (acc[goal.goalType] || 0) + goal.targetAmount;
    return acc;
  }, {} as Record<GoalType, number>);

  const chartData = {
    labels: Object.keys(goalTypeData).map(type => {
      const typeLabels = {
        [GoalType.SAVINGS]: 'Savings',
        [GoalType.DEBT_PAYOFF]: 'Debt Payoff',
        [GoalType.INVESTMENT]: 'Investment',
        [GoalType.EMERGENCY_FUND]: 'Emergency Fund',
        [GoalType.EDUCATION]: 'Education',
        [GoalType.HOUSE]: 'House',
        [GoalType.VACATION]: 'Vacation',
        [GoalType.RETIREMENT]: 'Retirement',
        [GoalType.OTHER]: 'Other'
      };
      return typeLabels[type as GoalType];
    }),
    datasets: [
      {
        data: Object.values(goalTypeData),
        backgroundColor: Object.keys(goalTypeData).map(type => goalTypeColors[type as GoalType]),
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${formatCurrency(context.raw)}`;
          }
        }
      }
    }
  };

  if (goals.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals to display</h3>
          <p className="text-gray-600 text-center">
            Create some financial goals to see progress visualization.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Goal Type Distribution */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Goal Distribution by Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Chart data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Individual Goal Progress */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Individual Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeGoals.map((goal, index) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const daysRemaining = goal.targetDate 
              ? Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                    <Badge 
                      style={{ 
                        backgroundColor: `${goalTypeColors[goal.goalType]}20`,
                        color: goalTypeColors[goal.goalType],
                        border: `1px solid ${goalTypeColors[goal.goalType]}40`
                      }}
                    >
                      {goal.goalType.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{Math.min(progress, 100).toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                </div>

                <Progress value={Math.min(progress, 100)} className="h-3" />

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Remaining: {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}</span>
                  {goal.targetDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {daysRemaining !== null && daysRemaining > 0
                        ? `${daysRemaining} days left`
                        : daysRemaining === 0
                        ? 'Due today'
                        : 'Overdue'
                      }
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
