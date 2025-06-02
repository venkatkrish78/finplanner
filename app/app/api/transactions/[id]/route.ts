
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // First try to find a regular transaction
    let transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (transaction) {
      return NextResponse.json(transaction);
    }

    // If not found, check if it's a virtual bill transaction
    if (id.startsWith('bill-')) {
      const billInstanceId = id.replace('bill-', '');
      const billInstance = await prisma.billInstance.findUnique({
        where: { id: billInstanceId },
        include: { 
          bill: { include: { category: true } },
          transaction: true 
        }
      });

      if (billInstance && billInstance.status === 'PAID') {
        const virtualTransaction = {
          id: `bill-${billInstance.id}`,
          amount: billInstance.amount,
          type: 'EXPENSE' as const,
          description: `Bill payment: ${billInstance.bill.name}`,
          merchant: billInstance.bill.name,
          date: billInstance.paidDate!,
          category: billInstance.bill.category,
          categoryId: billInstance.bill.categoryId,
          status: 'SUCCESS',
          source: 'BILL',
          transactionId: `BILL-${billInstance.id}`,
          accountNumber: null,
          balance: null,
          rawMessage: null,
          createdAt: billInstance.createdAt,
          updatedAt: billInstance.updatedAt
        };
        return NextResponse.json(virtualTransaction);
      }
    }

    // If not found, check if it's a virtual loan transaction
    if (id.startsWith('loan-')) {
      const loanPaymentId = id.replace('loan-', '');
      const loanPayment = await prisma.loanPayment.findUnique({
        where: { id: loanPaymentId },
        include: { 
          loan: { include: { category: true } },
          transaction: true 
        }
      });

      if (loanPayment) {
        const virtualTransaction = {
          id: `loan-${loanPayment.id}`,
          amount: loanPayment.amount,
          type: 'EXPENSE' as const,
          description: `Loan payment: ${loanPayment.loan.name}`,
          merchant: loanPayment.loan.name,
          date: loanPayment.paymentDate,
          category: loanPayment.loan.category,
          categoryId: loanPayment.loan.categoryId,
          status: 'SUCCESS',
          source: 'LOAN',
          transactionId: `LOAN-${loanPayment.id}`,
          accountNumber: null,
          balance: null,
          rawMessage: null,
          createdAt: loanPayment.createdAt,
          updatedAt: loanPayment.createdAt
        };
        return NextResponse.json(virtualTransaction);
      }
    }

    return NextResponse.json(
      { error: 'Transaction not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { id } = params;

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: data.amount,
        type: data.type,
        description: data.description,
        merchant: data.merchant,
        date: new Date(data.date),
        categoryId: data.categoryId
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // First try to delete a regular transaction
    try {
      await prisma.transaction.delete({
        where: { id }
      });
      return NextResponse.json({ success: true });
    } catch (error) {
      // If regular transaction not found, check for virtual transactions
    }

    // If it's a virtual bill transaction, delete the bill instance
    if (id.startsWith('bill-')) {
      const billInstanceId = id.replace('bill-', '');
      await prisma.billInstance.delete({
        where: { id: billInstanceId }
      });
      return NextResponse.json({ success: true });
    }

    // If it's a virtual loan transaction, delete the loan payment
    if (id.startsWith('loan-')) {
      const loanPaymentId = id.replace('loan-', '');
      await prisma.loanPayment.delete({
        where: { id: loanPaymentId }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Transaction not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
