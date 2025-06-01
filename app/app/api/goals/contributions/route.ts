
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goalId, amount, note, createTransaction } = body;

    const result = await prisma.$transaction(async (tx) => {
      // Create the contribution
      const contribution = await tx.goalContribution.create({
        data: {
          goalId,
          amount: parseFloat(amount),
          note
        }
      });

      // Update goal current amount
      const goal = await tx.financialGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: {
            increment: parseFloat(amount)
          }
        }
      });

      // Check if goal is completed
      if (goal.currentAmount >= goal.targetAmount) {
        await tx.financialGoal.update({
          where: { id: goalId },
          data: { status: 'COMPLETED' }
        });
      }

      // Create transaction if requested
      let transaction = null;
      if (createTransaction) {
        // Find or create a default savings category
        let category = await tx.category.findFirst({
          where: { name: 'Savings' }
        });

        if (!category) {
          category = await tx.category.create({
            data: {
              name: 'Savings',
              color: '#10B981',
              isDefault: true
            }
          });
        }

        transaction = await tx.transaction.create({
          data: {
            amount: parseFloat(amount),
            type: 'EXPENSE',
            description: `Goal contribution: ${goal.name}`,
            date: new Date(),
            categoryId: category.id,
            source: 'MANUAL'
          }
        });

        // Link the transaction to the contribution
        await tx.goalContribution.update({
          where: { id: contribution.id },
          data: { transactionId: transaction.id }
        });
      }

      return { contribution, goal, transaction };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating goal contribution:', error);
    return NextResponse.json(
      { error: 'Failed to create goal contribution' },
      { status: 500 }
    );
  }
}
