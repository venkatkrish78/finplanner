import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { BillFrequency } from '@/lib/types'
import { getCurrentUser } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

// GET /api/bills/[id] - Get a specific bill
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const bill = await prisma.bill.findFirst({
      where: { 
        id,
        userId: currentUser.id
      },
      include: {
        category: true,
        instances: {
          orderBy: { dueDate: 'desc' }
        }
      }
    })

    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(bill)
  } catch (error) {
    console.error('Error fetching bill:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bill' },
      { status: 500 }
    )
  }
}

// PUT /api/bills/[id] - Update a bill
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json()
    const { name, amount, frequency, description, categoryId, nextDueDate, isActive } = body

    // Verify category belongs to user if provided
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          OR: [
            { userId: currentUser.id },
            { isDefault: true }          ]
        }
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
      }
    }

    const bill = await prisma.bill.updateMany({
      where: { 
        id,
        userId: currentUser.id
      },
      data: {
        name,
        amount: amount ? parseFloat(amount) : undefined,
        frequency: frequency as BillFrequency,
        description,
        categoryId,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
        isActive
      }
    })

    if (bill.count === 0) {
      return NextResponse.json(
        { error: 'Bill not found or unauthorized' },
        { status: 404 }
      )
    }

    // Fetch the updated bill
    const updatedBill = await prisma.bill.findFirst({
      where: { 
        id,
        userId: currentUser.id
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(updatedBill)
  } catch (error) {
    console.error('Error updating bill:', error)
    return NextResponse.json(
      { error: 'Failed to update bill' },
      { status: 500 }
    )
  }
}

// DELETE /api/bills/[id] - Delete a bill
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const result = await prisma.bill.deleteMany({
      where: { 
        id,
        userId: currentUser.id
      }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Bill not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bill:', error)
    return NextResponse.json(
      { error: 'Failed to delete bill' },
      { status: 500 }
    )
  }
}
