
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { BillFrequency } from '@/lib/types'

export const dynamic = 'force-dynamic'

// GET /api/bills - List all bills
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('active')
    
    const bills = await prisma.bill.findMany({
      where: isActive !== null ? { isActive: isActive === 'true' } : undefined,
      include: {
        category: true,
        instances: {
          orderBy: { dueDate: 'desc' },
          take: 1
        }
      },
      orderBy: { nextDueDate: 'asc' }
    })

    return NextResponse.json(bills)
  } catch (error) {
    console.error('Error fetching bills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    )
  }
}

// POST /api/bills - Create a new bill
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, amount, frequency, description, categoryId, nextDueDate } = body

    if (!name || !amount || !frequency || !categoryId || !nextDueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const bill = await prisma.bill.create({
      data: {
        name,
        amount: parseFloat(amount),
        frequency: frequency as BillFrequency,
        description,
        categoryId,
        nextDueDate: new Date(nextDueDate),
        isActive: true
      },
      include: {
        category: true
      }
    })

    // Generate the first bill instance
    await prisma.billInstance.create({
      data: {
        billId: bill.id,
        dueDate: new Date(nextDueDate),
        amount: parseFloat(amount)
      }
    })

    return NextResponse.json(bill, { status: 201 })
  } catch (error) {
    console.error('Error creating bill:', error)
    return NextResponse.json(
      { error: 'Failed to create bill' },
      { status: 500 }
    )
  }
}
