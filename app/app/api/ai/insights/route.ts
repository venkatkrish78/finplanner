import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { InsightType } from '@prisma/client'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check for recent insights (less than 6 hours old)
    const existingInsights = await prisma.aIInsight.findMany({
      where: {
        userId,
        isRead: false,
        isArchived: false,
        createdAt: { gt: new Date(Date.now() - 6 * 60 * 60 * 1000) }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (existingInsights.length > 0) {
      const formattedInsights = existingInsights.map(insight => ({
        id: insight.id,
        type: insight.type as InsightType,
        title: insight.title,
        description: insight.description,
        priority: insight.priority,
        isRead: insight.isRead,
        createdAt: insight.createdAt.toISOString()
      }))

      return NextResponse.json({ insights: formattedInsights })
    }

    // Fetch financial data
    const [transactions, goals, investments, bills, assets, loans] = await Promise.all([
      prisma.transaction.findMany({ 
        where: { userId }, 
        take: 30, 
        orderBy: { date: 'desc' },
        include: { category: true }
      }),
      prisma.financialGoal.findMany({ where: { userId } }),
      prisma.investment.findMany({ where: { userId } }),
      prisma.bill.findMany({ 
        where: { userId },
        orderBy: { nextDueDate: 'asc' }
      }),
      prisma.asset.findMany({ where: { userId } }),
      prisma.loan.findMany({ where: { userId } })
    ])

    if (transactions.length === 0) {
      const welcomeInsight = await prisma.aIInsight.create({
        data: {
          type: InsightType.SAVINGS_OPPORTUNITY,
          title: 'Welcome!',
          description: 'Start adding transactions to get personalized insights.',
          priority: 1,
          data: { isWelcome: true },
          userId,
          isRead: false,
          isArchived: false
        }
      })

      return NextResponse.json({ 
        insights: [{
          id: welcomeInsight.id,
          type: welcomeInsight.type,
          title: welcomeInsight.title,
          description: welcomeInsight.description,
          priority: welcomeInsight.priority,
          isRead: welcomeInsight.isRead,
          createdAt: welcomeInsight.createdAt.toISOString()
        }]
      })
    }

    // Quick calculations
    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0)
    const balance = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0

    const totalAssets = assets.reduce((sum, a) => sum + a.value, 0)
    const totalLoans = loans.reduce((sum, l) => sum + l.currentBalance, 0)
    const totalInvestments = investments.reduce((sum, i) => sum + i.currentValue, 0)
    const netWorth = balance + totalAssets + totalInvestments - totalLoans

    // Top spending category
    const expensesByCategory = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => {
        const categoryName = t.category?.name || 'Other'
        acc[categoryName] = (acc[categoryName] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    const topCategory = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)[0]

    // Upcoming bills
    const upcomingBills = bills.filter(b => {
      const dueDate = new Date(b.nextDueDate)
      const today = new Date()
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilDue <= 7 && daysUntilDue >= 0
    })

    // Generate concise insights
    const insights = []

    // Balance insight
    if (balance > 0) {
      insights.push({
        type: InsightType.SAVINGS_OPPORTUNITY,
        title: 'Great Balance!',
        description: `You have ₹${balance.toFixed(0)} positive balance. Consider investing some of it.`,
        priority: 1
      })
    } else if (balance < 0) {
      insights.push({
        type: 'BUDGET_ALERT',
        title: 'Budget Alert',
        description: `You're ₹${Math.abs(balance).toFixed(0)} over budget. Review your expenses.`,
        priority: 3
      })
    }

    // Savings rate insight
    if (savingsRate < 10) {
      insights.push({
        type: InsightType.SAVINGS_OPPORTUNITY,
        title: 'Low Savings',
        description: `Only ${savingsRate.toFixed(0)}% savings rate. Try to save at least 20%.`,
        priority: 2
      })
    } else if (savingsRate > 30) {
      insights.push({
        type: 'INVESTMENT_SUGGESTION',
        title: 'High Savings!',
        description: `${savingsRate.toFixed(0)}% savings rate is excellent! Consider investing more.`,
        priority: 1
      })
    }

    // Top spending insight
    if (topCategory && topCategory[1] > totalIncome * 0.3) {
      insights.push({
        type: 'SPENDING_PATTERN',
        title: 'High Spending',
        description: `₹${topCategory[1].toFixed(0)} spent on ${topCategory[0]}. That's ${((topCategory[1]/totalIncome)*100).toFixed(0)}% of income.`,
        priority: 2
      })
    }

    // Bill reminder
    if (upcomingBills.length > 0) {
      const totalDue = upcomingBills.reduce((sum, b) => sum + b.amount, 0)
      insights.push({
        type: 'BILL_REMINDER',
        title: 'Bills Due',
        description: `${upcomingBills.length} bills worth ₹${totalDue.toFixed(0)} due this week.`,
        priority: 3
      })
    }

    // Goal progress
    const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount)
    if (activeGoals.length > 0) {
      const goalProgress = activeGoals.map(g => ({
        name: g.name,
        progress: ((g.currentAmount / g.targetAmount) * 100)
      }))

      const bestGoal = goalProgress.sort((a, b) => b.progress - a.progress)[0]
      if (bestGoal.progress > 50) {
        insights.push({
          type: 'GOAL_PROGRESS',
          title: 'Goal Progress',
          description: `${bestGoal.name} is ${bestGoal.progress.toFixed(0)}% complete! Keep going!`,
          priority: 1
        })
      }
    }

    // Net worth insight
    if (netWorth > 100000) {
      insights.push({
        type: 'INVESTMENT_SUGGESTION',
        title: 'Net Worth',
        description: `Your net worth is ₹${netWorth.toFixed(0)}. Great financial health!`,
        priority: 1
      })
    }

    // Limit to top 3 insights
    const topInsights = insights
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3)

    // Save to database
    const savedInsights = []
    for (const insight of topInsights) {
      const saved = await prisma.aIInsight.create({
        data: {
          type: insight.type as InsightType,
          title: insight.title,
          description: insight.description,
          priority: insight.priority,
          data: {
            balance,
            savingsRate,
            netWorth,
            generatedAt: new Date().toISOString()
          },
          userId,
          isRead: false,
          isArchived: false
        }
      })
      savedInsights.push(saved)
    }

    // Format response
    const formattedInsights = savedInsights.map(insight => ({
      id: insight.id,
      type: insight.type as InsightType,
      title: insight.title,
      description: insight.description,
      priority: insight.priority,
      isRead: insight.isRead,
      createdAt: insight.createdAt.toISOString()
    }))

    return NextResponse.json({ insights: formattedInsights })

  } catch (error) {
    console.error('Error fetching AI insights:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
