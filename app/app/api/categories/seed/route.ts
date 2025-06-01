
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { defaultCategories } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Check if categories already exist
    const existingCategories = await prisma.category.count();
    
    if (existingCategories > 0) {
      return NextResponse.json(
        { message: 'Categories already exist' },
        { status: 200 }
      );
    }

    // Create default categories
    const categories = await prisma.category.createMany({
      data: defaultCategories,
      skipDuplicates: true
    });

    return NextResponse.json({
      message: 'Default categories created successfully',
      count: categories.count
    });
  } catch (error) {
    console.error('Error seeding categories:', error);
    return NextResponse.json(
      { error: 'Failed to seed categories' },
      { status: 500 }
    );
  }
}
