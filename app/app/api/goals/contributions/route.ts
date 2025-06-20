export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { goalId, amount, note, createTransaction } = body;

    // Verify goal belongs to user
    const goalExists = await prisma.financialGoal.findFirst({
      where: {
        id: goalId,
        userId: currentUser.id
      }
    });

    if (!goalExists) {
      return NextResponse.json(
        { error: 'Goal not found or unauthorized' },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create the contribution - user filtered
      const contribution = await tx.goalContribution.create({
        data: {
          goalId,
          amount: parseFloat(amount),
          note,
          userId: currentUser.id
        }
      });

      // Update goal current amount - user filtered
      const goal = await tx.financialGoal.update({
        where: { 
          id: goalId,
          userId: currentUser.id
        },
        data: {
          currentAmount: {
            increment: parseFloat(amount)
          }
        }
      });

      // Check if goal is completed
      if (goal.currentAmount >= goal.targetAmount) {
        await tx.financialGoal.update({
          where: { 
            id: goalId,
            userId: currentUser.id
          },
          data: { status: 'COMPLETED' }
        });
      }

      // Create transaction if requested
      let transaction = null;
      if (createTransaction) {
        // Find or create a default savings category - user filtered
        let category = await tx.category.findFirst({
          where: { 
            name: 'Savings',
            OR: [
              { userId: currentUser.id },
              { isDefault: true, userId: null }
            ]
          }
        });

        if (!category) {
          category = await tx.category.create({
            data: {
              name: 'Savings',
              color: '#10B981',
              isDefault: false,
              userId: currentUser.id
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
            source: 'MANUAL',
            userId: currentUser.id
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
