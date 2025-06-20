import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

// GET /api/bills/stats - Get bill statistics
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

    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7)

    // Total monthly bills (instances in current month) - user filtered
    const totalMonthlyBills = await prisma.billInstance.count({
      where: {
        userId: currentUser.id,
        dueDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })

    // Paid this month - user filtered
    const paidThisMonth = await prisma.billInstance.count({
      where: {
        userId: currentUser.id,
        dueDate: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        status: 'PAID'
      }
    })

    // Pending this month - user filtered
    const pendingThisMonth = await prisma.billInstance.count({
      where: {
        userId: currentUser.id,
        dueDate: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        status: 'PENDING'
      }
    })

    // Overdue count - user filtered
    const overdueCount = await prisma.billInstance.count({
      where: {
        userId: currentUser.id,
        dueDate: { lt: today },
        status: 'PENDING'
      }
    })

    // Upcoming week - user filtered
    const upcomingWeek = await prisma.billInstance.count({
      where: {
        userId: currentUser.id,
        dueDate: {
          gte: today,
          lte: nextWeek
        },
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      totalMonthlyBills,
      paidThisMonth,
      pendingThisMonth,
      overdueCount,
      upcomingWeek
    })
  } catch (error) {
    console.error('Error fetching bill stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bill stats' },
      { status: 500 }
    )
  }
}
