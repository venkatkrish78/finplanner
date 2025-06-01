
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await db.investmentTransaction.findUnique({
      where: { id: params.id },
      include: {
        investment: true
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Reverse the transaction effects on investment
    const investment = transaction.investment
    let newQuantity = investment.quantity
    let newTotalInvested = investment.totalInvested

    if (transaction.type === 'BUY' || transaction.type === 'SIP_INSTALLMENT') {
      newQuantity = Math.max(0, investment.quantity - transaction.quantity)
      newTotalInvested = Math.max(0, investment.totalInvested - transaction.amount)
    } else if (transaction.type === 'SELL') {
      newQuantity = investment.quantity + transaction.quantity
      const sellRatio = transaction.quantity / (investment.quantity + transaction.quantity)
      newTotalInvested = investment.totalInvested / (1 - sellRatio)
    }

    const newAveragePrice = newQuantity > 0 ? newTotalInvested / newQuantity : 0
    const newCurrentValue = newQuantity * investment.currentPrice

    // Update investment
    await db.investment.update({
      where: { id: investment.id },
      data: {
        quantity: newQuantity,
        totalInvested: newTotalInvested,
        averagePrice: newAveragePrice,
        currentValue: newCurrentValue
      }
    })

    // Delete transaction
    await db.investmentTransaction.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting investment transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete investment transaction' },
      { status: 500 }
    )
  }
}
