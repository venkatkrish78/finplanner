import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await req.json()
    const userId = session.user.id

    // Fetch user's financial data for context
    const [transactions, goals, investments, bills] = await Promise.all([
      prisma.transaction.findMany({ 
        where: { userId }, 
        take: 30, 
        orderBy: { date: 'desc' },
        include: { category: true }
      }),
      prisma.financialGoal.findMany({ where: { userId } }),
      prisma.investment.findMany({ where: { userId } }),
      prisma.bill.findMany({ where: { userId } })
    ])

    // Calculate key metrics
    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = Math.abs(transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0))
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0
    const totalInvestments = investments.reduce((sum, i) => sum + i.currentValue, 0)

    // Top spending categories
    const expensesByCategory = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => {
        const categoryName = t.category?.name || 'Other'
        acc[categoryName] = (acc[categoryName] || 0) + Math.abs(t.amount)
        return acc
      }, {} as Record<string, number>)

    const topCategory = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)[0]

    // Create focused context
    const financialContext = `
KEY FINANCIAL METRICS:
- Savings Rate: ${savingsRate.toFixed(1)}%
- Total Investments: ₹${totalInvestments.toLocaleString()}
- Top Expense Category: ${topCategory ? `${topCategory[0]} (₹${topCategory[1].toLocaleString()})` : 'None'}
- Recent Transactions: ${transactions.slice(0, 3).map(t => `${t.description} (₹${Math.abs(t.amount).toLocaleString()})`).join(', ')}
- Goals: ${goals.map(g => `${g.name} ${((g.currentAmount/g.targetAmount)*100).toFixed(0)}% complete`).join(', ')}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a concise, friendly financial advisor. Give SHORT, actionable responses (1-2 sentences max).

${financialContext}

RULES:
- Keep responses under 50 words when possible
- Be specific and actionable
- Use bullet points for multiple points
- Don't repeat numbers unnecessarily
- Focus on ONE key insight per response
- Use emojis sparingly (max 1-2)

Examples:
User: "How's my spending?"
Good: "Your 32% savings rate is excellent! 💪 Consider reducing Bills & Utilities (₹55K) - that seems high."
Bad: "This month looks pretty good overall! You've maintained a healthy savings rate of 32.1%..."
`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    })

    const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request."

    return NextResponse.json({ 
      response: aiResponse
    })

  } catch (error) {
    console.error('Error in AI chat:', error)
    return NextResponse.json({ 
      error: 'Failed to process your message. Please try again.' 
    }, { status: 500 })
  }
}
