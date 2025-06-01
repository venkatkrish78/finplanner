
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loanId, amount, paymentType, note, createTransaction } = body;

    const result = await prisma.$transaction(async (tx) => {
      // Get loan details
      const loan = await tx.loan.findUnique({
        where: { id: loanId }
      });

      if (!loan) {
        throw new Error('Loan not found');
      }

      // Calculate principal and interest components
      const paymentAmount = parseFloat(amount);
      const monthlyRate = loan.interestRate / 100 / 12;
      const interestPaid = loan.currentBalance * monthlyRate;
      const principalPaid = Math.max(0, paymentAmount - interestPaid);

      // Create the payment
      const payment = await tx.loanPayment.create({
        data: {
          loanId,
          amount: paymentAmount,
          paymentType,
          principalPaid,
          interestPaid: Math.min(interestPaid, paymentAmount),
          note,
          paymentDate: new Date()
        }
      });

      // Update loan balance
      const newBalance = Math.max(0, loan.currentBalance - principalPaid);
      await tx.loan.update({
        where: { id: loanId },
        data: {
          currentBalance: newBalance
        }
      });

      // Create transaction if requested
      let transaction = null;
      if (createTransaction) {
        // Find or create a default loan category
        let category = await tx.category.findFirst({
          where: { name: 'Loan Payment' }
        });

        if (!category) {
          category = await tx.category.create({
            data: {
              name: 'Loan Payment',
              color: '#EF4444',
              isDefault: true
            }
          });
        }

        transaction = await tx.transaction.create({
          data: {
            amount: paymentAmount,
            type: 'EXPENSE',
            description: `Loan payment: ${loan.name}`,
            date: new Date(),
            categoryId: category.id,
            source: 'MANUAL'
          }
        });

        // Link the transaction to the payment
        await tx.loanPayment.update({
          where: { id: payment.id },
          data: { transactionId: transaction.id }
        });
      }

      return { payment, loan: { ...loan, currentBalance: newBalance }, transaction };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating loan payment:', error);
    return NextResponse.json(
      { error: 'Failed to create loan payment' },
      { status: 500 }
    );
  }
}
