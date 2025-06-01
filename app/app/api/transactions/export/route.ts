
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
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
    const headers = [
      'Date',
      'Type',
      'Amount',
      'Category',
      'Description',
      'Merchant',
      'Account Number',
      'Transaction ID',
      'Status',
      'Source'
    ];

    const csvRows = [
      headers.join(','),
      ...transactions.map(transaction => [
        transaction.date.toISOString().split('T')[0],
        transaction.type,
        transaction.amount,
        transaction.category.name,
        `"${transaction.description || ''}"`,
        `"${transaction.merchant || ''}"`,
        transaction.accountNumber || '',
        transaction.transactionId || '',
        transaction.status,
        transaction.source
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="moneymitra-transactions-${new Date().toISOString().split('T')[0]}.csv"`
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
