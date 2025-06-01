
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const monthParam = searchParams.get('month');
    const month = monthParam ? parseInt(monthParam) : null;

    // Get monthly trends for the year including all transaction sources
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);
    
    const monthlyTrends = [];
    for (let monthNum = 1; monthNum <= 12; monthNum++) {
      const startOfMonth = new Date(year, monthNum - 1, 1);
      const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);
      
      // Get all transactions (regular, bills, loans, investments)
      const [incomeData, expenseData] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            date: { gte: startOfMonth, lte: endOfMonth },
            type: 'INCOME'
          },
          _sum: { amount: true },
          _count: true
        }),
        prisma.transaction.aggregate({
          where: {
            date: { gte: startOfMonth, lte: endOfMonth },
            type: 'EXPENSE'
          },
          _sum: { amount: true },
          _count: true
        })
      ]);
      
      monthlyTrends.push({
        month: monthNum,
        year: year,
        income: incomeData._sum.amount || 0,
        expense: expenseData._sum.amount || 0,
        transaction_count: incomeData._count + expenseData._count
      });
    }

    // Get category breakdown
    let dateFilter = {
      date: { gte: startOfYear, lte: endOfYear }
    };
    
    if (month) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);
      dateFilter = {
        date: { gte: startOfMonth, lte: endOfMonth }
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: dateFilter,
      include: { category: true }
    });

    const categoryBreakdown = transactions.reduce((acc: any[], transaction) => {
      const key = `${transaction.category?.name}-${transaction.type}`;
      const existing = acc.find(item => 
        item.category_name === transaction.category?.name && 
        item.transaction_type === transaction.type
      );
      
      if (existing) {
        existing.total_amount += transaction.amount;
        existing.transaction_count += 1;
      } else {
        acc.push({
          category_name: transaction.category?.name || 'Uncategorized',
          category_color: transaction.category?.color || '#3B82F6',
          transaction_type: transaction.type,
          total_amount: transaction.amount,
          transaction_count: 1
        });
      }
      
      return acc;
    }, []);

    // Get monthly summary if month is specified
    let monthlySummary = null;
    if (month) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);
      
      const [incomeData, expenseData, totalCount] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            date: { gte: startOfMonth, lte: endOfMonth },
            type: 'INCOME'
          },
          _sum: { amount: true },
          _count: true
        }),
        prisma.transaction.aggregate({
          where: {
            date: { gte: startOfMonth, lte: endOfMonth },
            type: 'EXPENSE'
          },
          _sum: { amount: true },
          _count: true
        }),
        prisma.transaction.count({
          where: {
            date: { gte: startOfMonth, lte: endOfMonth }
          }
        })
      ]);
      
      monthlySummary = {
        total_income: incomeData._sum.amount || 0,
        total_expense: expenseData._sum.amount || 0,
        total_transactions: totalCount,
        income_count: incomeData._count,
        expense_count: expenseData._count
      };
    }

    // Get yearly summary
    const [yearlyIncomeData, yearlyExpenseData, yearlyTotalCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          date: { gte: startOfYear, lte: endOfYear },
          type: 'INCOME'
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: {
          date: { gte: startOfYear, lte: endOfYear },
          type: 'EXPENSE'
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.count({
        where: {
          date: { gte: startOfYear, lte: endOfYear }
        }
      })
    ]);
    
    const yearlySummary = {
      total_income: yearlyIncomeData._sum.amount || 0,
      total_expense: yearlyExpenseData._sum.amount || 0,
      total_transactions: yearlyTotalCount,
      income_count: yearlyIncomeData._count,
      expense_count: yearlyExpenseData._count
    };

    return NextResponse.json({
      monthlyTrends: monthlyTrends || [],
      categoryBreakdown: categoryBreakdown || [],
      monthlySummary: monthlySummary || null,
      yearlySummary: yearlySummary || null,
      year,
      month
    });
  } catch (error) {
    console.error('Error fetching transaction analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction analytics' },
      { status: 500 }
    );
  }
}
