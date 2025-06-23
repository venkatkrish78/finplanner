import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json()
    const { status, amount, endDate } = body

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (amount !== undefined) updateData.amount = amount
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null

    const sip = await db.sIP.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(sip)
  } catch (error) {
    console.error('Error updating SIP:', error)
    return NextResponse.json(
      { error: 'Failed to update SIP' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.sIP.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting SIP:', error)
    return NextResponse.json(
      { error: 'Failed to delete SIP' },
      { status: 500 }
    )
  }
}
