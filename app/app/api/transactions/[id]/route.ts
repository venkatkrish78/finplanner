import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;

    // First try to find a regular transaction - user filtered
    let transaction = await prisma.transaction.findFirst({
      where: { 
        id,
        userId: currentUser.id
      },
      include: {
        category: true
      }
    });

    if (transaction) {
      return NextResponse.json(transaction);
    }

    // If not found, check if it's a virtual bill transaction - user filtered
    if (id.startsWith('bill-')) {
      const billInstanceId = id.replace('bill-', '');
      const billInstance = await prisma.billInstance.findFirst({
        where: { 
          id: billInstanceId,
          userId: currentUser.id
        },
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

    // If not found, check if it's a virtual loan transaction - user filtered
    if (id.startsWith('loan-')) {
      const loanPaymentId = id.replace('loan-', '');
      const loanPayment = await prisma.loanPayment.findFirst({
        where: { 
          id: loanPaymentId,
          userId: currentUser.id
        },
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
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { id } = params;

    // Verify category belongs to user if provided
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
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

    const transaction = await prisma.transaction.updateMany({
      where: { 
        id,
        userId: currentUser.id // Ensure user can only update their own transactions
      },
      data: {
        amount: data.amount,
        type: data.type,
        description: data.description,
        merchant: data.merchant,
        date: new Date(data.date),
        categoryId: data.categoryId
      }
    });

    if (transaction.count === 0) {
      return NextResponse.json(
        { error: 'Transaction not found or unauthorized' },
        { status: 404 }
      );
    }

    // Fetch the updated transaction
    const updatedTransaction = await prisma.transaction.findFirst({
      where: { 
        id,
        userId: currentUser.id
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(updatedTransaction);
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
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // First try to delete a regular transaction - user filtered
    try {
      const result = await prisma.transaction.deleteMany({
        where: { 
          id,
          userId: currentUser.id
        }
      });
      
      if (result.count > 0) {
        return NextResponse.json({ success: true });
      }
    } catch (error) {
      // If regular transaction not found, check for virtual transactions
    }

    // If it's a virtual bill transaction, delete the bill instance - user filtered
    if (id.startsWith('bill-')) {
      const billInstanceId = id.replace('bill-', '');
      const result = await prisma.billInstance.deleteMany({
        where: { 
          id: billInstanceId,
          userId: currentUser.id
        }
      });
      
      if (result.count > 0) {
        return NextResponse.json({ success: true });
      }
    }

    // If it's a virtual loan transaction, delete the loan payment - user filtered
    if (id.startsWith('loan-')) {
      const loanPaymentId = id.replace('loan-', '');
      const result = await prisma.loanPayment.deleteMany({
        where: { 
          id: loanPaymentId,
          userId: currentUser.id
        }
      });
      
      if (result.count > 0) {
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json(
      { error: 'Transaction not found or unauthorized' },
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
