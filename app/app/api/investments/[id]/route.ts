
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const investment = await db.investment.findUnique({
      where: { id: params.id },
      include: {
        goal: {
          select: {
            id: true,
            name: true,
            goalType: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        transactions: {
          orderBy: {
            date: 'desc'
          }
        },
        sips: true
      }
    })

    if (!investment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(investment)
  } catch (error) {
    console.error('Error fetching investment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch investment' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      symbol,
      currentPrice,
      description,
      goalId,
      categoryId,
      isActive
    } = body

    // Update current value if current price is provided
    const updateData: any = {
      name,
      symbol,
      description,
      goalId: goalId || null,
      categoryId: categoryId || null,
      isActive
    }

    if (currentPrice !== undefined) {
      const investment = await db.investment.findUnique({
        where: { id: params.id }
      })
      
      if (investment) {
        updateData.currentPrice = currentPrice
        updateData.currentValue = investment.quantity * currentPrice
      }
    }

    const investment = await db.investment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        goal: {
          select: {
            id: true,
            name: true,
            goalType: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        transactions: {
          orderBy: {
            date: 'desc'
          }
        },
        sips: true
      }
    })

    return NextResponse.json(investment)
  } catch (error) {
    console.error('Error updating investment:', error)
    return NextResponse.json(
      { error: 'Failed to update investment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.investment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting investment:', error)
    return NextResponse.json(
      { error: 'Failed to delete investment' },
      { status: 500 }
    )
  }
}
