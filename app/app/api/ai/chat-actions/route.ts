import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoalType } from '@prisma/client'
import { AssetClass, InvestmentPlatform } from '@/lib/types'

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
8. NEED_CLARIFICATION - Need more information to proceed

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

ASSET CLASSES (for investments):
- STOCKS
- MUTUAL_FUNDS
- CRYPTO
- REAL_ESTATE
- GOLD
- BONDS
- PPF
- EPF
- NSC
- ELSS

INVESTMENT PLATFORMS:
- ZERODHA
- GROWW
- ANGEL_ONE
- UPSTOX
- PAYTM_MONEY
- KUVERA
- COIN_DCBBANK
- HDFC_SECURITIES
- ICICI_DIRECT
- KOTAK_SECURITIES

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
    "frequency": "MONTHLY|WEEKLY|YEARLY",
    "platform": "PLATFORM_NAME"
  },
  "confidence": 0.0-1.0,
  "missingInfo": ["field1", "field2"], // What information is missing
  "clarificationNeeded": "What specific question to ask user"
}

RULES:
1. If amount is missing or unclear → action: "NEED_CLARIFICATION", clarificationNeeded: "How much did you invest/spend?"
2. If investment platform is not mentioned → action: "NEED_CLARIFICATION", clarificationNeeded: "Which platform did you use? (Zerodha, Groww, Angel One, etc.)"
3. If date is vague → action: "NEED_CLARIFICATION", clarificationNeeded: "When exactly did this happen?"
4. If goal target date is missing → action: "NEED_CLARIFICATION", clarificationNeeded: "By when do you want to achieve this goal?"

Examples:
"I invested in mutual funds" → {"action": "NEED_CLARIFICATION", "clarificationNeeded": "How much did you invest and which platform did you use?", "confidence": 0.8}

"I invested ₹10000 in mutual funds on Zerodha" → {"action": "ADD_INVESTMENT", "data": {"amount": 10000, "description": "mutual fund investment", "platform": "ZERODHA"}, "confidence": 0.9}

"Add grocery expense" → {"action": "NEED_CLARIFICATION", "clarificationNeeded": "How much did you spend on groceries?", "confidence": 0.8}

"Add ₹500 grocery expense from yesterday" → {"action": "ADD_TRANSACTION", "data": {"amount": 500, "description": "grocery shopping", "category": "Food & Dining", "type": "EXPENSE", "date": "2025-06-21"}, "confidence": 0.9}

