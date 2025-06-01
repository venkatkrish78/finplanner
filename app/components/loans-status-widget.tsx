
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Banknote, ArrowRight, Calendar, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/currency';
import Link from 'next/link';
import { format } from 'date-fns';

interface Loan {
  id: string;
  name: string;
  totalAmount: number;
  outstandingAmount: number;
  progress: number;
  nextDueDate: Date | null;
  emiAmount: number;
}

interface LoansStatusWidgetProps {
  loans: Loan[];
}

export function LoansStatusWidget({ loans }: LoansStatusWidgetProps) {
  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);
  const totalAmount = loans.reduce((sum, loan) => sum + loan.totalAmount, 0);
  const overallProgress = totalAmount > 0 ? ((totalAmount - totalOutstanding) / totalAmount) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-50 rounded-lg">
            <Banknote className="h-5 w-5 text-red-600" />
          </div>
          <CardTitle className="text-lg">Loan Status</CardTitle>
        </div>
        <Link href="/loans">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {loans.length === 0 ? (
          <div className="text-center py-8">
            <Banknote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No active loans</p>
            <Link href="/loans">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Loan
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Overall Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Outstanding</span>
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(totalOutstanding)}
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {overallProgress.toFixed(1)}% paid off
              </div>
            </div>

            {/* Individual Loans */}
            <div className="space-y-3">
              {loans.slice(0, 3).map((loan, index) => (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">{loan.name}</h4>
                    <span className="text-sm text-red-600 font-medium">
                      {formatCurrency(loan.outstandingAmount)}
                    </span>
                  </div>
                  <Progress value={loan.progress} className="h-1.5" />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{loan.progress.toFixed(1)}% paid</span>
                    {loan.nextDueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Due {format(new Date(loan.nextDueDate), 'MMM dd')}</span>
                      </div>
                    )}
                  </div>
                  {loan.emiAmount > 0 && (
                    <div className="text-xs text-muted-foreground">
                      EMI: {formatCurrency(loan.emiAmount)}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {loans.length > 3 && (
              <div className="text-center">
                <Link href="/loans">
                  <Button variant="outline" size="sm">
                    View {loans.length - 3} more loans
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
