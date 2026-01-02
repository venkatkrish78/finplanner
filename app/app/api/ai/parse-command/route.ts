import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/parse-command
 * Parse natural language input into structured transaction or renewal data using Abacus.AI LLM
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { input } = await request.json()

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      )
    }

    // Get Abacus AI API key from environment
    const apiKey = process.env.ABACUS_API_KEY
    if (!apiKey) {
      console.warn('ABACUS_API_KEY not found, using fallback parsing')
      const fallbackResult = fallbackParse(input.trim())
      return NextResponse.json(fallbackResult)
    }

    // System prompt for command parsing
    const systemPrompt = `You are a financial assistant that parses natural language commands into structured data for a personal finance app.

The user can input commands for two types of entries:

1. **Transactions** (income/expense/transfer):
   - Example: "Spent ₹500 on groceries"
   - Example: "Received ₹10000 salary"
   - Example: "Paid ₹2500 for electricity bill"

2. **Renewals/Bills** (recurring obligations like insurance, subscriptions):
   - Example: "Add renewal LIC due 19 Mar yearly ₹6527"
   - Example: "Medical insurance ₹28011 policy 3073 annual due April"
   - Example: "Add Netflix subscription ₹199 monthly"

Parse the input and return a JSON object with:
{
  "type": "transaction" | "renewal" | "unknown",
  "confidence": "high" | "medium" | "low",
  "data": {
    // For transactions:
    "amount": number,
    "type": "INCOME" | "EXPENSE" | "TRANSFER",
    "description": string,
    "merchant": string (optional),
    "date": ISO date string (default to today if not specified),
    "suggestedCategory": string (groceries, salary, bills, utilities, etc.),
    
    // For renewals:
    "name": string,
    "amount": number,
    "frequency": "ONE_TIME" | "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY",
    "provider": string (optional - company/vendor name),
    "policyNumber": string (optional),
    "nextDueDate": ISO date string,
    "description": string (optional),
    "suggestedCategory": string
  },
  "reasoning": string (brief explanation of your parsing)
}

Important guidelines:
- Currency symbols (₹, Rs, INR) should be stripped from amounts
- Dates can be in various formats: "19 Mar", "April 2026", "next month", etc.
- Keywords like "spent", "paid", "bought" indicate EXPENSE
- Keywords like "received", "earned", "salary", "income" indicate INCOME
- Keywords like "renewal", "subscription", "due", "annual", "monthly" indicate a renewal/bill
- Frequency keywords: yearly/annual, monthly, quarterly (every 3 months), half-yearly (every 6 months), weekly
- Default frequency to MONTHLY if not clear
- Set confidence to "high" if all key fields are clear, "medium" if some inference is needed, "low" if very ambiguous

Return only valid JSON, no additional text.`

    const userMessage = `Parse this command: "${input.trim()}"`

    try {
      // Call Abacus.AI Chat LLM API via HTTP
      const response = await fetch('https://api.abacus.ai/api/v0/createChatLlmResponse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          messages: [
            { is_user: false, text: systemPrompt },
            { is_user: true, text: userMessage }
          ],
          llmName: 'GPT_4_TURBO',
          temperature: 0.3,
          maxTokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const responseData = await response.json()

      // Extract the response text
      const llmOutput = responseData.content || responseData.text || ''
      
      // Try to parse as JSON
      let parsed: any

      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = llmOutput.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || llmOutput.match(/\{[\s\S]*\}/)
        const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : llmOutput
        
        parsed = JSON.parse(jsonText.trim())
      } catch (parseError) {
        console.error('Failed to parse LLM output as JSON:', llmOutput)
        throw new Error('LLM did not return valid JSON')
      }

      // Validate and normalize the response
      const result = {
        type: parsed.type || 'unknown',
        confidence: parsed.confidence || 'low',
        data: parsed.data || {},
        originalInput: input.trim(),
        reasoning: parsed.reasoning || ''
      }

      // Set default date if not provided
      if (result.type === 'transaction' && !result.data.date) {
        result.data.date = new Date().toISOString()
      }

      return NextResponse.json(result)
    } catch (llmError: any) {
      console.error('LLM API Error:', llmError)
      
      // Fallback to pattern-based parsing if LLM fails
      const fallbackResult = fallbackParse(input.trim())
      return NextResponse.json(fallbackResult)
    }
  } catch (error) {
    console.error('Error parsing command:', error)
    return NextResponse.json(
      { error: 'Failed to parse command' },
      { status: 500 }
    )
  }
}

/**
 * Fallback pattern-based parser if LLM fails
 */
function fallbackParse(input: string): any {
  const lowerInput = input.toLowerCase()

  // Try to extract amount
  const amountMatch = input.match(/(?:₹|rs\.?\s*|inr\s*)(\d+(?:,\d{3})*(?:\.\d{2})?)/i) ||
    input.match(/(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:₹|rs|rupees|inr)/i)
  
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null

  if (!amount) {
    return {
      type: 'unknown',
      confidence: 'low',
      data: {},
      originalInput: input,
      reasoning: 'Could not extract amount from input'
    }
  }

  // Determine if it's a transaction or renewal
  const isRenewal = /(?:renewal|subscription|bill|due|annual|yearly|monthly|quarterly)/i.test(input)
  const isExpense = /(?:spent|paid|bought|purchase)/i.test(input)
  const isIncome = /(?:received|earned|salary|income)/i.test(input)

  if (isRenewal) {
    // Try to extract frequency
    let frequency: string = 'MONTHLY'
    if (/yearly|annual/i.test(input)) frequency = 'YEARLY'
    else if (/monthly/i.test(input)) frequency = 'MONTHLY'
    else if (/quarterly/i.test(input)) frequency = 'QUARTERLY'
    else if (/half[\s-]?yearly|semi[\s-]?annual/i.test(input)) frequency = 'HALF_YEARLY'
    else if (/weekly/i.test(input)) frequency = 'WEEKLY'

    // Try to extract name
    const words = input.split(/\s+/)
    const name = words.slice(0, 3).join(' ') // Take first few words as name

    return {
      type: 'renewal',
      confidence: 'medium',
      data: {
        name,
        amount,
        frequency,
        nextDueDate: new Date().toISOString(),
        suggestedCategory: 'Bills & Utilities'
      },
      originalInput: input,
      reasoning: 'Pattern-based parsing (fallback)'
    }
  } else {
    // Transaction
    const type = isIncome ? 'INCOME' : 'EXPENSE'
    
    // Try to extract description
    const description = input
      .replace(/(?:₹|rs\.?\s*|inr\s*)\d+(?:,\d{3})*(?:\.\d{2})?/gi, '')
      .replace(/spent|paid|received|earned/gi, '')
      .trim()

    return {
      type: 'transaction',
      confidence: 'medium',
      data: {
        amount,
        type,
        description: description || 'Transaction',
        date: new Date().toISOString(),
        suggestedCategory: isExpense ? 'Expenses' : 'Income'
      },
      originalInput: input,
      reasoning: 'Pattern-based parsing (fallback)'
    }
  }
}
