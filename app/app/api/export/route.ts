import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        financialGoals: {
          include: {
            category: true,
            investmentLinks: {
              include: {
                investment: true
              }
            }
          }
        },
        investments: {
          include: {
            category: true,
            goalLinks: {
              include: {
                goal: true
              }
            }
          }
        },
        transactions: {
          include: {
            category: true,
          }
        },
        categories: true,
        assets: true,
        aiInsights: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove sensitive information
    const exportData = {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      goals: user.financialGoals,
      investments: user.investments,
      transactions: user.transactions,
      categories: user.categories,
      assets: user.assets,
      aiInsights: user.aiInsights.map(insight => ({
        type: insight.type,
        title: insight.title,
        description: insight.description,
        priority: insight.priority,
        createdAt: insight.createdAt
      })),
      exportedAt: new Date().toISOString()
    }

    const jsonData = JSON.stringify(exportData, null, 2)
    
    return new NextResponse(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="finplanner-data-${new Date().toISOString().split('T')[0]}.json"`
      }
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
