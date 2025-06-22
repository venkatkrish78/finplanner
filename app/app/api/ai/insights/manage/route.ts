import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mark insight as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { insightId } = await req.json()

    if (!insightId) {
      return NextResponse.json({ error: 'Insight ID required' }, { status: 400 })
    }

    await prisma.aIInsight.update({
      where: { 
        id: insightId,
        userId: session.user.id 
      },
      data: { 
        isRead: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error marking insight as read:', error)
    return NextResponse.json({ error: 'Failed to update insight' }, { status: 500 })
  }
}

// Archive insight
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const insightId = searchParams.get('id')

    if (!insightId) {
      return NextResponse.json({ error: 'Insight ID required' }, { status: 400 })
    }

    await prisma.aIInsight.update({
      where: { 
        id: insightId,
        userId: session.user.id 
      },
      data: { 
        isArchived: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error archiving insight:', error)
    return NextResponse.json({ error: 'Failed to archive insight' }, { status: 500 })
  }
}

// Generate fresh insights
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Archive old insights
    await prisma.aIInsight.updateMany({
      where: {
        userId,
        isArchived: false
      },
      data: {
        isArchived: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, message: 'Old insights archived. Refresh to generate new ones.' })

  } catch (error) {
    console.error('Error generating fresh insights:', error)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}
