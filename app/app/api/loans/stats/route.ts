
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [loans, payments] = await Promise.all([
      prisma.loan.findMany({
        include: {
          payments: true
        }
      }),
      prisma.loanPayment.aggregate({
        _sum: {
          interestPaid: true
        }
      })
    ]);

    const totalLoans = loans.length;
    const totalDebt = loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
    const monthlyEMI = loans.reduce((sum, loan) => sum + loan.emiAmount, 0);
    const totalInterestPaid = payments._sum.interestPaid || 0;
    
    const totalInterestRate = loans.reduce((sum, loan) => sum + loan.interestRate, 0);
    const averageInterestRate = loans.length > 0 ? totalInterestRate / loans.length : 0;

    const stats = {
      totalLoans,
      totalDebt,
      monthlyEMI,
      totalInterestPaid,
      averageInterestRate: Math.round(averageInterestRate * 100) / 100
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching loan stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loan stats' },
      { status: 500 }
    );
  }
}
