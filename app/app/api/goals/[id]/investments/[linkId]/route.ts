

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Update investment-goal link
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; linkId: string } }
) {
  try {
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

    const link = await prisma.investmentGoalLink.update({
      where: { id: linkId },
      data: updateData,
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
    const { linkId } = params;

    await prisma.investmentGoalLink.delete({
      where: { id: linkId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing investment-goal link:', error);
    return NextResponse.json(
      { error: 'Failed to remove investment-goal link' },
      { status: 500 }
    );
  }
}

