
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const investments = await db.investment.findMany({
      where: { isActive: true },
      include: {
        transactions: {
          orderBy: {
            date: 'asc'
          }
        }
      }
    })

    // Calculate monthly performance
    const monthlyData: { [key: string]: any } = {}
    const currentDate = new Date()
    
    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
      monthlyData[monthKey] = {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        invested: 0,
        value: 0,
        gainLoss: 0
      }
    }

    // Calculate cumulative investment and value for each month
    investments.forEach(investment => {
      let cumulativeInvested = 0
      
      investment.transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date)
        const monthKey = transactionDate.toISOString().slice(0, 7)
        
        if (transaction.type === 'BUY' || transaction.type === 'SIP_INSTALLMENT') {
          cumulativeInvested += transaction.amount
        } else if (transaction.type === 'SELL') {
          cumulativeInvested -= transaction.amount
        }
        
        // Update all subsequent months
        Object.keys(monthlyData).forEach(key => {
          if (key >= monthKey) {
            if (transaction.type === 'BUY' || transaction.type === 'SIP_INSTALLMENT') {
              monthlyData[key].invested += transaction.amount
            } else if (transaction.type === 'SELL') {
              monthlyData[key].invested -= transaction.amount
            }
          }
        })
      })
    })

    // Calculate current value for each month (simplified - using current prices)
    Object.keys(monthlyData).forEach(monthKey => {
      const monthData = monthlyData[monthKey]
      // Simplified calculation - in real app, you'd need historical prices
      monthData.value = monthData.invested * 1.1 // Assume 10% average return
      monthData.gainLoss = monthData.value - monthData.invested
    })

    const monthlyPerformance = Object.values(monthlyData)

    // Top and worst performers
    const performanceData = investments.map(inv => ({
      investmentId: inv.id,
      name: inv.name,
      assetClass: inv.assetClass,
      invested: inv.totalInvested,
      currentValue: inv.currentValue,
      gainLoss: inv.currentValue - inv.totalInvested,
      gainLossPercentage: inv.totalInvested > 0 ? ((inv.currentValue - inv.totalInvested) / inv.totalInvested) * 100 : 0,
      dayChange: 0,
      dayChangePercentage: 0
    }))

    const topPerformers = performanceData
      .sort((a, b) => b.gainLossPercentage - a.gainLossPercentage)
      .slice(0, 5)

    const worstPerformers = performanceData
      .sort((a, b) => a.gainLossPercentage - b.gainLossPercentage)
      .slice(0, 5)

    return NextResponse.json({
      monthlyPerformance,
      topPerformers,
      worstPerformers
    })
  } catch (error) {
    console.error('Error fetching investment analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch investment analytics' },
      { status: 500 }
    )
  }
}
