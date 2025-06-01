
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { principal, interestRate, tenure } = body;

    const P = parseFloat(principal);
    const R = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const N = parseInt(tenure); // Number of months

    // Calculate EMI using the formula: EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
    const emi = R > 0 
      ? (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1)
      : P / N;

    const totalAmount = emi * N;
    const totalInterest = totalAmount - P;

    // Generate amortization schedule
    const schedule = [];
    let balance = P;

    for (let month = 1; month <= N; month++) {
      const interestPayment = balance * R;
      const principalPayment = emi - interestPayment;
      balance = Math.max(0, balance - principalPayment);

      schedule.push({
        month,
        emi: Math.round(emi),
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        balance: Math.round(balance)
      });
    }

    const calculation = {
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      schedule
    };

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Error calculating EMI:', error);
    return NextResponse.json(
      { error: 'Failed to calculate EMI' },
      { status: 500 }
    );
  }
}
