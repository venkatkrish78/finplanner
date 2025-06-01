

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get goals linked to a specific investment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const investmentId = params.id;

    // Get investment with linked goals
    const investment = await db.investment.findUnique({
      where: { id: investmentId },
      include: {
        goal: {
          select: {
            id: true,
            name: true,
            goalType: true,
            targetAmount: true,
            currentAmount: true
          }
        },
        goalLinks: {
          include: {
            goal: {
              select: {
                id: true,
                name: true,
                goalType: true,
                targetAmount: true,
                currentAmount: true
              }
            }
          }
        }
      }
    });

    if (!investment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    // Combine both types of linked goals
    const linkedGoals = [];
    
    // Add direct goal link (backward compatibility)
    if (investment.goal) {
      linkedGoals.push({
        ...investment.goal,
        allocation: 100,
        linkType: 'direct',
        linkId: null
      });
    }

    // Add many-to-many goal links
    if (investment.goalLinks) {
      investment.goalLinks.forEach(link => {
        linkedGoals.push({
          ...link.goal,
          allocation: link.allocation,
          linkType: 'linked',
          linkId: link.id
        });
      });
    }

    return NextResponse.json({
      investment: {
        id: investment.id,
        name: investment.name,
        currentValue: investment.currentValue,
        totalInvested: investment.totalInvested
      },
      linkedGoals
    });
  } catch (error) {
    console.error('Error fetching investment goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investment goals' },
      { status: 500 }
    );
  }
}

// Link a goal to an investment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const investmentId = params.id;
    const body = await request.json();
    const { goalId, allocation = 100, notes } = body;

    if (!goalId) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    if (allocation < 0 || allocation > 100) {
      return NextResponse.json(
        { error: 'Allocation must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Check if investment exists
    const investment = await db.investment.findUnique({
      where: { id: investmentId }
    });

    if (!investment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    // Check if goal exists
    const goal = await db.financialGoal.findUnique({
      where: { id: goalId }
    });

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    // Check if link already exists
    const existingLink = await db.investmentGoalLink.findUnique({
      where: {
        investmentId_goalId: {
          investmentId,
          goalId
        }
      }
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'Goal is already linked to this investment' },
        { status: 400 }
      );
    }

    // Create the link
    const link = await db.investmentGoalLink.create({
      data: {
        investmentId,
        goalId,
        allocation,
        notes
      },
      include: {
        investment: true,
        goal: true
      }
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Error linking goal to investment:', error);
    return NextResponse.json(
      { error: 'Failed to link goal to investment' },
      { status: 500 }
    );
  }
}

