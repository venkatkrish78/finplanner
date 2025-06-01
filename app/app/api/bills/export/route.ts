
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')

    const where: any = {}

    if (startDate || endDate) {
      where.dueDate = {}
      if (startDate) {
        where.dueDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.dueDate.lte = new Date(endDate)
      }
    }

    if (status) {
      where.status = status
    }

    const billInstances = await prisma.billInstance.findMany({
      where,
      include: {
        bill: {
          include: {
            category: true
          }
        },
        transaction: true
      },
      orderBy: {
        dueDate: 'desc'
      }
    })

    // Generate CSV content for bill instances
    const headers = [
      'Bill Name',
      'Due Date',
      'Amount',
      'Status',
      'Category',
      'Frequency',
      'Paid Date',
      'Transaction ID',
      'Notes'
    ]

    const csvRows = [
      headers.join(','),
      ...billInstances.map(instance => [
        `"${instance.bill.name}"`,
        instance.dueDate.toISOString().split('T')[0],
        instance.amount,
        instance.status,
        instance.bill.category.name,
        instance.bill.frequency,
        instance.paidDate ? instance.paidDate.toISOString().split('T')[0] : '',
        instance.transactionId || '',
        `"${instance.notes || ''}"`
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="moneymitra-bills-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error exporting bills:', error)
    return NextResponse.json(
      { error: 'Failed to export bills' },
      { status: 500 }
    )
  }
}
