
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/bills/analytics - Get bill analytics data
export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(today.getMonth() - 6)

    // Monthly spending for last 6 months
    const monthlySpending = await prisma.billInstance.groupBy({
      by: ['dueDate'],
      where: {
        status: 'PAID',
        paidDate: {
          gte: sixMonthsAgo
        }
      },
      _sum: {
        amount: true
      }
    })

    // Group by month
    const monthlyData = monthlySpending.reduce((acc: any, item) => {
      const month = new Date(item.dueDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      if (!acc[month]) {
        acc[month] = 0
      }
      acc[month] += item._sum.amount || 0
      return acc
    }, {})

    const monthlySpendingArray = Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount: amount as number
    }))

    // Category breakdown for current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const categoryBreakdown = await prisma.billInstance.findMany({
      where: {
        status: 'PAID',
        paidDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      include: {
        bill: {
          include: {
            category: true
          }
        }
      }
    })

    const categoryData = categoryBreakdown.reduce((acc: any, instance) => {
      const categoryName = instance.bill.category.name
      const categoryColor = instance.bill.category.color
      
      if (!acc[categoryName]) {
        acc[categoryName] = {
          amount: 0,
          color: categoryColor
        }
      }
      acc[categoryName].amount += instance.amount
      return acc
    }, {})

    const categoryBreakdownArray = Object.entries(categoryData).map(([category, data]: [string, any]) => ({
      category,
      amount: data.amount,
      color: data.color
    }))

    return NextResponse.json({
      monthlySpending: monthlySpendingArray,
      categoryBreakdown: categoryBreakdownArray
    })
  } catch (error) {
    console.error('Error fetching bill analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bill analytics' },
      { status: 500 }
    )
  }
}
