import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const investment = await prisma.investment.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        goal: true,
        goalLinks: {
          include: {
            goal: true
          }
        },
        category: true
      }
    })

    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 })
    }

    // Transform the data to include linkedGoals for compatibility
    const transformedInvestment = {
      ...investment,
      linkedGoals: investment.goalLinks.map(link => ({
        ...link.goal,
        allocation: link.allocation,
        notes: link.notes,
        linkType: 'linked'
      }))
    }

    return NextResponse.json(transformedInvestment)
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if investment exists and belongs to user
    const existingInvestment = await prisma.investment.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingInvestment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, symbol, assetClass, platform, currentPrice, description, isActive } = body

    // Validate required fields
    if (!name || !assetClass || !platform) {
      return NextResponse.json(
        { error: 'Name, asset class, and platform are required' },
        { status: 400 }
      )
    }

    // Calculate new current value if current price is updated
    let updateData: any = {
      name,
      symbol: symbol || null,
      assetClass,
      platform,
      description: description || null,
      isActive: isActive ?? true,
      updatedAt: new Date()
    }

    // If current price is provided, update it and recalculate current value
    if (currentPrice !== undefined && currentPrice !== null && currentPrice !== '') {
      const newCurrentPrice = parseFloat(currentPrice.toString())
      if (!isNaN(newCurrentPrice) && newCurrentPrice >= 0) {
        updateData.currentPrice = newCurrentPrice
        // Recalculate current value: quantity * current price
        updateData.currentValue = existingInvestment.quantity * newCurrentPrice
      }
    }

    const updatedInvestment = await prisma.investment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        goal: true,
        goalLinks: {
          include: {
            goal: true
          }
        },
        category: true
      }
    })

    // Transform the data to include linkedGoals for compatibility
    const transformedInvestment = {
      ...updatedInvestment,
      linkedGoals: updatedInvestment.goalLinks.map(link => ({
        ...link.goal,
        allocation: link.allocation,
        notes: link.notes,
        linkType: 'linked'
      }))
    }

    return NextResponse.json(transformedInvestment)
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if investment exists and belongs to user
    const existingInvestment = await prisma.investment.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingInvestment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 })
    }

    // Delete related records first (goal links, transactions, etc.)
    await prisma.$transaction(async (tx) => {
      // Delete goal links
      await tx.goalInvestmentLink.deleteMany({
        where: { investmentId: params.id }
      })

      // Delete investment transactions if they exist
      await tx.investmentTransaction.deleteMany({
        where: { investmentId: params.id }
      }).catch(() => {
        // Ignore if table doesn't exist
      })

      // Delete the investment
      await tx.investment.delete({
        where: { id: params.id }
      })
    })

    return NextResponse.json({ message: 'Investment deleted successfully' })
  } catch (error) {
    console.error('Error deleting investment:', error)
    return NextResponse.json(
      { error: 'Failed to delete investment' },
      { status: 500 }
    )
  }
}
