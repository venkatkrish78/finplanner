import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { smsTexts } = body;

    if (!smsTexts || !Array.isArray(smsTexts) || smsTexts.length === 0) {
      return NextResponse.json(
        { error: 'SMS texts array is required' },
        { status: 400 }
      );
    }

    // Get Abacus AI API key from environment
    const apiKey = process.env.ABACUS_API_KEY;
    if (!apiKey) {
      console.warn('ABACUS_API_KEY not found, using fallback parsing');
      const fallbackResults = smsTexts.map((sms) => fallbackParseSMS(sms));
      return NextResponse.json({
        success: true,
        transactions: fallbackResults,
        count: fallbackResults.length,
        warning: 'Used fallback parsing (API key not configured)'
      });
    }

    // System prompt for SMS parsing
    const systemPrompt = `You are a financial SMS parser. Extract transaction details from Indian banking SMS messages.

For each SMS, extract:
- date: Transaction date (YYYY-MM-DD format)
- amount: Transaction amount (number, without currency symbols)
- type: "EXPENSE" or "INCOME" based on keywords (Debited/Dr/Spent = EXPENSE, Credited/Cr/Received = INCOME)
- description: Brief description (merchant name, purpose, or transaction type)
- merchant: Merchant/vendor name if identifiable
- category: Suggested category (e.g., "Groceries", "Utilities", "Transportation", "Shopping", "Food", "Healthcare", "Entertainment")
- confidence: "high", "medium", or "low" based on clarity of information
- rawText: The original SMS text

Common Indian bank SMS formats:
- "Debited Rs 500 from A/c XX1234 on 01-Jan-26 for GROCERY STORE"
- "Rs 1000 credited to A/c XX5678 on 02-Jan-26"
- "Dear customer, Rs 250 debited from your account on 03-Jan for UBER"
- "Payment of Rs 150.50 made to Netflix on 04-Jan-26"

Return a JSON array of transaction objects. If a message doesn't appear to be a financial SMS, set confidence to "low" and include a note in the description.

Example output:
[
  {
    "date": "2026-01-01",
    "amount": 500,
    "type": "EXPENSE",
    "description": "Grocery Store",
    "merchant": "GROCERY STORE",
    "category": "Groceries",
    "confidence": "high",
    "rawText": "Debited Rs 500 from A/c XX1234 on 01-Jan-26 for GROCERY STORE"
  }
]`;

    // Combine SMS texts for batch processing
    const smsInput = smsTexts.map((sms, idx) => `SMS ${idx + 1}:\n${sms}`).join('\n\n');

    try {
      // Call Abacus.AI Chat LLM API via HTTP
      const llmResponse = await fetch('https://api.abacus.ai/api/v0/createChatLlmResponse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          messages: [
            {
              is_user: false,
              text: systemPrompt
            },
            {
              is_user: true,
              text: `Parse the following SMS messages and extract transaction details:\n\n${smsInput}`
            }
          ],
          llmName: 'GPT_4_TURBO',
          temperature: 0.1,
          maxTokens: 2000
        })
      });

      if (!llmResponse.ok) {
        throw new Error(`API request failed: ${llmResponse.status} ${llmResponse.statusText}`);
      }

      const llmData = await llmResponse.json();

      // Parse LLM response
      let parsedData: any[] = [];
      
      try {
        // Extract JSON from response (handle markdown code blocks)
        const responseContent = llmData.content || llmData.text || '';
        let jsonText = responseContent.trim();
        
        // Remove markdown code blocks if present
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```\n?/g, '');
        }
        
        parsedData = JSON.parse(jsonText);
        
        // Validate structure
        if (!Array.isArray(parsedData)) {
          throw new Error('Response is not an array');
        }
        
        // Ensure all required fields exist and normalize data
        parsedData = parsedData.map((item, idx) => ({
          date: item.date || new Date().toISOString().split('T')[0],
          amount: parseFloat(item.amount) || 0,
          type: item.type || 'EXPENSE',
          description: item.description || `Transaction ${idx + 1}`,
          merchant: item.merchant || null,
          category: item.category || 'Other',
          confidence: item.confidence || 'medium',
          rawText: item.rawText || smsTexts[idx] || '',
          source: 'SMS'
        }));
        
      } catch (parseError) {
        console.error('Failed to parse LLM response as JSON:', parseError);
        
        // Fallback: Use basic pattern matching
        parsedData = smsTexts.map((sms, idx) => {
          return fallbackParseSMS(sms);
        });
      }

      return NextResponse.json({
        success: true,
        transactions: parsedData,
        count: parsedData.length
      });

    } catch (llmError) {
      console.error('LLM API error:', llmError);
      
      // Fallback to pattern-based parsing
      const fallbackResults = smsTexts.map((sms) => fallbackParseSMS(sms));
      
      return NextResponse.json({
        success: true,
        transactions: fallbackResults,
        count: fallbackResults.length,
        warning: 'Used fallback parsing due to AI service error'
      });
    }

  } catch (error) {
    console.error('Parse SMS API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to parse SMS messages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Fallback SMS parsing using regex patterns
function fallbackParseSMS(smsText: string): any {
  const result: any = {
    rawText: smsText,
    source: 'SMS',
    confidence: 'medium',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'EXPENSE',
    description: 'Unknown transaction',
    merchant: null,
    category: 'Other'
  };

  // Detect transaction type
  if (/debited|dr\.|spent|paid|payment/i.test(smsText)) {
    result.type = 'EXPENSE';
  } else if (/credited|cr\.|received|deposit/i.test(smsText)) {
    result.type = 'INCOME';
  }

  // Extract amount (various Indian formats)
  const amountMatch = smsText.match(/(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  if (amountMatch) {
    const amountStr = amountMatch[1].replace(/,/g, '');
    result.amount = parseFloat(amountStr);
    result.confidence = 'high';
  }

  // Extract date
  const datePatterns = [
    /(\d{1,2})[-\/]([a-z]{3})[-\/](\d{2,4})/i, // 01-Jan-26
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/, // 01/01/26 or 01-01-2026
  ];

  for (const pattern of datePatterns) {
    const dateMatch = smsText.match(pattern);
    if (dateMatch) {
      try {
        // Parse various date formats
        const [, day, monthOrMonth, year] = dateMatch;
        let parsedDate: Date;
        
        if (isNaN(parseInt(monthOrMonth))) {
          // Month name format (e.g., Jan)
          const monthNames: { [key: string]: number } = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
          };
          const month = monthNames[monthOrMonth.toLowerCase()];
          let fullYear = parseInt(year);
          if (fullYear < 100) fullYear += 2000;
          parsedDate = new Date(fullYear, month, parseInt(day));
        } else {
          // Numeric month format
          let fullYear = parseInt(year);
          if (fullYear < 100) fullYear += 2000;
          parsedDate = new Date(fullYear, parseInt(monthOrMonth) - 1, parseInt(day));
        }
        
        result.date = parsedDate.toISOString().split('T')[0];
        break;
      } catch (e) {
        // Continue to next pattern
      }
    }
  }

  // Extract merchant/description
  const merchantPatterns = [
    /(?:at|to|for)\s+([A-Z][A-Z\s&.'-]+)/,
    /merchant:\s*([^.\n]+)/i,
  ];

  for (const pattern of merchantPatterns) {
    const merchantMatch = smsText.match(pattern);
    if (merchantMatch) {
      result.merchant = merchantMatch[1].trim();
      result.description = result.merchant;
      break;
    }
  }

  // Simple category detection based on keywords
  const categories: { [key: string]: string[] } = {
    'Groceries': ['grocery', 'supermarket', 'mart', 'store'],
    'Food': ['restaurant', 'cafe', 'zomato', 'swiggy', 'food'],
    'Transportation': ['uber', 'ola', 'petrol', 'diesel', 'fuel', 'parking'],
    'Utilities': ['electricity', 'water', 'gas', 'phone', 'internet', 'mobile', 'recharge'],
    'Shopping': ['amazon', 'flipkart', 'myntra', 'shopping', 'mall'],
    'Entertainment': ['movie', 'netflix', 'prime', 'spotify', 'hotstar'],
    'Healthcare': ['hospital', 'pharmacy', 'medical', 'doctor', 'clinic']
  };

  const lowerText = smsText.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      result.category = category;
      break;
    }
  }

  return result;
}
