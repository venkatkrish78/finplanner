
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [goals, totalStats] = await Promise.all([
      prisma.financialGoal.findMany({
        include: {
          contributions: true
        }
      }),
      prisma.financialGoal.aggregate({
        _sum: {
          targetAmount: true,
          currentAmount: true
        },
        _count: true
      })
    ]);

    const activeGoals = goals.filter(goal => goal.status === 'ACTIVE').length;
    const completedGoals = goals.filter(goal => goal.status === 'COMPLETED').length;
    
    const totalProgress = goals.reduce((sum, goal) => {
      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      return sum + Math.min(progress, 100);
    }, 0);

    const averageProgress = goals.length > 0 ? totalProgress / goals.length : 0;

    const stats = {
      totalGoals: totalStats._count,
      activeGoals,
      completedGoals,
      totalTargetAmount: totalStats._sum.targetAmount || 0,
      totalCurrentAmount: totalStats._sum.currentAmount || 0,
      averageProgress: Math.round(averageProgress)
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching goal stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal stats' },
      { status: 500 }
    );
  }
}
