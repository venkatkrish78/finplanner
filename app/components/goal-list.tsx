
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, TrendingUp, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AddGoalContributionDialog } from '@/components/add-goal-contribution-dialog';
import { formatCurrency } from '@/lib/currency';
import { FinancialGoal, GoalType, GoalStatus } from '@/lib/types';

interface GoalListProps {
  goals: FinancialGoal[];
  onGoalUpdated: () => void;
}

const goalTypeColors = {
  [GoalType.SAVINGS]: 'bg-green-100 text-green-800',
  [GoalType.DEBT_PAYOFF]: 'bg-red-100 text-red-800',
  [GoalType.INVESTMENT]: 'bg-blue-100 text-blue-800',
  [GoalType.EMERGENCY_FUND]: 'bg-orange-100 text-orange-800',
  [GoalType.EDUCATION]: 'bg-purple-100 text-purple-800',
  [GoalType.HOUSE]: 'bg-indigo-100 text-indigo-800',
  [GoalType.VACATION]: 'bg-pink-100 text-pink-800',
  [GoalType.RETIREMENT]: 'bg-gray-100 text-gray-800',
  [GoalType.OTHER]: 'bg-yellow-100 text-yellow-800'
};

const goalTypeLabels = {
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

export function GoalList({ goals, onGoalUpdated }: GoalListProps) {
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [isContributionDialogOpen, setIsContributionDialogOpen] = useState(false);

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onGoalUpdated();
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleMarkComplete = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: GoalStatus.COMPLETED })
      });

      if (response.ok) {
        onGoalUpdated();
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleAddContribution = (goal: FinancialGoal) => {
    setSelectedGoal(goal);
    setIsContributionDialogOpen(true);
  };

  const handleContributionAdded = () => {
    onGoalUpdated();
    setIsContributionDialogOpen(false);
    setSelectedGoal(null);
  };

  if (goals.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals yet</h3>
          <p className="text-gray-600 text-center mb-4">
            Start by creating your first financial goal to track your progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal, index) => {
          const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const isCompleted = goal.status === GoalStatus.COMPLETED;
          const daysRemaining = goal.targetDate 
            ? Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : null;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        {goal.name}
                        {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </CardTitle>
                      <Badge className={goalTypeColors[goal.goalType]}>
                        {goalTypeLabels[goal.goalType]}
                      </Badge>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddContribution(goal)}
                        disabled={isCompleted}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {goal.description && (
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{Math.min(progress, 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Current</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(goal.currentAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Target</p>
                      <p className="font-semibold text-blue-600">
                        {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                  </div>

                  {goal.targetDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {daysRemaining !== null && daysRemaining > 0
                          ? `${daysRemaining} days remaining`
                          : daysRemaining === 0
                          ? 'Due today'
                          : 'Overdue'
                        }
                      </span>
                    </div>
                  )}

                  {!isCompleted && progress < 100 && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddContribution(goal)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Contribution
                      </Button>
                      {progress >= 100 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkComplete(goal.id)}
                          className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  )}

                  {isCompleted && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Goal Completed!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {selectedGoal && (
        <AddGoalContributionDialog
          open={isContributionDialogOpen}
          onOpenChange={setIsContributionDialogOpen}
          goal={selectedGoal}
          onContributionAdded={handleContributionAdded}
        />
      )}
    </>
  );
}
