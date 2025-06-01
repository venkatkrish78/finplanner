
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { BillFrequency } from '@/lib/types'

export const dynamic = 'force-dynamic'

// Helper function to check if a bill should appear in a given period
function shouldBillAppearInPeriod(bill: any, view: string, year: number, month?: number) {
  const billDate = new Date(bill.nextDueDate)
  const billYear = billDate.getFullYear()
  const billMonth = billDate.getMonth() + 1

  if (view === 'monthly' && month) {
    // For monthly view, check if bill is due in the specified month/year
    if (bill.frequency === 'ONE_TIME') {
      return billYear === year && billMonth === month
    }
    if (bill.frequency === 'YEARLY') {
      return billMonth === month
    }
    if (bill.frequency === 'MONTHLY' || bill.frequency === 'WEEKLY' || 
        bill.frequency === 'QUARTERLY' || bill.frequency === 'HALF_YEARLY') {
      return true // These appear every month (with different calculations)
    }
  }

  if (view === 'yearly') {
    // For yearly view, check if bill is due in the specified year
    if (bill.frequency === 'ONE_TIME') {
      return billYear === year
    }
    if (bill.frequency === 'YEARLY' || bill.frequency === 'MONTHLY' || 
        bill.frequency === 'WEEKLY' || bill.frequency === 'QUARTERLY' || 
        bill.frequency === 'HALF_YEARLY') {
      return true // These appear in yearly view
    }
  }

  return true // Default case for regular view
}

// Helper function to get payment status for a bill in a specific period
async function getBillPaymentStatus(billId: string, view: string, year: number, month?: number) {
  let startDate: Date
  let endDate: Date

  if (view === 'monthly' && month) {
    startDate = new Date(year, month - 1, 1)
    endDate = new Date(year, month, 0, 23, 59, 59)
  } else if (view === 'yearly') {
    startDate = new Date(year, 0, 1)
    endDate = new Date(year, 11, 31, 23, 59, 59)
  } else {
    return { isPaid: false, paidDate: null }
  }

  const paidInstance = await prisma.billInstance.findFirst({
    where: {
      billId,
      status: 'PAID',
      paidDate: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { paidDate: 'desc' }
  })

  return {
    isPaid: !!paidInstance,
    paidDate: paidInstance?.paidDate || null
  }
}

// GET /api/bills - List all bills with optional view filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('active')
    const view = searchParams.get('view') // 'monthly', 'yearly', or null for default
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear()
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1
    
    const bills = await prisma.bill.findMany({
      where: isActive !== null ? { isActive: isActive === 'true' } : undefined,
      include: {
        category: true,
        instances: {
          orderBy: { dueDate: 'desc' },
          take: 5 // Get more instances for better tracking
        }
      },
      orderBy: { nextDueDate: 'asc' }
    })

    // If view is specified, filter and enhance bills with payment status
    if (view === 'monthly' || view === 'yearly') {
      const filteredBills = []
      
      for (const bill of bills) {
        if (shouldBillAppearInPeriod(bill, view, year, month)) {
          const paymentStatus = await getBillPaymentStatus(bill.id, view, year, month)
          
          filteredBills.push({
            ...bill,
            isPaid: paymentStatus.isPaid,
            paidDate: paymentStatus.paidDate,
            viewPeriod: view === 'monthly' ? `${year}-${month.toString().padStart(2, '0')}` : year.toString()
          })
        }
      }
      
      return NextResponse.json(filteredBills)
    }

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
