
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, TrendingDown, Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AddLoanPaymentDialog } from '@/components/add-loan-payment-dialog';
import EditLoanDialog from '@/components/edit-loan-dialog';
import DeleteLoanDialog from '@/components/delete-loan-dialog';
import LoanDetailModal from '@/components/loan-detail-modal';
import { formatCurrency } from '@/lib/currency';
import { Loan, LoanType } from '@/lib/types';

interface LoanListProps {
  loans: Loan[];
  onLoanUpdated: () => void;
}

const loanTypeColors = {
  [LoanType.HOME_LOAN]: 'bg-blue-100 text-blue-800',
  [LoanType.PERSONAL_LOAN]: 'bg-red-100 text-red-800',
  [LoanType.CAR_LOAN]: 'bg-green-100 text-green-800',
  [LoanType.EDUCATION_LOAN]: 'bg-purple-100 text-purple-800',
  [LoanType.CREDIT_CARD]: 'bg-orange-100 text-orange-800',
  [LoanType.BUSINESS_LOAN]: 'bg-indigo-100 text-indigo-800',
  [LoanType.GOLD_LOAN]: 'bg-yellow-100 text-yellow-800',
  [LoanType.OTHER]: 'bg-gray-100 text-gray-800'
};

const loanTypeLabels = {
  [LoanType.HOME_LOAN]: 'Home Loan',
  [LoanType.PERSONAL_LOAN]: 'Personal Loan',
  [LoanType.CAR_LOAN]: 'Car Loan',
  [LoanType.EDUCATION_LOAN]: 'Education Loan',
  [LoanType.CREDIT_CARD]: 'Credit Card',
  [LoanType.BUSINESS_LOAN]: 'Business Loan',
  [LoanType.GOLD_LOAN]: 'Gold Loan',
  [LoanType.OTHER]: 'Other'
};

export function LoanList({ loans, onLoanUpdated }: LoanListProps) {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailLoanId, setDetailLoanId] = useState<string | null>(null);

  const handleEdit = (loan: Loan) => {
    setSelectedLoan(loan);
    setEditDialogOpen(true);
  };

  const handleDelete = (loan: Loan) => {
    setSelectedLoan(loan);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSelectedLoan(null);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
  };

  const handleAddPayment = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentAdded = () => {
    onLoanUpdated();
    setIsPaymentDialogOpen(false);
    setSelectedLoan(null);
  };

  if (loans.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No loans yet</h3>
          <p className="text-gray-600 text-center mb-4">
            Add your loans to track payments and manage your debt effectively.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loans.map((loan, index) => {
          const paidAmount = loan.principalAmount - loan.currentBalance;
          const progress = loan.principalAmount > 0 ? (paidAmount / loan.principalAmount) * 100 : 0;
          const monthsRemaining = loan.endDate 
            ? Math.ceil((new Date(loan.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))
            : null;

          return (
            <motion.div
              key={loan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
              onClick={() => setDetailLoanId(loan.id)}
            >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-red-600" />
                        {loan.name}
                      </CardTitle>
                      <Badge className={loanTypeColors[loan.loanType]}>
                        {loanTypeLabels[loan.loanType]}
                      </Badge>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(loan)
                        }}
                        title="Edit Loan"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddPayment(loan)
                        }}
                        title="Make Payment"
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(loan)
                        }}
                        title="Delete Loan"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {loan.description && (
                    <p className="text-sm text-gray-600">{loan.description}</p>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Repayment Progress</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Outstanding</p>
                      <p className="font-semibold text-red-600">
                        {formatCurrency(loan.currentBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Principal</p>
                      <p className="font-semibold text-blue-600">
                        {formatCurrency(loan.principalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Interest Rate</p>
                      <p className="font-semibold text-purple-600">
                        {loan.interestRate}% p.a.
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">EMI</p>
                      <p className="font-semibold text-orange-600">
                        {formatCurrency(loan.emiAmount)}
                      </p>
                    </div>
                  </div>

                  {loan.endDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {monthsRemaining !== null && monthsRemaining > 0
                          ? `${monthsRemaining} months remaining`
                          : monthsRemaining === 0
                          ? 'Due this month'
                          : 'Overdue'
                        }
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddPayment(loan)
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Make Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {selectedLoan && (
        <AddLoanPaymentDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          loan={selectedLoan}
          onPaymentAdded={handlePaymentAdded}
        />
      )}

      {/* Edit Loan Dialog */}
      <EditLoanDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) handleDialogClose()
        }}
        loan={selectedLoan}
        onLoanUpdated={onLoanUpdated}
      />

      {/* Delete Loan Dialog */}
      <DeleteLoanDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) handleDialogClose()
        }}
        loan={selectedLoan}
        onLoanDeleted={onLoanUpdated}
      />

      {/* Detail Modal */}
      <LoanDetailModal
        open={!!detailLoanId}
        onOpenChange={(open) => !open && setDetailLoanId(null)}
        loanId={detailLoanId}
        onLoanUpdated={onLoanUpdated}
      />
    </>
  );
}
