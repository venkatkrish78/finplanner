import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { GoalType } from '@prisma/client'

// Remove the module-level OpenAI initialization
// const openai = new OpenAI({ ... }) // ❌ This causes build errors

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
    // Regular numbers with commas: 1,00,000 or 100,000
    { regex: /(\d{1,3}(?:,\d{2,3})*)\b/, multiplier: 1 },
    // Simple numbers: 50000
    { regex: /(\d+)\b/, multiplier: 1 }
  ]

  for (const pattern of patterns) {
    const match = lowerText.match(pattern.regex)
    if (match) {
      const numStr = match[1].replace(/,/g, '')
      const num = parseFloat(numStr)
      if (!isNaN(num)) {
        const result = num * pattern.multiplier
        console.log(`Matched pattern: ${pattern.regex}, num: ${num}, multiplier: ${pattern.multiplier}, result: ${result}`)
        return result
      }
    }
  }
  
  console.log('No pattern matched for:', text)
  return null
}

// Enhanced goal type detection
function detectGoalType(text: string): GoalType {
  const lowerText = text.toLowerCase()
  
  // Emergency fund keywords
  if (lowerText.includes('emergency') || lowerText.includes('contingency') || 
      lowerText.includes('backup') || lowerText.includes('safety')) {
    return GoalType.EMERGENCY_FUND
  }
  
  // Retirement keywords
  if (lowerText.includes('retirement') || lowerText.includes('pension') || 
      lowerText.includes('old age') || lowerText.includes('retire')) {
    return GoalType.RETIREMENT
  }
  
  // Education keywords
  if (lowerText.includes('education') || lowerText.includes('study') || 
      lowerText.includes('college') || lowerText.includes('school') ||
      lowerText.includes('course') || lowerText.includes('degree')) {
    return GoalType.EDUCATION
  }
  
  // House keywords
  if (lowerText.includes('house') || lowerText.includes('home') || 
      lowerText.includes('property') || lowerText.includes('flat') ||
      lowerText.includes('apartment') || lowerText.includes('real estate')) {
    return GoalType.HOUSE
  }
  
  // Car keywords
  if (lowerText.includes('car') || lowerText.includes('vehicle') || 
      lowerText.includes('bike') || lowerText.includes('motorcycle') ||
      lowerText.includes('auto')) {
    return GoalType.CAR
  }
  
  // Travel keywords
  if (lowerText.includes('travel') || lowerText.includes('trip') || 
      lowerText.includes('vacation') || lowerText.includes('holiday') ||
      lowerText.includes('tour')) {
    return GoalType.TRAVEL
  }
  
  // Wedding keywords
  if (lowerText.includes('wedding') || lowerText.includes('marriage') || 
      lowerText.includes('shaadi')) {
    return GoalType.WEDDING
  }
  
  // Default to OTHER
  return GoalType.OTHER
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Runtime check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' }, 
        { status: 500 }
      )
    }

    // Initialize OpenAI client inside the function (not at module level)
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const { message, action } = await request.json()

    if (action === 'create_goal') {
      // Parse the message to extract goal details
      const targetAmount = parseIndianAmount(message)
      const goalType = detectGoalType(message)
      
      if (!targetAmount) {
        return NextResponse.json({
          response: "I couldn't understand the target amount. Please specify the amount clearly (e.g., '5 lakhs', '2.5 crores', '50000').",
          action: 'clarify_amount'
        })
      }

      // Extract goal name from message
      let goalName = message
      if (message.length > 50) {
        goalName = message.substring(0, 47) + '...'
      }

      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email }
        })

        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const goal = await prisma.goal.create({
          data: {
            name: goalName,
            targetAmount: targetAmount,
            currentAmount: 0,
            targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            goalType: goalType,
            userId: user.id,
            description: `Goal created via AI chat: ${message}`
          }
        })

        return NextResponse.json({
          response: `Great! I've created a ${goalType.toLowerCase().replace('_', ' ')} goal for ₹${targetAmount.toLocaleString('en-IN')}. You can view and manage it in your goals section.`,
          action: 'goal_created',
          goalId: goal.id
        })

      } catch (error) {
        console.error('Goal creation error:', error)
        return NextResponse.json({
          response: "I encountered an error while creating your goal. Please try again or create it manually in the goals section.",
          action: 'error'
        })
      }
    }

    // Regular AI chat
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful Indian financial assistant for FinPlanner app. 
          Help users with budgeting, investments, and financial planning specific to India.
          Use Indian currency (₹) and understand Indian financial terms like lakhs, crores, SIP, PPF, EPF, etc.
          Be conversational and helpful. If users mention wanting to save for something, ask if they'd like to create a goal.`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    return NextResponse.json({
      response: completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request."
    })

  } catch (error) {
    console.error('AI Chat Error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' }, 
      { status: 500 }
    )
  }
}
