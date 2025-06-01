
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { monthlyInvestment, annualReturn, years } = body

    if (!monthlyInvestment || !annualReturn || !years) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const monthlyRate = annualReturn / 100 / 12
    const totalMonths = years * 12
    const totalInvestment = monthlyInvestment * totalMonths

    // SIP maturity calculation using compound interest formula
    const maturityAmount = monthlyInvestment * 
      (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate))

    const totalReturns = maturityAmount - totalInvestment

    // Generate monthly schedule
    const schedule = []
    let cumulativeInvestment = 0
    let cumulativeValue = 0

    for (let month = 1; month <= totalMonths; month++) {
      cumulativeInvestment += monthlyInvestment
      
      // Calculate value at end of this month
      cumulativeValue = monthlyInvestment * 
        (((Math.pow(1 + monthlyRate, month) - 1) / monthlyRate) * (1 + monthlyRate))

      schedule.push({
        month,
        investment: cumulativeInvestment,
        value: Math.round(cumulativeValue),
        returns: Math.round(cumulativeValue - cumulativeInvestment)
      })
    }

    return NextResponse.json({
      monthlyInvestment,
      totalInvestment: Math.round(totalInvestment),
      maturityAmount: Math.round(maturityAmount),
      totalReturns: Math.round(totalReturns),
      schedule: schedule.filter((_, index) => index % 12 === 11 || index === schedule.length - 1) // Yearly data
    })
  } catch (error) {
    console.error('Error calculating SIP:', error)
    return NextResponse.json(
      { error: 'Failed to calculate SIP' },
      { status: 500 }
    )
  }
}
