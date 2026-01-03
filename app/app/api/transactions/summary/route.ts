import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const monthParam = searchParams.get('month');
    const month = monthParam ? parseInt(monthParam) : null;

    let dateFilter: any = { userId: currentUser.id };
    let dateRange: { gte: Date; lte: Date };
    
    if (month) {
      // Monthly summary
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      dateRange = { gte: startDate, lte: endDate };
      dateFilter = { userId: currentUser.id, date: dateRange };
    } else {
      // Yearly summary
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      dateRange = { gte: startDate, lte: endDate };
      dateFilter = { userId: currentUser.id, date: dateRange };
    }

    console.log("=== SUMMARY API DEBUG ===")
    console.log("User ID:", currentUser.id)
    console.log("Date filter:", JSON.stringify(dateFilter, null, 2))

    // Get all transactions including related transactions from bills, loans, investments - user filtered
    const [incomeData, expenseData, transactionCount, billPayments, loanPayments, investmentTransactions] = await Promise.all([
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
      }),
      // Bill payments (these are already included in transactions but let's ensure completeness) - user filtered
      prisma.billInstance.findMany({
        where: {
          userId: currentUser.id,
          paidDate: dateRange,
          status: 'PAID'
        },
        include: { transaction: true }
      }),
      // Loan payments (these are already included in transactions but let's ensure completeness) - user filtered
      prisma.loanPayment.findMany({
        where: {
          userId: currentUser.id,
          paymentDate: dateRange
        },
        include: { transaction: true }
      }),
      // Investment transactions that affect cash flow - user filtered
      prisma.investmentTransaction.findMany({
        where: {
          userId: currentUser.id,
          date: dateRange,
          type: { in: ['BUY', 'SELL'] } // Only transactions that affect cash flow
        },
        include: { transaction: true }
      })
    ]);

    console.log("Income data:", incomeData)
    console.log("Expense data:", expenseData)
    console.log("Transaction count:", transactionCount)
    console.log("Bill payments:", billPayments.length)
    console.log("Loan payments:", loanPayments.length)
    console.log("Investment transactions:", investmentTransactions.length)

    // Calculate additional income/expenses from related transactions
    let additionalIncome = 0;
    let additionalExpenses = 0;
    let additionalIncomeCount = 0;
    let additionalExpenseCount = 0;

    // Add investment sell transactions as income (if not already counted)
    investmentTransactions.forEach(invTxn => {
      if (invTxn.type === 'SELL' && !invTxn.transaction) {
        additionalIncome += invTxn.amount;
        additionalIncomeCount++;
      } else if (invTxn.type === 'BUY' && !invTxn.transaction) {
        additionalExpenses += invTxn.amount;
        additionalExpenseCount++;
      }
    });

    // Add bill payments that might not be in regular transactions
    billPayments.forEach(bill => {
      if (!bill.transaction) {
        additionalExpenses += bill.amount;
        additionalExpenseCount++;
      }
    });

    // Add loan payments that might not be in regular transactions
    loanPayments.forEach(payment => {
      if (!payment.transaction) {
        additionalExpenses += payment.amount;
        additionalExpenseCount++;
      }
    });

    console.log("Additional income:", additionalIncome)
    console.log("Additional expenses:", additionalExpenses)
    console.log("Additional income count:", additionalIncomeCount)
    console.log("Additional expense count:", additionalExpenseCount)

    const totalIncome = (incomeData._sum.amount || 0) + additionalIncome;
    const totalExpense = (expenseData._sum.amount || 0) + additionalExpenses;
    const netBalance = totalIncome - totalExpense;
    const totalIncomeCount = incomeData._count + additionalIncomeCount;
    const totalExpenseCount = expenseData._count + additionalExpenseCount;
    const totalTransactionCount = transactionCount + additionalIncomeCount + additionalExpenseCount;

    console.log("Final totals - Income:", totalIncome, "Expense:", totalExpense, "Count:", totalTransactionCount)

    // Get total investments for the current month only (sum of INVESTMENT_BUY transactions in the period)
    const monthlyInvestments = await prisma.transaction.aggregate({
      where: {
        userId: currentUser.id,
        type: 'INVESTMENT_BUY',
        date: dateRange
      },
      _sum: { amount: true }
    }).catch(() => ({ _sum: { amount: 0 } }));

    return NextResponse.json({
      totalIncome,
      totalExpense,
      netBalance,
      totalInvestments: monthlyInvestments._sum.amount || 0,
      incomeTransactions: totalIncomeCount,
      expenseTransactions: totalExpenseCount,
      totalTransactions: totalTransactionCount,
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
