
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/currency';
import { FinancialGoal, GoalStats } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface GoalsSummaryProps {
  refreshTrigger?: number;
}

export function GoalsSummary({ refreshTrigger }: GoalsSummaryProps) {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    try {
      const [goalsResponse, statsResponse] = await Promise.all([
        fetch('/api/goals?status=ACTIVE'),
        fetch('/api/goals/stats')
      ]);

      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setGoals(goalsData.slice(0, 3)); // Show only top 3 goals
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching goals data:', error);
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

  if (!stats || goals.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Target className="h-5 w-5" />
            Financial Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <Target className="h-12 w-12 text-blue-400 mx-auto mb-3" />
            <p className="text-blue-600 mb-4">No active goals yet</p>
            <Button
              onClick={() => router.push('/goals')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Target className="h-5 w-5" />
            Financial Goals
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/goals')}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
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
            <p className="text-2xl font-bold text-blue-600">{stats.activeGoals}</p>
            <p className="text-xs text-blue-500">Active Goals</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalCurrentAmount).replace('₹', '₹')}
            </p>
            <p className="text-xs text-blue-500">Saved</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{stats.averageProgress}%</p>
            <p className="text-xs text-blue-500">Avg Progress</p>
          </div>
        </div>

        {/* Top Goals */}
        <div className="space-y-3">
          {goals.map((goal, index) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/60 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 text-sm">{goal.name}</h4>
                  <span className="text-xs font-medium text-blue-600">
                    {Math.min(progress, 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-2" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{formatCurrency(goal.currentAmount)}</span>
                  <span>{formatCurrency(goal.targetAmount)}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <Button
          onClick={() => router.push('/goals')}
          variant="outline"
          className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Manage Goals
        </Button>
      </CardContent>
    </Card>
  );
}
