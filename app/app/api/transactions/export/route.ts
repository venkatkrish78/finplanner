
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const categoryId = searchParams.get('categoryId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

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

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Generate CSV content
    const csvHeaders = [
      'Date',
      'Description',
      'Merchant',
      'Category',
      'Type',
      'Amount',
      'Status',
      'Source',
      'Transaction ID',
      'Account Number',
      'Balance'
    ];

    const csvRows = transactions.map(transaction => [
      new Date(transaction.date).toLocaleDateString(),
      transaction.description || '',
      transaction.merchant || '',
      transaction.category?.name || '',
      transaction.type,
      transaction.amount.toString(),
      transaction.status,
      transaction.source,
      transaction.transactionId || '',
      transaction.accountNumber || '',
      transaction.balance?.toString() || ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => 
        row.map(field => 
          // Escape fields that contain commas, quotes, or newlines
          field.includes(',') || field.includes('"') || field.includes('\n')
            ? `"${field.replace(/"/g, '""')}"`
            : field
        ).join(',')
      )
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="transactions.csv"'
      }
    });
  } catch (error) {
    console.error('Error exporting transactions:', error);
    return NextResponse.json(
      { error: 'Failed to export transactions' },
      { status: 500 }
    );
  }
}
