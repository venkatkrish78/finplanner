
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
      
      // Get all transactions including related transactions from bills, loans, investments
      const [incomeData, expenseData, billPayments, loanPayments, investmentTransactions] = await Promise.all([
        // Regular income transactions
        prisma.transaction.aggregate({
          where: {
            date: { gte: startOfMonth, lte: endOfMonth },
            type: 'INCOME'
          },
          _sum: { amount: true },
          _count: true
        }),
        // Regular expense transactions
        prisma.transaction.aggregate({
          where: {
            date: { gte: startOfMonth, lte: endOfMonth },
            type: 'EXPENSE'
          },
          _sum: { amount: true },
          _count: true
        }),
        // Bill payments (these are already included in transactions but let's ensure completeness)
        prisma.billInstance.findMany({
          where: {
            paidDate: { gte: startOfMonth, lte: endOfMonth },
            status: 'PAID'
          },
          include: { transaction: true }
        }),
        // Loan payments (these are already included in transactions but let's ensure completeness)
        prisma.loanPayment.findMany({
          where: {
            paymentDate: { gte: startOfMonth, lte: endOfMonth }
          },
          include: { transaction: true }
        }),
        // Investment transactions that affect cash flow
        prisma.investmentTransaction.findMany({
          where: {
            date: { gte: startOfMonth, lte: endOfMonth },
            type: { in: ['BUY', 'SELL'] } // Only transactions that affect cash flow
          },
          include: { transaction: true }
        })
      ]);
      
      // Calculate additional income/expenses from related transactions
      let additionalIncome = 0;
      let additionalExpenses = 0;
      let additionalCount = 0;

      // Add investment sell transactions as income (if not already counted)
      investmentTransactions.forEach(invTxn => {
        if (invTxn.type === 'SELL' && !invTxn.transaction) {
          additionalIncome += invTxn.amount;
          additionalCount++;
        } else if (invTxn.type === 'BUY' && !invTxn.transaction) {
          additionalExpenses += invTxn.amount;
          additionalCount++;
        }
      });

      // Add bill payments that might not be in regular transactions
      billPayments.forEach(bill => {
        if (!bill.transaction) {
          additionalExpenses += bill.amount;
          additionalCount++;
        }
      });

      // Add loan payments that might not be in regular transactions
      loanPayments.forEach(payment => {
        if (!payment.transaction) {
          additionalExpenses += payment.amount;
          additionalCount++;
        }
      });
      
      monthlyTrends.push({
        month: monthNum,
        year: year,
        income: (incomeData._sum.amount || 0) + additionalIncome,
        expense: (expenseData._sum.amount || 0) + additionalExpenses,
        transaction_count: incomeData._count + expenseData._count + additionalCount
      });
    }

    // Get category breakdown including all transaction sources
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

    // Get all transactions for the period
    const transactions = await prisma.transaction.findMany({
      where: dateFilter,
      include: { category: true }
    });

    // Get additional transactions from bills, loans, and investments for the same period
    const [billInstances, loanPayments, investmentTransactions] = await Promise.all([
      prisma.billInstance.findMany({
        where: {
          paidDate: dateFilter.date,
          status: 'PAID'
        },
        include: { 
          bill: { include: { category: true } },
          transaction: true 
        }
      }),
      prisma.loanPayment.findMany({
        where: {
          paymentDate: dateFilter.date
        },
        include: { 
          loan: { include: { category: true } },
          transaction: true 
        }
      }),
      prisma.investmentTransaction.findMany({
        where: {
          date: dateFilter.date,
          type: { in: ['BUY', 'SELL'] }
        },
        include: { 
          investment: { include: { category: true } },
          transaction: true 
        }
      })
    ]);

    // Combine all transactions for category breakdown
    const allTransactionData = [...transactions];

    // Add bill payments that don't have corresponding transactions
    billInstances.forEach(billInstance => {
      if (!billInstance.transaction) {
        allTransactionData.push({
          id: `bill-${billInstance.id}`,
          amount: billInstance.amount,
          type: 'EXPENSE' as const,
          description: `Bill payment: ${billInstance.bill.name}`,
          date: billInstance.paidDate!,
          category: billInstance.bill.category,
          categoryId: billInstance.bill.categoryId
        } as any);
      }
    });

    // Add loan payments that don't have corresponding transactions
    loanPayments.forEach(payment => {
      if (!payment.transaction) {
        allTransactionData.push({
          id: `loan-${payment.id}`,
          amount: payment.amount,
          type: 'EXPENSE' as const,
          description: `Loan payment: ${payment.loan.name}`,
          date: payment.paymentDate,
          category: payment.loan.category,
          categoryId: payment.loan.categoryId
        } as any);
      }
    });

    // Add investment transactions that don't have corresponding transactions
    investmentTransactions.forEach(invTxn => {
      if (!invTxn.transaction) {
        allTransactionData.push({
          id: `investment-${invTxn.id}`,
          amount: invTxn.amount,
          type: invTxn.type === 'BUY' ? 'EXPENSE' : 'INCOME' as const,
          description: `Investment ${invTxn.type.toLowerCase()}: ${invTxn.investment.name}`,
          date: invTxn.date,
          category: invTxn.investment.category,
          categoryId: invTxn.investment.categoryId
        } as any);
      }
    });

    // Build category breakdown from all transaction data
    const categoryBreakdown = allTransactionData.reduce((acc: any[], transaction) => {
      const key = `${transaction.category?.name}-${transaction.type}`;
      const existing = acc.find(item => 
        item.category_name === (transaction.category?.name || 'Uncategorized') && 
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
      const monthData = monthlyTrends.find(trend => trend.month === month);
      if (monthData) {
        const monthTransactions = allTransactionData.filter(txn => {
          const txnDate = new Date(txn.date);
          return txnDate.getFullYear() === year && txnDate.getMonth() === month - 1;
        });
        
        const incomeCount = monthTransactions.filter(txn => txn.type === 'INCOME').length;
        const expenseCount = monthTransactions.filter(txn => txn.type === 'EXPENSE').length;
        
        monthlySummary = {
          total_income: monthData.income,
          total_expense: monthData.expense,
          total_transactions: monthData.transaction_count,
          income_count: incomeCount,
          expense_count: expenseCount
        };
      }
    }

    // Get yearly summary
    const yearlyIncome = monthlyTrends.reduce((sum, trend) => sum + trend.income, 0);
    const yearlyExpense = monthlyTrends.reduce((sum, trend) => sum + trend.expense, 0);
    const yearlyTransactionCount = monthlyTrends.reduce((sum, trend) => sum + trend.transaction_count, 0);
    
    const yearlyIncomeCount = allTransactionData.filter(txn => txn.type === 'INCOME').length;
    const yearlyExpenseCount = allTransactionData.filter(txn => txn.type === 'EXPENSE').length;
    
    const yearlySummary = {
      total_income: yearlyIncome,
      total_expense: yearlyExpense,
      total_transactions: yearlyTransactionCount,
      income_count: yearlyIncomeCount,
      expense_count: yearlyExpenseCount
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
