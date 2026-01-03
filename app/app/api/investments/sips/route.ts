
import { getCurrentUser } from '@/lib/auth-helpers';
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SIPFrequency, SIPStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const investmentId = searchParams.get('investmentId')
    const status = searchParams.get('status')

    const where: any = {}
    if (investmentId) where.investmentId = investmentId
    if (status) where.status = status

    const sips = await db.sIP.findMany({
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
        nextDate: 'asc'
      }
    })

    return NextResponse.json(sips)
  } catch (error) {
    console.error('Error fetching SIPs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SIPs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }    const {
      investmentId,
      name,
      amount,
      frequency,
      startDate,
      endDate,
      totalInstallments
    } = body

    // Calculate next date based on frequency
    const start = new Date(startDate)
    let nextDate = new Date(start)

    const sip = await db.sIP.create({
      data: {
        investmentId,
        name,
        amount,
        frequency,
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
        nextDate,
        userId: currentUser.id,        totalInstallments: totalInstallments || null
      },
      include: {
        investment: {
          select: {
            id: true,
            name: true,
            assetClass: true
          }
        }
      }
    })

    // Auto-create bill for monthly SIP investments
    if (frequency === 'MONTHLY') {
      try {
        // Find or create "Investment" or "SIP Investment" category
        let sipCategory = await db.category.findFirst({
          where: {
            userId: currentUser.id,
            name: 'Investment'
          }
        });

        if (!sipCategory) {
          sipCategory = await db.category.create({
            data: {
              name: 'Investment',
              color: '#059669',
              userId: currentUser.id
            }
          });
        }

        // Create the bill
        await db.bill.create({
          data: {
            name: `${sip.investment.name} - SIP`,
            amount: amount,
            frequency: 'MONTHLY',
            description: `Monthly SIP for ${sip.investment.name}`,
            categoryId: sipCategory.id,
            nextDueDate: nextDate,
            linkedInvestmentId: investmentId,
            userId: currentUser.id
          }
        });
      } catch (billError) {
        console.error('Error creating auto-bill for SIP:', billError);
        // Don't fail the SIP creation if bill creation fails
      }
    }

    return NextResponse.json(sip, { status: 201 })
  } catch (error) {
    console.error('Error creating SIP:', error)
    return NextResponse.json(
      { error: 'Failed to create SIP' },
      { status: 500 }
    )
  }
}
