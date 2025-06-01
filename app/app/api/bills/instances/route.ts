
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { BillStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

// GET /api/bills/instances - List bill instances with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const upcoming = searchParams.get('upcoming')
    const overdue = searchParams.get('overdue')

    let whereClause: any = {}

    if (status) {
      whereClause.status = status as BillStatus
    }

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0)
      whereClause.dueDate = {
        gte: startDate,
        lte: endDate
      }
    }

    if (upcoming === 'true') {
      const today = new Date()
      const nextWeek = new Date()
      nextWeek.setDate(today.getDate() + 7)
      whereClause.dueDate = {
        gte: today,
        lte: nextWeek
      }
      whereClause.status = { in: ['PENDING'] }
    }

    if (overdue === 'true') {
      const today = new Date()
      whereClause.dueDate = { lt: today }
      whereClause.status = 'PENDING'
    }

    const instances = await prisma.billInstance.findMany({
      where: whereClause,
      include: {
        bill: {
          include: {
            category: true
          }
        },
        transaction: true
      },
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json(instances)
  } catch (error) {
    console.error('Error fetching bill instances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bill instances' },
      { status: 500 }
    )
  }
}
