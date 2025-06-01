
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { BillFrequency } from '@/lib/types'

export const dynamic = 'force-dynamic'

// POST /api/bills/generate - Generate bill instances for active bills
export async function POST(request: NextRequest) {
  try {
    const today = new Date()
    const futureDate = new Date()
    futureDate.setMonth(today.getMonth() + 3) // Generate 3 months ahead

    const activeBills = await prisma.bill.findMany({
      where: { isActive: true }
    })

    let generatedCount = 0

    for (const bill of activeBills) {
      let currentDate = new Date(bill.nextDueDate)
      
      while (currentDate <= futureDate) {
        // Check if instance already exists for this date
        const existingInstance = await prisma.billInstance.findFirst({
          where: {
            billId: bill.id,
            dueDate: {
              gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
              lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
            }
          }
        })

        if (!existingInstance) {
          await prisma.billInstance.create({
            data: {
              billId: bill.id,
              dueDate: new Date(currentDate),
              amount: bill.amount
            }
          })
          generatedCount++
        }

        // Calculate next due date based on frequency
        switch (bill.frequency) {
          case BillFrequency.WEEKLY:
            currentDate.setDate(currentDate.getDate() + 7)
            break
          case BillFrequency.MONTHLY:
            currentDate.setMonth(currentDate.getMonth() + 1)
            break
          case BillFrequency.QUARTERLY:
            currentDate.setMonth(currentDate.getMonth() + 3)
            break
          case BillFrequency.HALF_YEARLY:
            currentDate.setMonth(currentDate.getMonth() + 6)
            break
          case BillFrequency.YEARLY:
            currentDate.setFullYear(currentDate.getFullYear() + 1)
            break
        }
      }

      // Update bill's next due date
      await prisma.bill.update({
        where: { id: bill.id },
        data: { nextDueDate: currentDate }
      })
    }

    // Update overdue instances
    await prisma.billInstance.updateMany({
      where: {
        dueDate: { lt: today },
        status: 'PENDING'
      },
      data: { status: 'OVERDUE' }
    })

    return NextResponse.json({ 
      message: `Generated ${generatedCount} bill instances`,
      generatedCount 
    })
  } catch (error) {
    console.error('Error generating bill instances:', error)
    return NextResponse.json(
      { error: 'Failed to generate bill instances' },
      { status: 500 }
    )
  }
}
