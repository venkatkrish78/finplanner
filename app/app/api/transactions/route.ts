import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
      where.OR = [
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          merchant: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
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
    console.log("=== TRANSACTIONS API DEBUG ===")
    console.log("User ID:", session.user.id)
    console.log("Query params:", Object.fromEntries(searchParams.entries()))
    console.log("Where clause:", JSON.stringify(where, null, 2))
    
    // Check total transactions for this user
    const totalUserTransactions = await prisma.transaction.count({ 
      where: { userId: session.user.id } 
    })
    console.log("Total transactions for user:", totalUserTransactions)
    
    // Check recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: 5,
      select: { id: true, amount: true, description: true, date: true }
    })
    console.log("Recent transactions:", recentTransactions)

    // Get transactions with pagination
    const [transactions, totalCount, totalIncome, totalExpenses] = await Promise.all([
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
      prisma.transaction.count({ where }),
      prisma.transaction.aggregate({
        where: {
          ...where,
          amount: { gt: 0 }
        },
        _sum: {
          amount: true
        }
      }),
      prisma.transaction.aggregate({
        where: {
          ...where,
          amount: { lt: 0 }
        },
        _sum: {
          amount: true
        }
      })
    ])

    const balance = (totalIncome._sum.amount || 0) + (totalExpenses._sum.amount || 0)

    console.log(`Found ${transactions.length} transactions for user ${session.user.id}`)

    return NextResponse.json({
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        description: t.description,
        merchant: t.merchant,
        date: t.date.toISOString(),
        category: t.category ? {
          id: t.category.id,
          name: t.category.name,
          color: t.category.color
        } : null,
        status: t.status,
        source: t.source,
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
        totalExpenses: Math.abs(totalExpenses._sum.amount || 0),
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, type, description, merchant, categoryId, date } = body

    // Validate required fields
    if (!amount || !type || !description) {
      return NextResponse.json(
        { error: 'Amount, type, and description are required' },
        { status: 400 }
      )
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        description,
        merchant: merchant || 'Unknown',
        categoryId,
        date: date ? new Date(date) : new Date(),
        userId: session.user.id,
        status: 'SUCCESS',
        source: 'MANUAL'
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      merchant: transaction.merchant,
      date: transaction.date.toISOString(),
      category: transaction.category ? {
        id: transaction.category.id,
        name: transaction.category.name,
        color: transaction.category.color
      } : null,
      status: transaction.status,
      source: transaction.source,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString()
    })

  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('id')

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
    }

    // Verify the transaction belongs to the user
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: session.user.id
      }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Delete the transaction
    await prisma.transaction.delete({
      where: { id: transactionId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}
