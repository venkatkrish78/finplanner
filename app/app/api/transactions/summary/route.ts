
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const monthParam = searchParams.get('month');
    const month = monthParam ? parseInt(monthParam) : null;

    let dateFilter = {};
    if (month) {
      // Monthly summary
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate
        }
      };
    } else {
      // Yearly summary
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate
        }
      };
    }

    const [incomeData, expenseData, transactionCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          ...dateFilter,
          type: 'INCOME'
        },
        _sum: {
          amount: true
        },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: {
          ...dateFilter,
          type: 'EXPENSE'
        },
        _sum: {
          amount: true
        },
        _count: true
      }),
      prisma.transaction.count({
        where: dateFilter
      })
    ]);

    const totalIncome = incomeData._sum.amount || 0;
    const totalExpense = expenseData._sum.amount || 0;
    const netBalance = totalIncome - totalExpense;

    return NextResponse.json({
      totalIncome,
      totalExpense,
      netBalance,
      incomeTransactions: incomeData._count,
      expenseTransactions: expenseData._count,
      totalTransactions: transactionCount,
      period: month ? `${year}-${month.toString().padStart(2, '0')}` : year.toString()
    });
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction summary' },
      { status: 500 }
    );
  }
}
