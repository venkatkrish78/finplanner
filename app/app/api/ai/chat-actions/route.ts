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

    // First, analyze the message to determine intent and extract data
    const analysisCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a financial data extraction assistant. Analyze user messages and extract financial actions.

SUPPORTED ACTIONS:
1. ADD_TRANSACTION - Add income/expense
2. ADD_BILL - Add or update bill
3. ADD_GOAL - Create financial goal
4. ADD_INVESTMENT - Add investment
5. ADD_LOAN - Add loan
6. UPDATE_GOAL - Update goal progress
7. QUERY_ONLY - Just asking questions, no data changes

CATEGORIES for transactions:
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Travel
- Income
- Other

Extract information in this JSON format:
{
  "action": "ACTION_TYPE",
  "data": {
    "amount": number,
    "description": "string",
    "category": "string",
    "date": "YYYY-MM-DD",
    "type": "INCOME|EXPENSE",
    "dueDate": "YYYY-MM-DD",
    "targetAmount": number,
    "targetDate": "YYYY-MM-DD",
    "frequency": "MONTHLY|WEEKLY|YEARLY"
  },
  "confidence": 0.0-1.0
}

Date parsing examples:
- "today" → current date
- "yesterday" → previous day
- "last Monday" → calculate date
- "25th" → 25th of current month
- "next month" → first day of next month

Amount parsing examples:
- "₹500", "500 rupees", "five hundred" → 500
- "₹1,200", "twelve hundred" → 1200
- "₹2 lakhs" → 200000

Examples:
"Add ₹500 grocery expense from yesterday" → {"action": "ADD_TRANSACTION", "data": {"amount": 500, "description": "grocery shopping", "category": "Food & Dining", "type": "EXPENSE", "date": "2025-06-21"}, "confidence": 0.9}

"I want to save ₹50000 for vacation by December" → {"action": "ADD_GOAL", "data": {"targetAmount": 50000, "description": "vacation fund", "targetDate": "2025-12-31"}, "confidence": 0.8}

"My electricity bill is ₹2400 due on 25th" → {"action": "ADD_BILL", "data": {"amount": 2400, "description": "electricity bill", "dueDate": "2025-06-25", "frequency": "MONTHLY"}, "confidence": 0.9}

If confidence < 0.7, set action to "QUERY_ONLY"`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.1,
      max_tokens: 400
    })

    let extractedData
    try {
      extractedData = JSON.parse(analysisCompletion.choices[0]?.message?.content || '{"action": "QUERY_ONLY"}')
    } catch {
      extractedData = { action: "QUERY_ONLY" }
    }

    // If high confidence action detected, execute it
    if (extractedData.confidence > 0.7 && extractedData.action !== "QUERY_ONLY") {
      const actionResult = await executeAction(userId, extractedData)
      
      if (actionResult.success) {
        // Generate confirmation response
        const confirmationCompletion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful financial assistant. Confirm the action was completed successfully. Be brief, friendly, and specific about what was added."
            },
            {
              role: "user",
              content: `I successfully ${extractedData.action.toLowerCase().replace('_', ' ')} with data: ${JSON.stringify(extractedData.data)}. Confirm this to the user in a natural way.`
            }
          ],
          temperature: 0.7,
          max_tokens: 100
        })

        return NextResponse.json({
          response: confirmationCompletion.choices[0]?.message?.content,
          actionPerformed: true,
          action: extractedData.action,
          data: actionResult.data,
          extractedData: extractedData.data
        })
      } else {
        return NextResponse.json({
          response: `I couldn't complete that action: ${actionResult.error}. Please try again or add it manually.`,
          actionPerformed: false,
          error: actionResult.error
        })
      }
    }

    // If no action or low confidence, treat as regular chat
    const userFinancialData = await getUserFinancialData(userId)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful financial advisor assistant. You can help users manage their finances and answer questions.

User's Financial Summary:
- Total Transactions: ${userFinancialData.transactionCount}
- Recent Expenses: ₹${userFinancialData.recentExpenses}
- Active Goals: ${userFinancialData.goalCount}
- Active Bills: ${userFinancialData.billCount}

