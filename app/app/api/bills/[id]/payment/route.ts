
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/bills/[id]/payment - Mark a bill as paid for a specific period
   export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const userId = session.user.id

   const { id: billId } = params 
   const body = await request.json()
    const { view, year, month, amount, notes } = body

    if (!view || !year) {
      return NextResponse.json(
        { error: 'View and year are required' },
        { status: 400 }
      )
    }

    if (view === 'monthly' && !month) {
      return NextResponse.json(
        { error: 'Month is required for monthly view' },
        { status: 400 }
      )
    }

// Get the bill to verify it exists and belongs to user
	const bill = await prisma.bill.findUnique({
  	where: { 
    	id: billId,
    	userId: userId
  	}
})
    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      )
    }

    // Calculate the due date for this period
    let dueDate: Date
    if (view === 'monthly' && month !== null) {
      dueDate = new Date(year, month - 1, new Date(bill.nextDueDate).getDate())
    } else {
      // For yearly view, use the original due date but in the specified year
      const originalDate = new Date(bill.nextDueDate)
      dueDate = new Date(year, originalDate.getMonth(), originalDate.getDate())
    }

    // Check if there's already a paid instance for this period
    let startDate: Date
    let endDate: Date

    if (view === 'monthly' && month !== null) {
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59)
    } else {
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31, 23, 59, 59)
    }


    const existingPaidInstance = await prisma.billInstance.findFirst({
 	 where: {
    billId,
    userId: userId,
    status: 'PAID',
    paidDate: {
      gte: startDate,
      lte: endDate
    }
  }
})
    if (existingPaidInstance) {
      return NextResponse.json(
        { error: 'Bill already marked as paid for this period' },
        { status: 400 }
      )
    }

    // Find existing instance or create new one

    let billInstance = await prisma.billInstance.findFirst({
  where: {
    billId,
    userId: userId,
    dueDate
  }
})

    if (billInstance) {
      // Update existing instance
      billInstance = await prisma.billInstance.update({
        where: { id: billInstance.id },
        data: {
          status: 'PAID',
          paidDate: new Date(),
          notes,
          amount: amount || bill.amount
        }
      })
    } else {
      // Create new instance
   // Create new instance
billInstance = await prisma.billInstance.create({
  data: {
    billId: billId,
    userId: userId,
    dueDate: dueDate,
    amount: amount || bill.amount,
    status: 'PAID',
    paidDate: new Date(),
    notes: notes || null
  }
})
    return NextResponse.json(billInstance, { status: 200 })
  } catch (error) {
    console.error('Error marking bill as paid:', error)
    return NextResponse.json(
      { error: 'Failed to mark bill as paid' },
      { status: 500 }
    )
  }
}

// DELETE /api/bills/[id]/payment - Unmark a bill as paid for a specific period
    export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const userId = session.user.id

    const { id: billId } = params
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view')
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null

    if (!view || !year) {
      return NextResponse.json(
        { error: 'View and year are required' },
        { status: 400 }
      )
    }

    if (view === 'monthly' && !month) {
      return NextResponse.json(
        { error: 'Month is required for monthly view' },
        { status: 400 }
      )
    }

    // Find and update the paid instance for this period
    let startDate: Date
    let endDate: Date

    if (view === 'monthly' && month !== null) {
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59)
    } else {
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31, 23, 59, 59)
    }

    const paidInstance = await prisma.billInstance.findFirst({
  where: {
    billId,
    userId: userId,
    status: 'PAID',
    paidDate: {
      gte: startDate,
      lte: endDate
    }
  }
})

    if (!paidInstance) {
      return NextResponse.json(
        { error: 'No paid instance found for this period' },
        { status: 404 }
      )
    }

    // Update the instance to mark as pending
    const updatedInstance = await prisma.billInstance.update({
      where: { id: paidInstance.id },
      data: {
        status: 'PENDING',
        paidDate: null
      }
    })

    return NextResponse.json(updatedInstance, { status: 200 })
  } catch (error) {
    console.error('Error unmarking bill payment:', error)
    return NextResponse.json(
      { error: 'Failed to unmark bill payment' },
      { status: 500 }
    )
  }
}
