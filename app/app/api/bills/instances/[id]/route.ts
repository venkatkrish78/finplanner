
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { BillStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

// PUT /api/bills/instances/[id] - Update bill instance (mark as paid, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, notes, createTransaction } = body

    const instance = await prisma.billInstance.findUnique({
      where: { id: params.id },
      include: {
        bill: {
          include: {
            category: true
          }
        }
      }
    })

    if (!instance) {
      return NextResponse.json(
        { error: 'Bill instance not found' },
        { status: 404 }
      )
    }

    let transactionId = instance.transactionId

    // If marking as paid and createTransaction is true, create a transaction
    if (status === 'PAID' && createTransaction && !transactionId) {
      const transaction = await prisma.transaction.create({
        data: {
          amount: instance.amount,
          type: 'EXPENSE',
          description: `Bill payment: ${instance.bill.name}`,
          date: new Date(),
          categoryId: instance.bill.categoryId,
          source: 'MANUAL'
        }
      })
      transactionId = transaction.id
    }

    const updatedInstance = await prisma.billInstance.update({
      where: { id: params.id },
      data: {
        status: status as BillStatus,
        notes,
        paidDate: status === 'PAID' ? new Date() : null,
        transactionId
      },
      include: {
        bill: {
          include: {
            category: true
          }
        },
        transaction: true
      }
    })

    return NextResponse.json(updatedInstance)
  } catch (error) {
    console.error('Error updating bill instance:', error)
    return NextResponse.json(
      { error: 'Failed to update bill instance' },
      { status: 500 }
    )
  }
}
