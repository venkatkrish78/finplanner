
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { AssetClass, InvestmentPlatform } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('goalId')
    const assetClass = searchParams.get('assetClass')
    const platform = searchParams.get('platform')
    const isActive = searchParams.get('isActive')
    const includeGoals = searchParams.get('includeGoals') === 'true'

    const where: any = {}
    
    if (goalId) where.goalId = goalId
    if (assetClass) where.assetClass = assetClass
    if (platform) where.platform = platform
    if (isActive !== null) where.isActive = isActive === 'true'

    const investments = await prisma.investment.findMany({
      where,
      include: {
        goal: includeGoals ? {
          select: {
            id: true,
            name: true,
            goalType: true,
            targetAmount: true,
            currentAmount: true
          }
        } : undefined,
        goalLinks: includeGoals ? {
          include: {
            goal: {
              select: {
                id: true,
                name: true,
                goalType: true,
                targetAmount: true,
                currentAmount: true
              }
            }
          }
        } : undefined,
        category: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Add linked goals summary to each investment
    const investmentsWithGoals = investments.map(investment => {
      const linkedGoals = [];
      
      // Add direct goal link (backward compatibility)
      if (includeGoals && investment.goal) {
        linkedGoals.push({
          ...investment.goal,
          allocation: 100,
          linkType: 'direct'
        });
      }

      // Add many-to-many goal links
      if (includeGoals && investment.goalLinks) {
        investment.goalLinks.forEach((link: any) => {
          if (link.goal) {
            linkedGoals.push({
              ...link.goal,
              allocation: link.allocation,
              linkType: 'linked',
              linkId: link.id
            });
          }
        });
      }

      return {
        ...investment,
        linkedGoals
      };
    });

    return NextResponse.json(investmentsWithGoals)
  } catch (error) {
    console.error('Error fetching investments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch investments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      symbol,
      assetClass,
      platform,
      quantity,
      purchasePrice,
      currentPrice,
      purchaseDate,
      description,
      goalId,
      categoryId
    } = body

    // Calculate derived values
    const totalInvested = quantity * purchasePrice
    const currentValue = quantity * currentPrice

    const investment = await prisma.investment.create({
      data: {
        name,
        symbol,
        assetClass,
        platform,
        quantity,
        averagePrice: purchasePrice,
        currentPrice,
        totalInvested,
        currentValue,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        description,
        goalId: goalId || null,
        categoryId: categoryId || null
      }
    })

    // Create initial buy transaction
    if (quantity > 0 && purchasePrice > 0) {
      await prisma.investmentTransaction.create({
        data: {
          investmentId: investment.id,
          type: 'BUY',
          quantity,
          price: purchasePrice,
          amount: totalInvested,
          date: purchaseDate ? new Date(purchaseDate) : new Date(),
          notes: 'Initial purchase'
        }
      })
    }

    return NextResponse.json(investment, { status: 201 })
  } catch (error) {
    console.error('Error creating investment:', error)
    return NextResponse.json(
      { error: 'Failed to create investment' },
      { status: 500 }
    )
  }
}
