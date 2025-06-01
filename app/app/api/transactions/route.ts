
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

    const skip = (page - 1) * limit;

    const where: any = {};

    if (type && type !== 'all') {
      where.type = type;
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    // Handle year/month filtering
    if (year) {
      const yearNum = parseInt(year);
      if (month) {
        const monthNum = parseInt(month);
        const startOfMonth = new Date(yearNum, monthNum - 1, 1);
        const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59);
        where.date = {
          gte: startOfMonth,
          lte: endOfMonth
        };
      } else {
        const startOfYear = new Date(yearNum, 0, 1);
        const endOfYear = new Date(yearNum, 11, 31, 23, 59, 59);
        where.date = {
          gte: startOfYear,
          lte: endOfYear
        };
      }
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Handle search
    if (search) {
      where.OR = [
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

    // Handle sorting
    const orderBy: any = {};
    switch (sortBy) {
      case 'amount':
        orderBy.amount = sortOrder;
        break;
      case 'description':
        orderBy.description = sortOrder;
        break;
      case 'category':
        orderBy.category = { name: sortOrder };
        break;
      case 'merchant':
        orderBy.merchant = sortOrder;
        break;
      default:
        orderBy.date = sortOrder;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.transaction.count({ where })
    ]);

    return NextResponse.json({
      transactions,
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
