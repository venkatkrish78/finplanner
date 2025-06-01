
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { InvestmentTransactionType } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const investmentId = searchParams.get('investmentId')
    const type = searchParams.get('type')

    const where: any = {}
    if (investmentId) where.investmentId = investmentId
    if (type) where.type = type

    const transactions = await db.investmentTransaction.findMany({
      where,
      include: {
        investment: {
          select: {
            id: true,
            name: true,
            assetClass: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching investment transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch investment transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      investmentId,
      type,
      quantity,
      price,
      fees = 0,
      tax = 0,
      date,
      notes
    } = body

    const amount = quantity * price

    // Create the investment transaction
    const transaction = await db.investmentTransaction.create({
      data: {
        investmentId,
        type,
        quantity,
        price,
        amount,
        fees,
        tax,
        date: new Date(date),
        notes
      }
    })

    // Update investment based on transaction type
    const investment = await db.investment.findUnique({
      where: { id: investmentId }
    })

    if (investment) {
      let newQuantity = investment.quantity
      let newTotalInvested = investment.totalInvested
      let newAveragePrice = investment.averagePrice

      if (type === 'BUY' || type === 'SIP_INSTALLMENT') {
        // Calculate new average price
        const totalCost = (investment.quantity * investment.averagePrice) + amount
        newQuantity = investment.quantity + quantity
        newTotalInvested = investment.totalInvested + amount
        newAveragePrice = newQuantity > 0 ? totalCost / newQuantity : 0
      } else if (type === 'SELL') {
        newQuantity = Math.max(0, investment.quantity - quantity)
        // Reduce total invested proportionally
        const sellRatio = quantity / investment.quantity
        newTotalInvested = investment.totalInvested * (1 - sellRatio)
      }

      const newCurrentValue = newQuantity * investment.currentPrice

      await db.investment.update({
        where: { id: investmentId },
        data: {
          quantity: newQuantity,
          totalInvested: newTotalInvested,
          averagePrice: newAveragePrice,
          currentValue: newCurrentValue
        }
      })
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating investment transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create investment transaction' },
      { status: 500 }
    )
  }
}
