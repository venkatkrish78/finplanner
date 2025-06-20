export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { LoanType } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as LoanType | null;

    const where: any = {
      userId: currentUser.id
    };
    if (type) where.loanType = type;

    const loans = await prisma.loan.findMany({
      where,
      include: {
        category: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}

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
    const {
      name,
      loanType,
      principalAmount,
      interestRate,
      tenure,
      startDate,
      description,
      categoryId
    } = body;

    // Verify category belongs to user if provided
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          OR: [
            { userId: currentUser.id },
            { isDefault: true, userId: null }
          ]
        }
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
      }
    }

    // Calculate EMI using the formula: EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
    const principal = parseFloat(principalAmount);
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const months = parseInt(tenure);
    
    const emi = rate > 0 
      ? (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
      : principal / months;

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    const loan = await prisma.loan.create({
      data: {
        name,
        loanType,
        principalAmount: principal,
        currentBalance: principal,
        interestRate: parseFloat(interestRate),
        emiAmount: emi,
        tenure: months,
        startDate: new Date(startDate),
        endDate,
        description,
        categoryId: categoryId || null,
        userId: currentUser.id
      },
      include: {
        category: true,
        payments: true
      }
    });

    return NextResponse.json(loan, { status: 201 });
  } catch (error) {
    console.error('Error creating loan:', error);
    return NextResponse.json(
      { error: 'Failed to create loan' },
      { status: 500 }
    );
  }
}
