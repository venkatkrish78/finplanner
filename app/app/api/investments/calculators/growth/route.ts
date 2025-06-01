
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { initialAmount, annualReturn, years, monthlyAddition = 0 } = body

    if (!initialAmount || !annualReturn || !years) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const monthlyRate = annualReturn / 100 / 12
    const totalMonths = years * 12

    // Calculate future value with compound interest
    let futureValue = initialAmount * Math.pow(1 + annualReturn / 100, years)

    // Add monthly contributions if any
    if (monthlyAddition > 0) {
      const monthlyContributionValue = monthlyAddition * 
        (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate))
      futureValue += monthlyContributionValue
    }

    const totalInvestment = initialAmount + (monthlyAddition * totalMonths)
    const totalReturns = futureValue - totalInvestment
    const cagr = Math.pow(futureValue / totalInvestment, 1 / years) - 1

    // Generate yearly projection
    const projectedGrowth = []
    for (let year = 1; year <= years; year++) {
      const yearlyValue = initialAmount * Math.pow(1 + annualReturn / 100, year)
      const monthlyContribValue = monthlyAddition > 0 ? 
        monthlyAddition * (((Math.pow(1 + monthlyRate, year * 12) - 1) / monthlyRate) * (1 + monthlyRate)) : 0
      
      const totalValue = yearlyValue + monthlyContribValue
      const totalInvested = initialAmount + (monthlyAddition * year * 12)
      
      projectedGrowth.push({
        year,
        value: Math.round(totalValue),
        returns: Math.round(totalValue - totalInvested)
      })
    }

    return NextResponse.json({
      futureValue: Math.round(futureValue),
      totalReturns: Math.round(totalReturns),
      cagr: Math.round(cagr * 100 * 100) / 100, // Round to 2 decimal places
      projectedGrowth
    })
  } catch (error) {
    console.error('Error calculating investment growth:', error)
    return NextResponse.json(
      { error: 'Failed to calculate investment growth' },
      { status: 500 }
    )
  }
}
