
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
    const {
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
        totalInstallments: totalInstallments || null
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

    return NextResponse.json(sip, { status: 201 })
  } catch (error) {
    console.error('Error creating SIP:', error)
    return NextResponse.json(
      { error: 'Failed to create SIP' },
      { status: 500 }
    )
  }
}
