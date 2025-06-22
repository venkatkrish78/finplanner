import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { GoalType } from '@prisma/client'

// Enhanced Indian number parsing - FIXED VERSION
function parseIndianAmount(text: string): number | null {
  const lowerText = text.toLowerCase()
  console.log('Parsing text:', text) // Debug log

  // Handle Indian number formats - FIXED REGEX
  const patterns = [
    // Lakhs: 2 lakhs, 2.5 lakhs, 2L, 2.5L
    { regex: /(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|l)\b/i, multiplier: 100000 },
    // Crores: 1 crore, 1.5 crores, 1Cr, 1.5Cr  
    { regex: /(\d+(?:\.\d+)?)\s*(?:crores?|cr)\b/i, multiplier: 10000000 },
    // Thousands: 50k, 50K, 50 thousand
    { regex: /(\d+(?:\.\d+)?)\s*(?:thousands?|k)\b/i, multiplier: 1000 },
    // Rs/₹ with numbers: Rs 2000, ₹2000, Rs. 2000, rupees 10000
    { regex: /(?:rs\.?|₹|rupees?)\s*(\d+(?:,\d+)*(?:\.\d+)?)/i, multiplier: 1 },
    // Regular numbers with commas: 2,00,000
    { regex: /(\d{1,3}(?:,\d{2}){1,}(?:,\d{3})*)/g, multiplier: 1 },
    // Simple numbers: 2000, 50000
    { regex: /\b(\d+(?:\.\d+)?)\b/g, multiplier: 1 }
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern.regex)
    if (match) {
      let amount = parseFloat(match[1].replace(/,/g, ''))
      console.log('Found amount:', amount, 'multiplier:', pattern.multiplier) // Debug log
      return amount * pattern.multiplier
    }
  }

  console.log('No amount found in:', text) // Debug log
  return null
}

async function getUserFinancialData(userId: string) {
  try {
    const [transactions, bills, goals, categories, assets, loans, investments] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 20,
        include: { category: true }
      }),
      prisma.bill.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 10
      }),
      prisma.financialGoal.findMany({
        where: { userId },
        orderBy: { id: 'desc' },
        take: 10
      }),
      prisma.category.findMany({
        where: { userId }
      }),
      prisma.asset.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 10
      }),
      prisma.loan.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 10
      }),
      prisma.investment.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 10
      })
    ])

    // Calculate comprehensive financial metrics
    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0)
    const totalBalance = totalIncome - totalExpenses

    const totalAssets = assets.reduce((sum, a) => sum + a.value, 0)
    const totalLoans = loans.reduce((sum, l) => sum + l.currentBalance, 0)
    const totalInvestments = investments.reduce((sum, i) => sum + i.currentValue, 0)

    // Net Worth = Investments - Loans (matching dashboard)
    const netWorth = totalInvestments - totalLoans

    const savingsRate = totalIncome > 0 ? ((totalBalance / totalIncome) * 100) : 0

    return {
      transactions,
      bills,
      goals,
      categories,
      assets,
      loans,
      investments,
      totalBalance,
      totalAssets,
      totalLoans,
      totalInvestments,
      totalIncome,
      totalExpenses,
      netWorth,
      savingsRate
    }
  } catch (error) {
    console.error('Error fetching financial data:', error)
    return null
  }
}

