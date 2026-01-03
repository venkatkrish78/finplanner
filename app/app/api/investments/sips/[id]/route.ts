import { getCurrentUser } from '@/lib/auth-helpers';
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// PATCH /api/investments/sips/[id] - Update SIP (mainly for status changes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify SIP exists and belongs to user
    const existingSip = await db.sIP.findFirst({
      where: {
        id,
        userId: currentUser.id
      }
    })

    if (!existingSip) {
      return NextResponse.json(
        { error: 'SIP not found' },
        { status: 404 }
      )
    }

    // Update SIP
    const updatedSip = await db.sIP.update({
      where: { id },
      data: {
        status: body.status || existingSip.status,
        amount: body.amount !== undefined ? body.amount : existingSip.amount,
        frequency: body.frequency || existingSip.frequency,
        endDate: body.endDate !== undefined ? (body.endDate ? new Date(body.endDate) : null) : existingSip.endDate
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

    return NextResponse.json(updatedSip)
  } catch (error) {
    console.error('Error updating SIP:', error)
    return NextResponse.json(
      { error: 'Failed to update SIP' },
      { status: 500 }
    )
  }
}

// DELETE /api/investments/sips/[id] - Delete SIP
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify SIP exists and belongs to user
    const existingSip = await db.sIP.findFirst({
      where: {
        id,
        userId: currentUser.id
      }
    })

    if (!existingSip) {
      return NextResponse.json(
        { error: 'SIP not found' },
        { status: 404 }
      )
    }

    // Delete SIP
    await db.sIP.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'SIP deleted successfully' })
  } catch (error) {
    console.error('Error deleting SIP:', error)
    return NextResponse.json(
      { error: 'Failed to delete SIP' },
      { status: 500 }
    )
  }
}
