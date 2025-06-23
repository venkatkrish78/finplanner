export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';

// Get investments linked to a specific goal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: goalId } = await params;

    // Get goal with linked investments - user filtered
    const goal = await prisma.financialGoal.findFirst({
      where: { 
        id: goalId,
        userId: currentUser.id
      },
      include: {
        investmentLinks: {
          include: {
            investment: {
              include: {
                category: true,
                transactions: {
                  orderBy: { date: 'desc' },
                  take: 5
                }
              }
            }
          }
        },
        investments: {
          include: {
            category: true,
            transactions: {
              orderBy: { date: 'desc' },
              take: 5
            }
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

    // Combine both types of linked investments
    const linkedInvestments = [
      // Many-to-many links
      ...goal.investmentLinks.map(link => ({
        ...link.investment,
        linkId: link.id,
        allocation: link.allocation,
        notes: link.notes,
        allocatedValue: link.investment.currentValue * (link.allocation / 100)
      })),
      // Direct links (backward compatibility)
      ...goal.investments.map(investment => ({
        ...investment,
        linkId: null,
        allocation: 100,
        notes: null,
        allocatedValue: investment.currentValue
      }))
    ];

    return NextResponse.json({
      goal: {
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount
      },
      linkedInvestments
    });
  } catch (error) {
    console.error('Error fetching goal investments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal investments' },
      { status: 500 }
    );
  }
}

// Link an investment to a goal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: goalId } = await params;
    const body = await request.json();
    const { investmentId, allocation = 100, notes } = body;

    if (!investmentId) {
      return NextResponse.json(
        { error: 'Investment ID is required' },
        { status: 400 }
      );
    }

    if (allocation < 0 || allocation > 100) {
      return NextResponse.json(
        { error: 'Allocation must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Check if goal exists and belongs to user
    const goal = await prisma.financialGoal.findFirst({
      where: { 
        id: goalId,
        userId: currentUser.id
      }
    });

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    // Check if investment exists and belongs to user
    const investment = await prisma.investment.findFirst({
      where: { 
        id: investmentId,
        userId: currentUser.id
      }
    });

    if (!investment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    // Check if link already exists
    const existingLink = await prisma.investmentGoalLink.findFirst({
      where: {
        investmentId,
        goalId,
        userId: currentUser.id
      }
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'Investment is already linked to this goal' },
        { status: 400 }
      );
    }

    // Create the link - user filtered
    const link = await prisma.investmentGoalLink.create({
      data: {
        investmentId,
        goalId,
        allocation,
        notes,
        userId: currentUser.id
      },
      include: {
        investment: {
          include: {
            category: true
          }
        },
        goal: true
      }
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Error linking investment to goal:', error);
    return NextResponse.json(
      { error: 'Failed to link investment to goal' },
      { status: 500 }
    );
  }
}
