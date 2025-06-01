
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('Dashboard API called, testing Prisma connection...');
    
    // Test basic Prisma connection first
    const transactionCount = await prisma.transaction.count();
    console.log('Transaction count:', transactionCount);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get basic data with error handling
    const currentMonthIncome = await prisma.transaction.aggregate({
      where: {
        type: 'INCOME',
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { amount: true }
    }).catch(() => ({ _sum: { amount: 0 } }));

    const currentMonthExpenses = await prisma.transaction.aggregate({
      where: {
        type: 'EXPENSE',
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { amount: true }
    }).catch(() => ({ _sum: { amount: 0 } }));

    const lastMonthIncome = await prisma.transaction.aggregate({
      where: {
        type: 'INCOME',
        date: { gte: startOfLastMonth, lte: endOfLastMonth }
      },
      _sum: { amount: true }
    }).catch(() => ({ _sum: { amount: 0 } }));

    const lastMonthExpenses = await prisma.transaction.aggregate({
      where: {
        type: 'EXPENSE',
        date: { gte: startOfLastMonth, lte: endOfLastMonth }
      },
      _sum: { amount: true }
    }).catch(() => ({ _sum: { amount: 0 } }));

    const totalAssets = await prisma.investment.aggregate({
      _sum: { currentValue: true }
    }).catch(() => ({ _sum: { currentValue: 0 } }));

    const totalLiabilities = await prisma.loan.aggregate({
      _sum: { currentBalance: true }
    }).catch(() => ({ _sum: { currentBalance: 0 } }));

    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { category: true }
    }).catch(() => []);

    const topGoals = await prisma.financialGoal.findMany({
      take: 3,
      orderBy: { targetAmount: 'desc' },
      where: { status: 'ACTIVE' }
    }).catch(() => []);

    const activeLoans = await prisma.loan.findMany({
      orderBy: { endDate: 'asc' }
    }).catch(() => []);

    const investments = await prisma.investment.findMany({
      orderBy: { currentValue: 'desc' }
    }).catch(() => []);

    const upcomingBills = await prisma.bill.findMany({
      where: {
        nextDueDate: {
          gte: now,
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { nextDueDate: 'asc' },
      take: 5
    }).catch(() => []);

    const categoryBreakdown = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        type: 'EXPENSE',
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5
    }).catch(() => []);

    // Calculate trends
    const currentIncome = currentMonthIncome._sum.amount || 0;
    const currentExpenses = currentMonthExpenses._sum.amount || 0;
    const lastIncome = lastMonthIncome._sum.amount || 0;
    const lastExpenses = lastMonthExpenses._sum.amount || 0;

    const incomeTrend = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;
    const expenseTrend = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0;

    // Net worth calculation
    const assets = totalAssets._sum.currentValue || 0;
    const liabilities = totalLiabilities._sum.currentBalance || 0;
    const netWorth = assets - liabilities;

    // Get category names for breakdown
    const categoryIds = categoryBreakdown.map(item => item.categoryId).filter(Boolean);
    const categories = categoryIds.length > 0 ? await prisma.category.findMany({
      where: { id: { in: categoryIds } }
    }).catch(() => []) : [];

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<string, string>);

    const enhancedCategoryBreakdown = categoryBreakdown.map(item => ({
      categoryName: item.categoryId ? categoryMap[item.categoryId] || 'Unknown' : 'Uncategorized',
      amount: item._sum.amount || 0
    }));

    // Calculate savings rate
    const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0;

    // Prepare insights
    const insights = [];
    
    if (savingsRate > 20) {
      insights.push({
        type: 'positive' as const,
        message: `Great job! You're saving ${savingsRate.toFixed(1)}% of your income this month.`
      });
    } else if (savingsRate < 10 && currentIncome > 0) {
      insights.push({
        type: 'warning' as const,
        message: `Consider increasing your savings rate. Currently at ${savingsRate.toFixed(1)}%.`
      });
    }

    if (expenseTrend > 20) {
      insights.push({
        type: 'warning' as const,
        message: `Your expenses increased by ${expenseTrend.toFixed(1)}% compared to last month.`
      });
    }

    if (upcomingBills.length > 0) {
      insights.push({
        type: 'info' as const,
        message: `You have ${upcomingBills.length} bills due in the next 30 days.`
      });
    }

    return NextResponse.json({
      financialOverview: {
        netWorth,
        currentMonthIncome: currentIncome,
        currentMonthExpenses: currentExpenses,
        incomeTrend,
        expenseTrend,
        savingsRate
      },
      goals: topGoals.map(goal => ({
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        progress: (goal.currentAmount / goal.targetAmount) * 100,
        remainingAmount: goal.targetAmount - goal.currentAmount
      })),
      loans: activeLoans.map(loan => ({
        id: loan.id,
        name: loan.name,
        totalAmount: loan.principalAmount,
        outstandingAmount: loan.currentBalance,
        progress: ((loan.principalAmount - loan.currentBalance) / loan.principalAmount) * 100,
        nextDueDate: loan.endDate,
        emiAmount: loan.emiAmount
      })),
      investments: {
        totalValue: assets,
        investments: investments.map(inv => ({
          id: inv.id,
          name: inv.name,
          type: inv.assetClass,
          currentValue: inv.currentValue,
          investedAmount: inv.totalInvested,
          gainLoss: inv.currentValue - inv.totalInvested,
          gainLossPercentage: inv.totalInvested > 0 ? ((inv.currentValue - inv.totalInvested) / inv.totalInvested) * 100 : 0
        }))
      },
      upcomingItems: upcomingBills.map(bill => ({
        id: bill.id,
        name: bill.name,
        amount: bill.amount,
        dueDate: bill.nextDueDate,
        type: 'bill' as const
      })),
      recentActivity: recentTransactions.map(transaction => ({
        id: transaction.id,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date,
        categoryName: transaction.category?.name || 'Uncategorized'
      })),
      categoryBreakdown: enhancedCategoryBreakdown,
      insights
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
