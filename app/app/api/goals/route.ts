
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GoalType, GoalStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as GoalStatus | null;
    const type = searchParams.get('type') as GoalType | null;
    const includeInvestments = searchParams.get('includeInvestments') === 'true';

    const where: any = {};
    if (status) where.status = status;
    if (type) where.goalType = type;

    const goals = await prisma.financialGoal.findMany({
      where,
      include: {
        category: true,
        contributions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        investmentLinks: includeInvestments ? {
          include: {
            investment: {
              select: {
                id: true,
                name: true,
                assetClass: true,
                currentValue: true,
                totalInvested: true,
                isActive: true
              }
            }
          }
        } : undefined,
        investments: includeInvestments ? {
          select: {
            id: true,
            name: true,
            assetClass: true,
            currentValue: true,
            totalInvested: true,
            isActive: true
          }
        } : undefined
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate dynamic progress for each goal
    const goalsWithProgress = goals.map(goal => {
      let linkedInvestmentValue = 0;

      // Calculate from many-to-many links
      if (includeInvestments && goal.investmentLinks) {
        linkedInvestmentValue += goal.investmentLinks.reduce((sum, link: any) => {
          if (link.investment && link.investment.isActive) {
            return sum + (link.investment.currentValue * (link.allocation / 100));
          }
          return sum;
        }, 0);
      }

      // Calculate from direct goal links (backward compatibility)
      if (includeInvestments && goal.investments) {
        linkedInvestmentValue += goal.investments.reduce((sum, investment) => {
          if (investment.isActive) {
            return sum + investment.currentValue;
          }
          return sum;
        }, 0);
      }

      const totalProgress = goal.currentAmount + linkedInvestmentValue;
      const dynamicProgress = goal.targetAmount > 0 ? (totalProgress / goal.targetAmount) * 100 : 0;

      return {
        ...goal,
        linkedInvestmentValue,
        dynamicProgress,
        totalProgress
      };
    });

    return NextResponse.json(goalsWithProgress);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      goalType,
      targetAmount,
      targetDate,
      categoryId
    } = body;

    if (!name || !goalType || !targetAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: name, goalType, and targetAmount are required' },
        { status: 400 }
      );
    }

    const goal = await prisma.financialGoal.create({
      data: {
        name,
        description,
        goalType,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        status: 'ACTIVE',
        targetDate: targetDate ? new Date(targetDate) : null,
        categoryId: categoryId || null
      },
      include: {
        category: true,
        contributions: true
      }
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}
