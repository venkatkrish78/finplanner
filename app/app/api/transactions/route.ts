import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type')
    const categoryId = searchParams.get('categoryId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      userId: session.user.id
    }

    if (type && type !== 'all') {
      where.type = type
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId
    }

    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive'
      }
    }

    // Handle date filtering
    if (year || month || startDate || endDate) {
      where.date = {}
      
      if (year && month) {
        // Monthly view
        const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1)
        const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
        where.date.gte = startOfMonth
        where.date.lte = endOfMonth
      } else if (year) {
        // Yearly view
        const startOfYear = new Date(parseInt(year), 0, 1)
        const endOfYear = new Date(parseInt(year), 11, 31, 23, 59, 59)
        where.date.gte = startOfYear
        where.date.lte = endOfYear
      }
      
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      if (endDate) {
        where.date.lte = new Date(endDate)
      }
    }

    console.log('Transactions query where:', JSON.stringify(where, null, 2))

    // Get transactions with pagination
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          date: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.transaction.count({ where })
    ])

    console.log(`Found ${transactions.length} transactions for user ${session.user.id}`)

    return NextResponse.json({
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        description: t.description,
        date: t.date.toISOString(),
        category: {
          id: t.category.id,
          name: t.category.name
        },
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString()
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      },
      summary: {
        totalIncome: totalIncome._sum.amount || 0,
        totalExpenses: totalExpenses._sum.amount || 0,
        balance,
        transactionCount: totalCount
      }
    })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error.message },
      { status: 500 }
    )
  }
}
