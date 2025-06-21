import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

    // Check for recent insights (less than 24 hours old)
    const existingInsights = await prisma.aIInsight.findMany({
      where: {
        userId,
        isRead: false,
        isArchived: false,
        createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (existingInsights.length > 0) {
      const formattedInsights = existingInsights.map(insight => ({
        id: insight.id,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        priority: insight.priority,
        isRead: insight.isRead,
        createdAt: insight.createdAt.toISOString()
      }))

      return NextResponse.json({ insights: formattedInsights })
    }

    // Fetch financial data for AI analysis
    const [transactions, goals, investments, bills] = await Promise.all([
      prisma.transaction.findMany({ 
        where: { userId }, 
        take: 50, 
        orderBy: { date: 'desc' },
        include: { category: true }
      }),
      prisma.financialGoal.findMany({ where: { userId } }),
      prisma.investment.findMany({ where: { userId } }),
      prisma.bill.findMany({ 
        where: { userId },
        orderBy: { nextDueDate: 'asc' }
      })
    ])

    if (transactions.length === 0) {
      // Create welcome insight for new users
      const welcomeInsight = await prisma.aIInsight.create({
        data: {
          type: 'SAVINGS_OPPORTUNITY',
          title: 'Getting Started',
          description: 'Welcome to AI Insights! Add transactions, set goals, and track investments to get personalized financial advice.',
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

    // Calculate financial metrics
    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = Math.abs(transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0))
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0
    const totalInvestments = investments.reduce((sum, i) => sum + i.currentValue, 0)

    // Spending by category
    const expensesByCategory = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => {
        const categoryName = t.category?.name || 'Other'
        acc[categoryName] = (acc[categoryName] || 0) + Math.abs(t.amount)
        return acc
      }, {} as Record<string, number>)

    const topSpendingCategories = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)

    // Upcoming bills
    const upcomingBills = bills.filter(b => {
      const dueDate = new Date(b.nextDueDate)
      const today = new Date()
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilDue <= 7 && daysUntilDue >= 0
    })

    // Goal progress
    const activeGoals = goals.filter(g => g.targetDate > new Date())
    const goalProgress = activeGoals.map(g => ({
      name: g.name,
      progress: ((g.currentAmount / g.targetAmount) * 100).toFixed(1)
    }))

    // Create financial context for AI
    const financialContext = `
FINANCIAL OVERVIEW:
- Monthly Income: ₹${totalIncome.toLocaleString()}
- Monthly Expenses: ₹${totalExpenses.toLocaleString()}
- Savings Rate: ${savingsRate.toFixed(1)}%
- Total Investments: ₹${totalInvestments.toLocaleString()}
- Top Spending: ${topSpendingCategories.map(([cat, amt]) => `${cat} ₹${amt.toLocaleString()}`).join(', ')}
- Active Goals: ${goalProgress.map(g => `${g.name} (${g.progress}% complete)`).join(', ') || 'None'}
- Upcoming Bills: ${upcomingBills.length} bills due in next 7 days
`

    // Generate AI insights using OpenAI
    const insightPrompts = [
      {
        type: 'SPENDING_PATTERN',
        priority: savingsRate < 10 ? 3 : savingsRate < 20 ? 2 : 1,
        prompt: `Analyze spending patterns and savings rate. Give specific, actionable advice in 1-2 sentences.`
      },
      {
        type: 'BUDGET_ALERT',
        priority: 2,
        prompt: `Identify the biggest spending concern and suggest a specific budget optimization in 1-2 sentences.`
      },
      {
        type: 'INVESTMENT_SUGGESTION',
        priority: totalInvestments < 50000 ? 2 : 1,
        prompt: `Provide investment advice based on current portfolio and income. Be specific and actionable in 1-2 sentences.`
      }
    ]

    if (upcomingBills.length > 0) {
      insightPrompts.push({
        type: 'BILL_REMINDER',
        priority: 3,
        prompt: `Create a helpful reminder about upcoming bills. Be encouraging and specific in 1-2 sentences.`
      })
    }

    if (activeGoals.length > 0) {
      insightPrompts.push({
        type: 'GOAL_PROGRESS',
        priority: 1,
        prompt: `Motivate user about their financial goals progress. Be encouraging and specific in 1-2 sentences.`
      })
    }

    const newInsights = []

    // Generate AI insights
    for (const insightPrompt of insightPrompts.slice(0, 4)) { // Limit to 4 insights
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a professional financial advisor. Generate concise, actionable financial insights.

${financialContext}

RULES:
- Keep responses under 100 words
- Be specific with numbers when relevant
- Give actionable advice
- Be encouraging but realistic
- Focus on ONE key insight per response
- Use Indian currency format (₹)
`
            },
            {
              role: "user",
              content: insightPrompt.prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        })

        const aiResponse = completion.choices[0]?.message?.content || "Keep tracking your finances for better insights!"

        // Generate title based on type
        const titles = {
          'SPENDING_PATTERN': 'Spending Analysis',
          'BUDGET_ALERT': 'Budget Optimization',
          'INVESTMENT_SUGGESTION': 'Investment Advice',
          'BILL_REMINDER': 'Upcoming Bills',
          'GOAL_PROGRESS': 'Goal Progress',
          'SAVINGS_OPPORTUNITY': 'Savings Tip'
        }

        const insight = await prisma.aIInsight.create({
          data: {
            type: insightPrompt.type,
            title: titles[insightPrompt.type as keyof typeof titles] || 'Financial Insight',
            description: aiResponse,
            priority: insightPrompt.priority,
            data: {
              generatedBy: 'OpenAI',
              context: {
                savingsRate,
                totalIncome,
                totalExpenses,
                totalInvestments
              }
            },
            userId,
            isRead: false,
            isArchived: false
          }
        })

        newInsights.push(insight)

      } catch (aiError) {
        console.error('AI generation error:', aiError)
        // Fallback to rule-based insight if AI fails
        const fallbackInsight = await prisma.aIInsight.create({
          data: {
            type: insightPrompt.type,
            title: 'Financial Insight',
            description: `Your savings rate is ${savingsRate.toFixed(1)}%. ${savingsRate > 20 ? 'Great job maintaining financial discipline!' : 'Consider reviewing your expenses to improve savings.'}`,
            priority: insightPrompt.priority,
            data: { fallback: true },
            userId,
            isRead: false,
            isArchived: false
          }
        })
        newInsights.push(fallbackInsight)
      }
    }

    // Format insights for response
    const formattedInsights = newInsights.map(insight => ({
      id: insight.id,
      type: insight.type,
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
