
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetAmount, currentAmount, targetDate, monthlyContribution } = body;

    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;
    const monthly = parseFloat(monthlyContribution) || 0;
    const remaining = target - current;

    let calculation: any = {};

    if (targetDate) {
      // Calculate based on target date
      const today = new Date();
      const target_date = new Date(targetDate);
      const monthsRemaining = Math.max(1, Math.ceil((target_date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      
      calculation.monthlyRequired = remaining / monthsRemaining;
      calculation.timeToGoal = monthsRemaining;
      calculation.projectedDate = target_date;
    } else if (monthly > 0) {
      // Calculate based on monthly contribution
      const monthsToGoal = Math.ceil(remaining / monthly);
      const projectedDate = new Date();
      projectedDate.setMonth(projectedDate.getMonth() + monthsToGoal);
      
      calculation.monthlyRequired = monthly;
      calculation.timeToGoal = monthsToGoal;
      calculation.projectedDate = projectedDate;
    } else {
      return NextResponse.json(
        { error: 'Either target date or monthly contribution is required' },
        { status: 400 }
      );
    }

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Error calculating goal:', error);
    return NextResponse.json(
      { error: 'Failed to calculate goal' },
      { status: 500 }
    );
  }
}