You can help users:
1. Add transactions (expenses/income)
2. Create bills and reminders
3. Set financial goals
4. Track investments
5. Manage loans
6. Provide financial insights

If they want to add data, encourage them to use natural language like:
- "Add ₹500 grocery expense"
- "I paid my electricity bill ₹2400"
- "Create a goal to save ₹50000 for vacation"

Be conversational and helpful!`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    })

    return NextResponse.json({
      response: completion.choices[0]?.message?.content,
      actionPerformed: false,
      suggestion: extractedData.confidence > 0.5 ? "I detected you might want to add some financial data. Try being more specific with amounts and dates!" : null
    })

  } catch (error) {
    console.error('Error in AI chat actions:', error)
    return NextResponse.json({ 
      error: 'Failed to process your message. Please try again.' 
    }, { status: 500 })
  }
}

async function executeAction(userId: string, extractedData: any) {
  try {
    const { action, data } = extractedData

    switch (action) {
      case 'ADD_TRANSACTION':
        // Get or create category
        let category = await prisma.category.findFirst({
          where: { name: data.category, userId }
        })
        
        if (!category) {
          category = await prisma.category.create({
            data: { name: data.category, userId }
          })
        }

        const transaction = await prisma.transaction.create({
          data: {
            amount: data.type === 'EXPENSE' ? -Math.abs(data.amount) : Math.abs(data.amount),
            description: data.description,
            date: new Date(data.date || new Date()),
            type: data.type,
            categoryId: category.id,
            userId
          }
        })
        
        return { success: true, data: transaction }

      case 'ADD_BILL':
        const bill = await prisma.bill.create({
          data: {
            name: data.description,
            amount: data.amount,
            dueDate: new Date(data.dueDate || new Date()),
            nextDueDate: new Date(data.dueDate || new Date()),
            frequency: data.frequency || 'MONTHLY',
            userId
          }
        })
        
        return { success: true, data: bill }

      case 'ADD_GOAL':
        const goal = await prisma.financialGoal.create({
          data: {
            name: data.description,
            targetAmount: data.targetAmount,
            currentAmount: 0,
            targetDate: new Date(data.targetDate),
            userId
          }
        })
        
        return { success: true, data: goal }

      case 'ADD_INVESTMENT':
        const investment = await prisma.investment.create({
          data: {
            name: data.description,
            type: 'MUTUAL_FUND',
            purchasePrice: data.amount,
            currentValue: data.amount,
            quantity: 1,
            userId
          }
        })
        
        return { success: true, data: investment }

      case 'ADD_LOAN':
        const loan = await prisma.loan.create({
          data: {
            name: data.description,
            principalAmount: data.amount,
            currentBalance: data.amount,
            interestRate: 10,
            termMonths: 60,
            monthlyPayment: Math.round(data.amount / 60),
            userId
          }
        })
        
        return { success: true, data: loan }

      case 'UPDATE_GOAL':
        const existingGoal = await prisma.financialGoal.findFirst({
          where: { 
            userId,
            name: { contains: data.description, mode: 'insensitive' }
          }
        })

        if (existingGoal) {
          const updatedGoal = await prisma.financialGoal.update({
            where: { id: existingGoal.id },
            data: { 
              currentAmount: existingGoal.currentAmount + (data.amount || 0)
            }
          })
          return { success: true, data: updatedGoal }
        } else {
          return { success: false, error: 'Goal not found' }
        }

      default:
        return { success: false, error: 'Unknown action' }
    }
  } catch (error) {
    console.error('Action execution error:', error)
    return { success: false, error: error.message }
  }
}

async function getUserFinancialData(userId: string) {
  const [transactionCount, recentExpenses, goalCount, billCount] = await Promise.all([
    prisma.transaction.count({ where: { userId } }),
    prisma.transaction.aggregate({
      where: { 
        userId, 
        amount: { lt: 0 },
        date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      _sum: { amount: true }
    }),
    prisma.financialGoal.count({ where: { userId } }),
    prisma.bill.count({ where: { userId } })
  ])

  return {
    transactionCount,
    recentExpenses: Math.abs(recentExpenses._sum.amount || 0),
    goalCount,
    billCount
  }
}