If confidence < 0.6, set action to "QUERY_ONLY"`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    })

    let extractedData
    try {
      extractedData = JSON.parse(analysisCompletion.choices[0]?.message?.content || '{"action": "QUERY_ONLY"}')
    } catch {
      extractedData = { action: "QUERY_ONLY" }
    }

    // If clarification is needed, ask the user
    if (extractedData.action === "NEED_CLARIFICATION") {
      return NextResponse.json({
        response: extractedData.clarificationNeeded || "I need more information to help you with that. Can you provide more details?",
        actionPerformed: false,
        needsClarification: true,
        extractedData: extractedData.data || {}
      })
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
              content: "You are a helpful financial assistant. Confirm the action was completed successfully. Be brief, friendly, and specific about what was added. Also provide a helpful tip or insight related to what they just added."
            },
            {
              role: "user",
              content: `I successfully ${extractedData.action.toLowerCase().replace('_', ' ')} with data: ${JSON.stringify(extractedData.data)}. Confirm this to the user in a natural way and give a brief tip.`
            }
          ],
          temperature: 0.7,
          max_tokens: 150
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
- Total Investments: ${userFinancialData.investmentCount}

You can help users:
1. Add transactions (expenses/income)
2. Create bills and reminders
3. Set financial goals
4. Track investments
5. Manage loans
6. Provide financial insights

IMPORTANT: If users mention wanting to add something but don't provide complete information, ask follow-up questions:
- "How much?" for amounts
- "When?" for dates
- "Which platform?" for investments
- "By when?" for goal deadlines

Examples of good follow-ups:
- "I'd be happy to help you add that investment! How much did you invest and which platform did you use?"
- "Great! I can add that expense. How much did you spend?"
- "I can help you set up that goal. What's your target amount and by when do you want to achieve it?"

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
      suggestion: extractedData.confidence > 0.5 ? "I detected you might want to add some financial data. Feel free to provide more details!" : null
    })

  } catch (error) {
    console.error('Error in AI chat actions:', error)
    return NextResponse.json({ 
      error: 'Failed to process your message. Please try again.' 
    }, { status: 500 })
  }
}

function determineGoalType(description: string): GoalType {
  const desc = description.toLowerCase()
  const goalTypeKeywords = {
    EMERGENCY_FUND: ['emergency', 'fund', 'backup'],
    HOUSE: ['house', 'home', 'property', 'real estate'],
    VACATION: ['vacation', 'travel', 'trip', 'holiday'],
    EDUCATION: ['education', 'study', 'course', 'school', 'college'],
    RETIREMENT: ['retirement', 'pension', 'retire'],
    DEBT_PAYOFF: ['debt', 'loan', 'payoff', 'pay off'],
    INVESTMENT: ['invest', 'portfolio', 'stocks', 'mutual fund'],
    SAVINGS: ['save', 'saving', 'money'],
  }
  
  for (const [type, keywords] of Object.entries(goalTypeKeywords)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return type as GoalType
    }
  }
  return GoalType.OTHER
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
        // Get or create default category for bills
        let billCategory = await prisma.category.findFirst({
          where: { name: 'Bills & Utilities', userId }
        })
        
        if (!billCategory) {
          billCategory = await prisma.category.create({
            data: { name: 'Bills & Utilities', userId }
          })
        }        const bill = await prisma.bill.create({
          data: {
            name: data.description,
            amount: data.amount,
            nextDueDate: new Date(data.dueDate || new Date()),
            frequency: data.frequency || 'MONTHLY',
            description: data.description,
            categoryId: billCategory.id,            userId
          }
        })
        
        return { success: true, data: bill }

      case 'ADD_GOAL':
        const goal = await prisma.financialGoal.create({
          data: {
            name: data.description,
            targetAmount: data.targetAmount,
            currentAmount: 0,
            goalType: determineGoalType(data.description),            targetDate: new Date(data.targetDate),
            userId
          }
        })
        
        return { success: true, data: goal }

      case 'ADD_INVESTMENT':
        // Determine asset class based on description
        let assetClass = AssetClass.MUTUAL_FUNDS // default
        let platform = data.platform || 'ZERODHA' // Use provided platform or default
        
        const description = data.description.toLowerCase()
        if (description.includes('stock') || description.includes('share')) {
          assetClass = AssetClass.STOCKS
        } else if (description.includes('mutual fund') || description.includes('sip')) {
          assetClass = AssetClass.MUTUAL_FUNDS
        } else if (description.includes('crypto') || description.includes('bitcoin')) {
          assetClass = AssetClass.CRYPTO
        } else if (description.includes('gold')) {
          assetClass = AssetClass.GOLD
        } else if (description.includes('bond')) {
          assetClass = AssetClass.BONDS
        } else if (description.includes('real estate') || description.includes('property')) {
          assetClass = AssetClass.REAL_ESTATE
        } else if (description.includes('ppf')) {
          assetClass = AssetClass.PPF
        } else if (description.includes('epf')) {
          assetClass = AssetClass.EPF
        } else if (description.includes('elss')) {
          assetClass = AssetClass.ELSS
        }

        const investment = await prisma.investment.create({
          data: {
            name: data.description,
            assetClass: assetClass,
            platform: platform,
            quantity: 1,
            averagePrice: data.amount,
            currentPrice: data.amount,
            totalInvested: data.amount,
            currentValue: data.amount,
            purchaseDate: new Date(data.date || new Date()),
            description: data.description,
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
            loanType: 'PERSONAL_LOAN',
            startDate: new Date(),            tenure: 60,
            emiAmount: Math.round(data.amount / 60),
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
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" }
  }
}

async function getUserFinancialData(userId: string) {
  const [transactionCount, recentExpenses, goalCount, billCount, investmentCount] = await Promise.all([
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
    prisma.bill.count({ where: { userId } }),
    prisma.investment.count({ where: { userId } })
  ])

  return {
    transactionCount,
    recentExpenses: Math.abs(recentExpenses._sum.amount || 0),
    goalCount,
    billCount,
    investmentCount
  }
}
