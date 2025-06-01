
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get last 6 months of data for trends
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    // Get summary stats for current month
    const currentMonthStart = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    const currentMonthEnd = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0, 23, 59, 59);

    const [incomeResult, expenseResult, totalTransactions, categoryStats] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          type: 'INCOME',
          date: { gte: currentMonthStart, lte: currentMonthEnd }
        },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: {
          type: 'EXPENSE',
          date: { gte: currentMonthStart, lte: currentMonthEnd }
        },
        _sum: { amount: true }
      }),
      prisma.transaction.count(),
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          type: 'EXPENSE',
          date: { gte: currentMonthStart, lte: currentMonthEnd }
        },
        _sum: { amount: true }
      })
    ]);

    // Get category details for stats
    const categoryIds = categoryStats.map(stat => stat.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } }
    });

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, any>);

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpenses = expenseResult._sum.amount || 0;
    const balance = totalIncome - totalExpenses;

    // Generate monthly data for the last 6 months
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const [monthIncome, monthExpense] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            type: 'INCOME',
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
          where: {
            type: 'EXPENSE',
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        })
      ]);

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        income: monthIncome._sum.amount || 0,
        expenses: monthExpense._sum.amount || 0
      });
    }

    // Format category data
    const categoryData = categoryStats.map(stat => ({
      category: categoryMap[stat.categoryId]?.name || 'Unknown',
      amount: stat._sum.amount || 0,
      color: categoryMap[stat.categoryId]?.color || '#6B7280'
    }));

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: totalTransactions,
      monthlyData,
      categoryData
    });
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction stats' },
      { status: 500 }
    );
  }
}
