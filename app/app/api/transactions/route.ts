
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    const categoryId = searchParams.get('categoryId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Build date filter
    let dateFilter: any = {};
    if (year) {
      const yearNum = parseInt(year);
      if (month) {
        const monthNum = parseInt(month);
        const startOfMonth = new Date(yearNum, monthNum - 1, 1);
        const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59);
        dateFilter = { gte: startOfMonth, lte: endOfMonth };
      } else {
        const startOfYear = new Date(yearNum, 0, 1);
        const endOfYear = new Date(yearNum, 11, 31, 23, 59, 59);
        dateFilter = { gte: startOfYear, lte: endOfYear };
      }
    } else if (startDate || endDate) {
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }
    }

    // Get regular transactions
    const transactionWhere: any = {};
    if (Object.keys(dateFilter).length > 0) {
      transactionWhere.date = dateFilter;
    }
    if (type && type !== 'all') {
      transactionWhere.type = type;
    }
    if (categoryId && categoryId !== 'all') {
      transactionWhere.categoryId = categoryId;
    }
    if (search) {
      transactionWhere.OR = [
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          merchant: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Get all transaction sources (excluding investment transactions)
    const [regularTransactions, billInstances, loanPayments] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          ...transactionWhere,
          type: { notIn: ['INVESTMENT_BUY', 'INVESTMENT_SELL'] }
        },
        include: {
          category: true
        }
      }),
      // Get bill payments
      prisma.billInstance.findMany({
        where: {
          ...(Object.keys(dateFilter).length > 0 && { paidDate: dateFilter }),
          status: 'PAID'
        },
        include: { 
          bill: { include: { category: true } },
          transaction: true 
        }
      }),
      // Get loan payments
      prisma.loanPayment.findMany({
        where: {
          ...(Object.keys(dateFilter).length > 0 && { paymentDate: dateFilter })
        },
        include: { 
          loan: { include: { category: true } },
          transaction: true 
        }
      })
    ]);

    // Combine all transactions
    const allTransactions: any[] = [...regularTransactions];

    // Add bill payments that don't have corresponding transactions
    billInstances.forEach(billInstance => {
      if (!billInstance.transaction) {
        const billTransaction = {
          id: `bill-${billInstance.id}`,
          amount: billInstance.amount,
          type: 'EXPENSE' as const,
          description: `Bill payment: ${billInstance.bill.name}`,
          merchant: billInstance.bill.name,
          date: billInstance.paidDate!,
          category: billInstance.bill.category,
          categoryId: billInstance.bill.categoryId,
          status: 'SUCCESS',
          source: 'BILL',
          transactionId: `BILL-${billInstance.id}`,
          accountNumber: null,
          balance: null,
          rawMessage: null,
          createdAt: billInstance.createdAt,
          updatedAt: billInstance.updatedAt
        };
        allTransactions.push(billTransaction);
      }
    });

    // Add loan payments that don't have corresponding transactions
    loanPayments.forEach(payment => {
      if (!payment.transaction) {
        const loanTransaction = {
          id: `loan-${payment.id}`,
          amount: payment.amount,
          type: 'EXPENSE' as const,
          description: `Loan payment: ${payment.loan.name}`,
          merchant: payment.loan.name,
          date: payment.paymentDate,
          category: payment.loan.category,
          categoryId: payment.loan.categoryId,
          status: 'SUCCESS',
          source: 'LOAN',
          transactionId: `LOAN-${payment.id}`,
          accountNumber: null,
          balance: null,
          rawMessage: null,
          createdAt: payment.createdAt,
          updatedAt: payment.createdAt
        };
        allTransactions.push(loanTransaction);
      }
    });

    // Note: Investment transactions are now handled separately and not included in regular transactions
    // This prevents investment purchases from appearing as expenses in transaction lists and calculations

    // Apply additional filters to combined transactions
    let filteredTransactions = allTransactions;

    if (type && type !== 'all') {
      filteredTransactions = filteredTransactions.filter(txn => txn.type === type);
    }

    if (categoryId && categoryId !== 'all') {
      filteredTransactions = filteredTransactions.filter(txn => txn.categoryId === categoryId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTransactions = filteredTransactions.filter(txn => 
        (txn.description && txn.description.toLowerCase().includes(searchLower)) ||
        (txn.merchant && txn.merchant.toLowerCase().includes(searchLower))
      );
    }

    // Sort transactions
    filteredTransactions.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'description':
          aValue = a.description || '';
          bValue = b.description || '';
          break;
        case 'category':
          aValue = a.category?.name || '';
          bValue = b.category?.name || '';
          break;
        case 'merchant':
          aValue = a.merchant || '';
          bValue = b.merchant || '';
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const total = filteredTransactions.length;
    const skip = (page - 1) * limit;
    const paginatedTransactions = filteredTransactions.slice(skip, skip + limit);

    return NextResponse.json({
      transactions: paginatedTransactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const transaction = await prisma.transaction.create({
      data: {
        amount: data.amount,
        type: data.type,
        description: data.description,
        merchant: data.merchant,
        accountNumber: data.accountNumber,
        transactionId: data.transactionId,
        date: new Date(data.date),
        balance: data.balance,
        status: data.status || 'SUCCESS',
        source: data.source || 'MANUAL',
        rawMessage: data.rawMessage,
        categoryId: data.categoryId
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
