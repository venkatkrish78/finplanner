
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        payments: {
          include: {
            transaction: true
          },
          orderBy: { paymentDate: 'desc' }
        }
      }
    });

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(loan);
  } catch (error) {
    console.error('Error fetching loan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loan' },
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
      loanType,
      principalAmount,
      interestRate,
      tenure,
      startDate,
      description,
      categoryId
    } = body;

    // Recalculate EMI if loan details changed
    const principal = parseFloat(principalAmount);
    const rate = parseFloat(interestRate) / 100 / 12;
    const months = parseInt(tenure);
    
    const emi = rate > 0 
      ? (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
      : principal / months;

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    const loan = await prisma.loan.update({
      where: { id: params.id },
      data: {
        name,
        loanType,
        principalAmount: principal,
        interestRate: parseFloat(interestRate),
        emiAmount: emi,
        tenure: months,
        startDate: new Date(startDate),
        endDate,
        description,
        categoryId: categoryId || null
      },
      include: {
        category: true,
        payments: true
      }
    });

    return NextResponse.json(loan);
  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json(
      { error: 'Failed to update loan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.loan.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting loan:', error);
    return NextResponse.json(
      { error: 'Failed to delete loan' },
      { status: 500 }
    );
  }
}
