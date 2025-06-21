import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return mock data until schema is updated
    return NextResponse.json({
      usage: {
        aiChat: 0,
        aiInsights: 0,
        isPremium: false,
        premiumUntil: null
      },
      limits: {
        aiChat: 5,
        aiInsights: 3
      },
      canUseAIChat: true,
      canUseAIInsights: true
    })

  } catch (error) {
    console.error('Error fetching usage:', error)
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // For now, just return success
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 })
  }
}
