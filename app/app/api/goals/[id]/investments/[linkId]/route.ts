export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';

// Update investment-goal link
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; linkId: string } }
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

    const { linkId } = params;
    const body = await request.json();
    const { allocation, notes } = body;

    if (allocation !== undefined && (allocation < 0 || allocation > 100)) {
      return NextResponse.json(
        { error: 'Allocation must be between 0 and 100' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (allocation !== undefined) updateData.allocation = allocation;
    if (notes !== undefined) updateData.notes = notes;

    const result = await prisma.investmentGoalLink.updateMany({
      where: { 
        id: linkId,
        userId: currentUser.id
      },
      data: updateData
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Investment-goal link not found or unauthorized' },
        { status: 404 }
      );
    }

    // Fetch the updated link
    const link = await prisma.investmentGoalLink.findFirst({
      where: { 
        id: linkId,
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

    return NextResponse.json(link);
  } catch (error) {
    console.error('Error updating investment-goal link:', error);
    return NextResponse.json(
      { error: 'Failed to update investment-goal link' },
      { status: 500 }
    );
  }
}

// Remove investment-goal link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; linkId: string } }
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

    const { linkId } = params;

    const result = await prisma.investmentGoalLink.deleteMany({
      where: { 
        id: linkId,
        userId: currentUser.id
      }
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Investment-goal link not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing investment-goal link:', error);
    return NextResponse.json(
      { error: 'Failed to remove investment-goal link' },
      { status: 500 }
    );
  }
}
