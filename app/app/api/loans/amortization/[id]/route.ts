
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: params.id },
      include: {
        payments: {
          orderBy: { paymentDate: 'asc' }
        }
      }
    });

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    // Generate amortization schedule
    const P = loan.principalAmount;
    const R = loan.interestRate / 100 / 12;
    const N = loan.tenure;
    const emi = loan.emiAmount;

    const schedule = [];
    let balance = P;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;

    // Track actual payments
    const paymentsByMonth = new Map();
    loan.payments.forEach(payment => {
      const monthsSinceStart = Math.floor(
        (payment.paymentDate.getTime() - loan.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      ) + 1;
      
      if (!paymentsByMonth.has(monthsSinceStart)) {
        paymentsByMonth.set(monthsSinceStart, []);
      }
      paymentsByMonth.get(monthsSinceStart).push(payment);
    });

    for (let month = 1; month <= N && balance > 0; month++) {
      const interestPayment = balance * R;
      const principalPayment = Math.min(emi - interestPayment, balance);
      
      // Check if there are actual payments for this month
      const actualPayments = paymentsByMonth.get(month) || [];
      const actualAmount = actualPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
      const actualPrincipal = actualPayments.reduce((sum: number, p: any) => sum + p.principalPaid, 0);
      const actualInterest = actualPayments.reduce((sum: number, p: any) => sum + p.interestPaid, 0);

      balance = Math.max(0, balance - principalPayment);
      totalInterestPaid += interestPayment;
      totalPrincipalPaid += principalPayment;

      schedule.push({
        month,
        scheduledEmi: Math.round(emi),
        scheduledPrincipal: Math.round(principalPayment),
        scheduledInterest: Math.round(interestPayment),
        scheduledBalance: Math.round(balance),
        actualAmount: Math.round(actualAmount),
        actualPrincipal: Math.round(actualPrincipal),
        actualInterest: Math.round(actualInterest),
        isPaid: actualPayments.length > 0,
        payments: actualPayments
      });
    }

    return NextResponse.json({
      loan,
      schedule,
      summary: {
        totalScheduledAmount: Math.round(emi * N),
        totalScheduledInterest: Math.round(totalInterestPaid),
        remainingBalance: Math.round(loan.currentBalance),
        completionPercentage: Math.round(((P - loan.currentBalance) / P) * 100)
      }
    });
  } catch (error) {
    console.error('Error generating amortization schedule:', error);
    return NextResponse.json(
      { error: 'Failed to generate amortization schedule' },
      { status: 500 }
    );
  }
}
