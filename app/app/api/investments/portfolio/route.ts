
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const investments = await db.investment.findMany({
      where: { isActive: true },
      include: {
        transactions: true
      }
    })

    // Calculate portfolio statistics
    let totalInvested = 0
    let currentValue = 0
    let totalInvestments = investments.length

    const assetAllocation: { [key: string]: any } = {}
    const platformAllocation: { [key: string]: any } = {}

    investments.forEach(investment => {
      totalInvested += investment.totalInvested
      currentValue += investment.currentValue

      // Asset allocation
      if (!assetAllocation[investment.assetClass]) {
        assetAllocation[investment.assetClass] = {
          assetClass: investment.assetClass,
          value: 0,
          invested: 0,
          count: 0
        }
      }
      assetAllocation[investment.assetClass].value += investment.currentValue
      assetAllocation[investment.assetClass].invested += investment.totalInvested
      assetAllocation[investment.assetClass].count += 1

      // Platform allocation
      if (!platformAllocation[investment.platform]) {
        platformAllocation[investment.platform] = {
          platform: investment.platform,
          value: 0,
          investmentCount: 0
        }
      }
      platformAllocation[investment.platform].value += investment.currentValue
      platformAllocation[investment.platform].investmentCount += 1
    })

    const totalGainLoss = currentValue - totalInvested
    const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

    // Convert to arrays and add percentages
    const assetAllocationArray = Object.values(assetAllocation).map((asset: any) => ({
      ...asset,
      percentage: currentValue > 0 ? (asset.value / currentValue) * 100 : 0,
      gainLoss: asset.value - asset.invested,
      gainLossPercentage: asset.invested > 0 ? ((asset.value - asset.invested) / asset.invested) * 100 : 0
    }))

    const platformAllocationArray = Object.values(platformAllocation).map((platform: any) => ({
      ...platform,
      percentage: currentValue > 0 ? (platform.value / currentValue) * 100 : 0
    }))

    const portfolioStats = {
      totalInvestments,
      totalInvested,
      currentValue,
      totalGainLoss,
      totalGainLossPercentage,
      dayGainLoss: 0, // Would need historical data
      dayGainLossPercentage: 0
    }

    return NextResponse.json({
      stats: portfolioStats,
      assetAllocation: assetAllocationArray,
      platformAllocation: platformAllocationArray,
      investments: investments.map(inv => ({
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
    })
  } catch (error) {
    console.error('Error fetching portfolio data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    )
  }
}
