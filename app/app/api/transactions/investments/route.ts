
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
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

    // Get investment transactions only
    const transactionWhere: any = {
      type: { in: ['INVESTMENT_BUY', 'INVESTMENT_SELL'] }
    };
    
    if (Object.keys(dateFilter).length > 0) {
      transactionWhere.date = dateFilter;
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

    const investmentTransactions = await prisma.transaction.findMany({
      where: transactionWhere,
      include: {
        category: true,
        investmentTransaction: {
          include: {
            investment: {
              select: {
                id: true,
                name: true,
                assetClass: true,
                platform: true
              }
            }
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder as 'asc' | 'desc'
      }
    });

    // Apply pagination
    const total = investmentTransactions.length;
    const skip = (page - 1) * limit;
    const paginatedTransactions = investmentTransactions.slice(skip, skip + limit);

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
    console.error('Error fetching investment transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investment transactions' },
      { status: 500 }
    );
  }
}