// Format Indian currency
function formatIndianCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`
  } else {
    return `₹${amount.toFixed(0)}`
  }
}

async function processUserRequest(message: string, userId: string, financialData: any) {
  const lowerMessage = message.toLowerCase()
  console.log('Processing message:', message) // Debug log

  // Enhanced transaction patterns - MORE FLEXIBLE
  const transactionMatch = lowerMessage.match(/add|spent|expense|income|received|paid|bought|purchase|kharcha|paisa|spend|got|earn/)
  const amount = parseIndianAmount(message)

  console.log('Transaction match:', !!transactionMatch, 'Amount:', amount) // Debug log

  if (transactionMatch && amount && amount > 0) {
    // ENHANCED INCOME DETECTION - Fixed to catch all patterns
    const isIncome = lowerMessage.match(/received|income|salary|earned|got|bonus|freelance|kamaya|mila|gift|rental|rent|dividend|interest|profit|commission|refund|cashback|reward|prize|winning|inheritance|as\s+income|for\s+me|to\s+me|from/)
    const type = isIncome ? 'INCOME' : 'EXPENSE'

    console.log('Income keywords found:', !!isIncome, 'Type:', type) // Debug log

    // Enhanced Indian category detection
    let categoryName = 'Other'
    const categoryKeywords = {
      'Food & Dining': ['food', 'restaurant', 'dining', 'lunch', 'dinner', 'breakfast', 'meal', 'pizza', 'burger', 'khana', 'khaana', 'hotel', 'dhaba', 'biryani', 'dosa', 'idli'],
      'Groceries': ['grocery', 'groceries', 'supermarket', 'vegetables', 'fruits', 'milk', 'bread', 'sabzi', 'kirana', 'ration', 'dal', 'chawal', 'atta'],
      'Transportation': ['uber', 'taxi', 'bus', 'train', 'fuel', 'petrol', 'transport', 'metro', 'auto', 'rickshaw', 'ola', 'rapido', 'diesel', 'cng', 'foot', 'walking'],
      'Shopping': ['shopping', 'clothes', 'shirt', 'shoes', 'amazon', 'flipkart', 'dress', 'jeans', 'myntra', 'ajio', 'kapde'],
      'Entertainment': ['movie', 'cinema', 'game', 'entertainment', 'fun', 'netflix', 'spotify', 'youtube', 'prime', 'hotstar', 'film'],
      'Bills & Utilities': ['electricity', 'water', 'gas', 'internet', 'phone', 'bill', 'utility', 'bijli', 'paani', 'wifi', 'mobile', 'recharge'],
      'Healthcare': ['doctor', 'medicine', 'hospital', 'health', 'medical', 'pharmacy', 'dawai', 'clinic', 'checkup'],
      'Salary': ['salary', 'paycheck', 'wage', 'bonus', 'tankhwah'],
      'Rental Income': ['rental', 'rent'],
      'Gift': ['gift', 'present', 'mother', 'father', 'family', 'friend'],
      'Coffee': ['coffee', 'tea', 'cafe', 'starbucks', 'ccd', 'chai', 'cutting chai']
    }

    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        categoryName = cat
        break
      }
    }

    try {
      let category = await prisma.category.findFirst({
        where: { name: categoryName, userId }
      })

      if (!category) {
        category = await prisma.category.create({
          data: { name: categoryName, userId }
        })
      }

      const transaction = await prisma.transaction.create({
        data: {
          amount,
          type,
          description: category.name,
          merchant: "AI Assistant",
          date: new Date(),
          categoryId: category.id,
          userId,
          status: "SUCCESS",
          source: "MANUAL"
        }
      })
      console.log('Transaction created:', transaction) // Debug log

      const newBalance = (financialData?.totalBalance || 0) + (type === 'INCOME' ? amount : -amount)
      const newNetWorth = (financialData?.netWorth || 0) + (type === 'INCOME' ? amount : -amount)

      return {
        response: `✅ Added ${formatIndianCurrency(amount)} ${type.toLowerCase()} (${categoryName}). Balance: ${formatIndianCurrency(newBalance)}, Net Worth: ${formatIndianCurrency(newNetWorth)}`,
        success: true
      }
    } catch (error) {
      console.error('Transaction creation error:', error)
      return {
        response: `❌ Couldn't add transaction: ${error instanceof Error ? error.message : "Unknown error"}. Try: "Add ₹100 coffee" or "Spent Rs 2000 on food"`,
        success: false
      }
    }
  }

  // Goal patterns with Indian amounts
  const goalMatch = lowerMessage.match(/save|goal|target|want to|bachana|jama/)
  if (goalMatch && amount && amount > 0) {
    let goalName = message.replace(/₹?[\d,.]+(?: ?(?:lakhs?|lacs?|crores?|thousands?|k|l|cr))?/gi, '').replace(/save|goal|target|want to|for|bachana|jama/gi, '').trim()

    if (!goalName || goalName.length < 3) goalName = 'Savings Goal'

    const goalTypeKeywords: Record<keyof typeof GoalType, string[]> = {
      HOUSE: ['house', 'home', 'property', 'ghar', 'flat', 'apartment'],
      VACATION: ['vacation', 'trip', 'travel', 'holiday', 'ghumna'],
      EDUCATION: ['education', 'course', 'study', 'college', 'padhai'],
      EMERGENCY_FUND: ['emergency', 'fund', 'backup'],
      RETIREMENT: ['retirement', 'pension'],
      INVESTMENT: ['investment', 'invest', 'nivesh'],
      SAVINGS: ['save', 'saving', 'money'],
      DEBT_PAYOFF: ['debt', 'loan', 'payoff'],
      OTHER: []
    }

    let goalType: GoalType = GoalType.OTHER

    for (const [type, keywords] of Object.entries(goalTypeKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        goalType = GoalType[type as keyof typeof GoalType]
        break
      }
    }
    for (const [type, keywords] of Object.entries(goalTypeKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        goalType = type as GoalType
        break
      }
    }

    try {
      await prisma.financialGoal.create({
        data: {
          name: goalName,
          targetAmount: amount,
          currentAmount: 0,
          goalType,
          userId
        }
      })

      return {
        response: `🎯 Created goal "${goalName}" - ${formatIndianCurrency(amount)} target! Start saving towards it.`,
        success: true
      }
    } catch (error) {
      return {
        response: `❌ Couldn't create goal. Try: "Save 5 lakhs for house" or "Want to save ₹50000 for vacation"`,
        success: false
      }
    }
  }

  // Net worth and analysis requests
  if (lowerMessage.includes('net worth') || lowerMessage.includes('networth') || lowerMessage.includes('total wealth')) {
    if (!financialData) {
      return {
        response: `📊 No financial data found. Add transactions, assets, and investments to calculate net worth!`,
        success: true
      }
    }

    const { netWorth, totalBalance, totalAssets, totalInvestments, totalLoans } = financialData

    return {
      response: `💎 Net Worth: ${formatIndianCurrency(netWorth)}\n📈 Total Assets: ${formatIndianCurrency(totalInvestments)}\n💳 Total Liabilities: ${formatIndianCurrency(totalLoans)}\n\n(Assets - Liabilities = Net Worth)`,
      success: true
    }
  }

  // Comprehensive analysis requests
  if (lowerMessage.includes('how am i doing') || lowerMessage.includes('analysis') || lowerMessage.includes('summary') || lowerMessage.includes('overview') || lowerMessage.includes('kaise chal raha')) {
    if (!financialData) {
      return {
        response: `📊 No financial data found. Start by adding transactions!`,
        success: true
      }
    }

    const { 
      totalBalance, 
      netWorth, 
      savingsRate, 
      transactions, 
      goals, 
      assets, 
      loans, 
      investments
    } = financialData

    // Top spending category
    const categorySpending: Record<string, number> = {}
    transactions.filter((t: any) => t.type === 'EXPENSE').forEach((t: any) => {
      const cat = t.category?.name || 'Other'
      categorySpending[cat] = (categorySpending[cat] || 0) + t.amount
    })

    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0]

    let analysis = `📊 Financial Overview:\n\n`
    analysis += `💎 Net Worth: ${formatIndianCurrency(netWorth)}\n`
    analysis += `💰 Balance: ${formatIndianCurrency(totalBalance)}\n`
    analysis += `📈 Savings Rate: ${savingsRate.toFixed(0)}%\n`
    analysis += `📝 Transactions: ${transactions.length}\n`
    analysis += `🎯 Goals: ${goals.length} | 🏠 Assets: ${assets.length}\n`
    analysis += `💳 Loans: ${loans.length} | 📊 Investments: ${investments.length}\n`

    if (topCategory) {
      analysis += `\n🔥 Top spending: ${topCategory[0]} (${formatIndianCurrency(topCategory[1])})`
    }

    if (savingsRate > 20) {
      analysis += `\n✅ Excellent savings rate! Keep it up!`
    } else if (savingsRate > 10) {
      analysis += `\n👍 Good savings, aim for 20%+ for better wealth building`
    } else {
      analysis += `\n⚠️ Low savings rate, consider reviewing expenses`
    }

    return {
      response: analysis,
      success: true
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await request.json()
    console.log('Received message:', message) // Debug log

    // Get comprehensive financial data including net worth
    const financialData = await getUserFinancialData(session.user.id)

    // Try direct processing first
    const directResult = await processUserRequest(message, session.user.id, financialData)

    if (directResult) {
      console.log('Direct result:', directResult) // Debug log
      return NextResponse.json(directResult)
    }

    // Runtime check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        response: "I can help with your finances! Try: 'Add ₹100 coffee', 'Spent Rs 2000 on food', or 'How am I doing?'",
        success: true
      })
    }

    // ONLY CHANGE: Move OpenAI initialization inside the function
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Build Indian context for OpenAI
    let context = `User's Financial Profile (Indian context):\n`

    if (financialData) {
      context += `Net Worth: ${formatIndianCurrency(financialData.netWorth)}\n`
      context += `Total Assets (Investments): ${formatIndianCurrency(financialData.totalInvestments)}\n`
      context += `Total Liabilities (Loans): ${formatIndianCurrency(financialData.totalLoans)}\n`
      context += `Savings Rate: ${financialData.savingsRate.toFixed(0)}%\n`

      // Recent transactions
      if (financialData.transactions.length > 0) {
        context += `\nRecent Transactions:\n`
        financialData.transactions.slice(0, 5).forEach(t => {
          context += `- ${formatIndianCurrency(t.amount)} ${t.type.toLowerCase()} (${t.category?.name || 'Other'})\n`
        })
      }
    }

    const prompt = `You are a helpful Indian financial assistant. User said: "${message}"

${context}

IMPORTANT GUIDELINES:
- Use Indian financial context (SIP, PPF, ELSS, NSC, FD, RD)
- Suggest Indian investment options (mutual funds, stocks, gold, real estate)
- Consider Indian tax implications (80C, LTCG, STCG)
- Use Indian currency format (lakhs, crores)
- Be culturally aware (festivals, family financial goals)
- Respond in 1-2 short sentences
- Be encouraging and practical`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 120
    })

    return NextResponse.json({
      response: completion.choices[0].message.content || "I can help you manage your finances! Try: 'Add ₹100 coffee', 'Spent Rs 2000 on food', 'Net worth', or 'How am I doing?'",
      success: true
    })

  } catch (error) {
    console.error('AI Chat Error:', error)
    return NextResponse.json({
      response: "I can help with your finances! Try: 'Add ₹100 coffee', 'Spent Rs 2000 on food', or 'How am I doing?'",
      success: true
    })
  }
}
