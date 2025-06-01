
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const goal = await prisma.financialGoal.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        contributions: {
          include: {
            transaction: true
          },
          orderBy: { createdAt: 'desc' }
        },
        investmentLinks: {
          include: {
            investment: {
              include: {
                category: true
              }
            }
          }
        },
        investments: {
          include: {
            category: true
          }
        }
      }
    });

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    // Calculate dynamic progress
    let linkedInvestmentValue = 0;

    // Calculate from many-to-many links
    if (goal.investmentLinks) {
      linkedInvestmentValue += goal.investmentLinks.reduce((sum, link) => {
        if (link.investment.isActive) {
          return sum + (link.investment.currentValue * (link.allocation / 100));
        }
        return sum;
      }, 0);
    }

    // Calculate from direct goal links (backward compatibility)
    if (goal.investments) {
      linkedInvestmentValue += goal.investments.reduce((sum, investment) => {
        if (investment.isActive) {
          return sum + investment.currentValue;
        }
        return sum;
      }, 0);
    }

    const totalProgress = goal.currentAmount + linkedInvestmentValue;
    const dynamicProgress = goal.targetAmount > 0 ? (totalProgress / goal.targetAmount) * 100 : 0;

    const goalWithProgress = {
      ...goal,
      linkedInvestmentValue,
      dynamicProgress,
      totalProgress
    };

    return NextResponse.json(goalWithProgress);
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      goalType,
      targetAmount,
      targetDate,
      status,
      categoryId
    } = body;

    const goal = await prisma.financialGoal.update({
      where: { id: params.id },
      data: {
        name,
        description,
        goalType,
        targetAmount: parseFloat(targetAmount),
        targetDate: targetDate ? new Date(targetDate) : null,
        status,
        categoryId: categoryId || null
      },
      include: {
        category: true,
        contributions: true
      }
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.financialGoal.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
