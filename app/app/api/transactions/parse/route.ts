
import { NextRequest, NextResponse } from 'next/server';
import { transactionParser } from '@/lib/transaction-parser';
import { suggestCategory } from '@/lib/categories';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { messageText } = await request.json();

    if (!messageText) {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400 }
      );
    }

    // Parse the transaction
    const parsedTransaction = transactionParser.parse(messageText);

    if (!parsedTransaction) {
      return NextResponse.json(
        { error: 'Could not parse transaction from the provided text' },
        { status: 400 }
      );
    }

    // Suggest category based on description and merchant
    const suggestedCategoryName = suggestCategory(
      parsedTransaction.description || '',
      parsedTransaction.merchant
    );

    // Find the suggested category
    const suggestedCategory = await prisma.category.findFirst({
      where: { name: suggestedCategoryName }
    });

    // If no category found, use "Others"
    const fallbackCategory = await prisma.category.findFirst({
      where: { name: 'Others' }
    });

    const categoryId = suggestedCategory?.id || fallbackCategory?.id;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'No categories found. Please seed default categories first.' },
        { status: 400 }
      );
    }

    // Return parsed transaction with suggested category
    return NextResponse.json({
      ...parsedTransaction,
      categoryId,
      suggestedCategory: suggestedCategory?.name || 'Others',
      rawMessage: messageText
    });
  } catch (error) {
    console.error('Error parsing transaction:', error);
    return NextResponse.json(
      { error: 'Failed to parse transaction' },
      { status: 500 }
    );
  }
}
