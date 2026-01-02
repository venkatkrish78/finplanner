import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let categories = await prisma.category.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    });

    // If user has no categories, create default ones
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Food & Dining', color: '#EF4444' },
        { name: 'Transportation', color: '#3B82F6' },
        { name: 'Utilities', color: '#10B981' },
        { name: 'Entertainment', color: '#8B5CF6' },
        { name: 'Healthcare', color: '#F59E0B' },
        { name: 'Shopping', color: '#EC4899' },
        { name: 'Investment', color: '#06B6D4' },
        { name: 'Education', color: '#84CC16' },
        { name: 'Travel', color: '#F97316' },
        { name: 'Insurance', color: '#6366F1' },
        { name: 'Salary', color: '#22C55E' }
      ];

      // Create default categories for the user
      const createdCategories = await Promise.all(
        defaultCategories.map(cat =>
          prisma.category.create({
            data: {
              name: cat.name,
              color: cat.color,
              userId: session.user.id,
              isDefault: false
            }
          })
        )
      );

      categories = createdCategories;
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, color } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category already exists for this user
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: name,
        userId: session.user.id
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color || '#6B7280',
        isDefault: false,
        userId: session.user.id
      }
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error creating category:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

