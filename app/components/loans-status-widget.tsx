
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Banknote, ArrowRight, Plus, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/currency';
import Link from 'next/link';

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
  onDataChange?: () => void;
}

export function LoansStatusWidget({ loans, onDataChange }: LoansStatusWidgetProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300">
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
      <CardContent className="space-y-4 pb-6">
        {loans.length === 0 ? (
          <div className="text-center py-8">
            <Banknote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No loans tracked</p>
            <Link href="/loans">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Loan
              </Button>
            </Link>
          </div>
        ) : (
          loans.slice(0, 2).map((loan, index) => (
            <motion.div
              key={loan.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-sm truncate pr-2">{loan.name}</h4>
                <span className="text-xs text-muted-foreground">
                  {loan.progress.toFixed(1)}% paid
                </span>
              </div>
              
              <Progress value={loan.progress} className="h-2" />
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outstanding:</span>
                  <span className="font-medium">{formatCurrency(loan.outstandingAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">EMI Amount:</span>
                  <span className="font-medium">{formatCurrency(loan.emiAmount)}</span>
                </div>
                {loan.nextDueDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Next Due:</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">{formatDate(loan.nextDueDate)}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
        {loans.length > 2 && (
          <div className="text-center pt-2">
            <Link href="/loans">
              <Button variant="outline" size="sm">
                View {loans.length - 2} More Loans
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
