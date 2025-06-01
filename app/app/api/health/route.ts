
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get basic stats
    const [
      transactionCount,
      categoryCount,
      billCount,
      goalCount,
      loanCount,
      investmentCount
    ] = await Promise.all([
      prisma.transaction.count(),
      prisma.category.count(),
      prisma.bill.count(),
      prisma.financialGoal.count(),
      prisma.loan.count(),
      prisma.investment.count()
    ]);

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: {
        status: 'connected',
        stats: {
          transactions: transactionCount,
          categories: categoryCount,
          bills: billCount,
          goals: goalCount,
          loans: loanCount,
          investments: investmentCount
        }
      },
      environment: process.env.NODE_ENV,
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
        environment: process.env.NODE_ENV
      },
      { status: 503 }
    );
  }
}
