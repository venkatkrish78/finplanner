
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { Loan, LoanType } from '@/lib/types';

const Chart = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">Loading chart...</div>
});

const PieChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">Loading chart...</div>
});

interface LoanAnalyticsProps {
  loans: Loan[];
}

const loanTypeColors = {
  [LoanType.HOME_LOAN]: '#3B82F6',
  [LoanType.PERSONAL_LOAN]: '#EF4444',
  [LoanType.CAR_LOAN]: '#10B981',
  [LoanType.EDUCATION_LOAN]: '#8B5CF6',
  [LoanType.CREDIT_CARD]: '#F59E0B',
  [LoanType.BUSINESS_LOAN]: '#6366F1',
  [LoanType.GOLD_LOAN]: '#F59E0B',
  [LoanType.OTHER]: '#6B7280'
};

export function LoanAnalytics({ loans }: LoanAnalyticsProps) {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // Calculate loan distribution by type
  const loanTypeData = loans.reduce((acc, loan) => {
    acc[loan.loanType] = (acc[loan.loanType] || 0) + loan.currentBalance;
    return acc;
  }, {} as Record<LoanType, number>);

  const pieChartData = {
    labels: Object.keys(loanTypeData).map(type => {
      const typeLabels = {
        [LoanType.HOME_LOAN]: 'Home Loan',
        [LoanType.PERSONAL_LOAN]: 'Personal Loan',
        [LoanType.CAR_LOAN]: 'Car Loan',
        [LoanType.EDUCATION_LOAN]: 'Education Loan',
        [LoanType.CREDIT_CARD]: 'Credit Card',
        [LoanType.BUSINESS_LOAN]: 'Business Loan',
        [LoanType.GOLD_LOAN]: 'Gold Loan',
        [LoanType.OTHER]: 'Other'
      };
      return typeLabels[type as LoanType];
    }),
    datasets: [
      {
        data: Object.values(loanTypeData),
        backgroundColor: Object.keys(loanTypeData).map(type => loanTypeColors[type as LoanType]),
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const pieChartOptions = {
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

  // Prepare data for loan comparison chart
  const barChartData = {
    labels: loans.map(loan => loan.name.length > 15 ? loan.name.substring(0, 15) + '...' : loan.name),
    datasets: [
      {
        label: 'Outstanding Balance',
        data: loans.map(loan => loan.currentBalance),
        backgroundColor: '#EF4444',
        borderRadius: 4
      },
      {
        label: 'Monthly EMI',
        data: loans.map(loan => loan.emiAmount),
        backgroundColor: '#F59E0B',
        borderRadius: 4
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '₹' + (value / 1000) + 'K';
          }
        }
      }
    }
  };

  // Generate amortization schedule for selected loan
  const generateAmortizationSchedule = (loan: Loan) => {
    const schedule = [];
    const P = loan.principalAmount;
    const R = loan.interestRate / 100 / 12;
    const N = loan.tenure;
    const emi = loan.emiAmount;

    let balance = P;
    for (let month = 1; month <= Math.min(N, 12); month++) { // Show first 12 months
      const interestPayment = balance * R;
      const principalPayment = Math.min(emi - interestPayment, balance);
      balance = Math.max(0, balance - principalPayment);

      schedule.push({
        month,
        emi: Math.round(emi),
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        balance: Math.round(balance)
      });
    }

    return schedule;
  };

  if (loans.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No loan data to analyze</h3>
          <p className="text-gray-600 text-center">
            Add some loans to see detailed analytics and insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-600" />
              Debt Distribution by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <PieChart data={pieChartData} options={pieChartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Loan Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Chart data={barChartData} options={barChartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Details */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-purple-600" />
            Loan Details & Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loans.map((loan, index) => {
            const paidAmount = loan.principalAmount - loan.currentBalance;
            const progress = loan.principalAmount > 0 ? (paidAmount / loan.principalAmount) * 100 : 0;
            const monthsRemaining = loan.endDate 
              ? Math.ceil((new Date(loan.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))
              : null;

            return (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900">{loan.name}</h4>
                    <Badge 
                      style={{ 
                        backgroundColor: `${loanTypeColors[loan.loanType]}20`,
                        color: loanTypeColors[loan.loanType],
                        border: `1px solid ${loanTypeColors[loan.loanType]}40`
                      }}
                    >
                      {loan.loanType.replace('_', ' ')}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLoan(selectedLoan?.id === loan.id ? null : loan)}
                  >
                    {selectedLoan?.id === loan.id ? 'Hide Schedule' : 'View Schedule'}
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Outstanding</p>
                    <p className="font-semibold text-red-600">
                      {formatCurrency(loan.currentBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monthly EMI</p>
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(loan.emiAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Interest Rate</p>
                    <p className="font-semibold text-purple-600">
                      {loan.interestRate}% p.a.
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Progress</p>
                    <p className="font-semibold text-green-600">
                      {progress.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Repayment Progress</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {loan.endDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {monthsRemaining !== null && monthsRemaining > 0
                        ? `${monthsRemaining} months remaining`
                        : monthsRemaining === 0
                        ? 'Due this month'
                        : 'Completed'
                      }
                    </span>
                  </div>
                )}

                {/* Amortization Schedule */}
                {selectedLoan?.id === loan.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 rounded-lg p-4 mt-4"
                  >
                    <h5 className="font-semibold text-gray-900 mb-3">
                      Amortization Schedule (First 12 months)
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Month</th>
                            <th className="text-right p-2">EMI</th>
                            <th className="text-right p-2">Principal</th>
                            <th className="text-right p-2">Interest</th>
                            <th className="text-right p-2">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generateAmortizationSchedule(loan).map((row) => (
                            <tr key={row.month} className="border-b">
                              <td className="p-2">{row.month}</td>
                              <td className="text-right p-2">{formatCurrency(row.emi)}</td>
                              <td className="text-right p-2 text-green-600">{formatCurrency(row.principal)}</td>
                              <td className="text-right p-2 text-red-600">{formatCurrency(row.interest)}</td>
                              <td className="text-right p-2">{formatCurrency(row.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
