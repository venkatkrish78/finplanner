
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Target, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/currency';
import { GoalCalculation } from '@/lib/types';

export function GoalCalculator() {
  const [calculation, setCalculation] = useState<GoalCalculation | null>(null);
  const [loading, setLoading] = useState(false);

  // Target Date Calculator
  const [targetDateForm, setTargetDateForm] = useState({
    targetAmount: '',
    currentAmount: '',
    targetDate: ''
  });

  // Monthly Contribution Calculator
  const [monthlyForm, setMonthlyForm] = useState({
    targetAmount: '',
    currentAmount: '',
    monthlyContribution: ''
  });

  const calculateByTargetDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/goals/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetDateForm)
      });

      if (response.ok) {
        const data = await response.json();
        setCalculation(data);
      }
    } catch (error) {
      console.error('Error calculating goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateByMonthlyContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/goals/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(monthlyForm)
      });

      if (response.ok) {
        const data = await response.json();
        setCalculation(data);
      }
    } catch (error) {
      console.error('Error calculating goal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Goal Planning Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="target-date" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="target-date">By Target Date</TabsTrigger>
              <TabsTrigger value="monthly">By Monthly Savings</TabsTrigger>
            </TabsList>

            <TabsContent value="target-date" className="space-y-6">
              <form onSubmit={calculateByTargetDate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount1">Target Amount (₹)</Label>
                    <Input
                      id="targetAmount1"
                      type="number"
                      value={targetDateForm.targetAmount}
                      onChange={(e) => setTargetDateForm({ ...targetDateForm, targetAmount: e.target.value })}
                      placeholder="500000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentAmount1">Current Amount (₹)</Label>
                    <Input
                      id="currentAmount1"
                      type="number"
                      value={targetDateForm.currentAmount}
                      onChange={(e) => setTargetDateForm({ ...targetDateForm, currentAmount: e.target.value })}
                      placeholder="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={targetDateForm.targetDate}
                      onChange={(e) => setTargetDateForm({ ...targetDateForm, targetDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Calculating...' : 'Calculate Monthly Requirement'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-6">
              <form onSubmit={calculateByMonthlyContribution} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount2">Target Amount (₹)</Label>
                    <Input
                      id="targetAmount2"
                      type="number"
                      value={monthlyForm.targetAmount}
                      onChange={(e) => setMonthlyForm({ ...monthlyForm, targetAmount: e.target.value })}
                      placeholder="500000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentAmount2">Current Amount (₹)</Label>
                    <Input
                      id="currentAmount2"
                      type="number"
                      value={monthlyForm.currentAmount}
                      onChange={(e) => setMonthlyForm({ ...monthlyForm, currentAmount: e.target.value })}
                      placeholder="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyContribution">Monthly Savings (₹)</Label>
                    <Input
                      id="monthlyContribution"
                      type="number"
                      value={monthlyForm.monthlyContribution}
                      onChange={(e) => setMonthlyForm({ ...monthlyForm, monthlyContribution: e.target.value })}
                      placeholder="10000"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Calculating...' : 'Calculate Time to Goal'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results */}
      {calculation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Monthly Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(calculation.monthlyRequired)}
              </div>
              <p className="text-xs text-blue-600 mt-1">Per month to reach goal</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Time to Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {calculation.timeToGoal} months
              </div>
              <p className="text-xs text-green-600 mt-1">
                {Math.floor(calculation.timeToGoal / 12)} years {calculation.timeToGoal % 12} months
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Target Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {new Date(calculation.projectedDate).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
              <p className="text-xs text-purple-600 mt-1">Projected completion</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tips */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-orange-800">💡 Goal Planning Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-orange-700 mb-2">Emergency Fund</h4>
              <p className="text-orange-600">Aim for 6-12 months of expenses as your emergency fund target.</p>
            </div>
            <div>
              <h4 className="font-semibold text-orange-700 mb-2">House Down Payment</h4>
              <p className="text-orange-600">Typically 10-20% of property value plus additional costs.</p>
            </div>
            <div>
              <h4 className="font-semibold text-orange-700 mb-2">Retirement Planning</h4>
              <p className="text-orange-600">Start early and aim for 10-15x your annual income by retirement.</p>
            </div>
            <div>
              <h4 className="font-semibold text-orange-700 mb-2">Education Fund</h4>
              <p className="text-orange-600">Consider inflation when planning for future education costs.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
