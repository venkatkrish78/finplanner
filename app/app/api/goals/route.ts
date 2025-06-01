
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GoalType, GoalStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as GoalStatus | null;
    const type = searchParams.get('type') as GoalType | null;

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
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(goals);
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
