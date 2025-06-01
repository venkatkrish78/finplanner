
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/currency';
import Link from 'next/link';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  remainingAmount: number;
}

interface GoalsProgressWidgetProps {
  goals: Goal[];
}

export function GoalsProgressWidget({ goals }: GoalsProgressWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-50 rounded-lg">
            <Target className="h-5 w-5 text-green-600" />
          </div>
          <CardTitle className="text-lg">Goals Progress</CardTitle>
        </div>
        <Link href="/goals">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No goals set yet</p>
            <Link href="/goals">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </Link>
          </div>
        ) : (
          goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-sm">{goal.name}</h4>
                <span className="text-sm text-muted-foreground">
                  {goal.progress.toFixed(1)}%
                </span>
              </div>
              <Progress value={goal.progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(goal.currentAmount)} saved</span>
                <span>{formatCurrency(goal.remainingAmount)} remaining</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Target: {formatCurrency(goal.targetAmount)}
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
