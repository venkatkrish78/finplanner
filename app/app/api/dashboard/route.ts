export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get basic data with error handling - all filtered by user
    const currentMonthIncome = await prisma.transaction.aggregate({
      where: {
        userId: currentUser.id,
        type: 'INCOME',
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { amount: true }
    }).catch(() => ({ _sum: { amount: 0 } }));

    const currentMonthExpenses = await prisma.transaction.aggregate({
      where: {
        userId: currentUser.id,
        type: 'EXPENSE',
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { amount: true }
    }).catch(() => ({ _sum: { amount: 0 } }));

    const lastMonthIncome = await prisma.transaction.aggregate({
      where: {
        userId: currentUser.id,
        type: 'INCOME',
        date: { gte: startOfLastMonth, lte: endOfLastMonth }
      },
      _sum: { amount: true }
    }).catch(() => ({ _sum: { amount: 0 } }));

    const lastMonthExpenses = await prisma.transaction.aggregate({
      where: {
        userId: currentUser.id,
        type: 'EXPENSE',
        date: { gte: startOfLastMonth, lte: endOfLastMonth }
      },
      _sum: { amount: true }
    }).catch(() => ({ _sum: { amount: 0 } }));

    const totalAssets = await prisma.investment.aggregate({
      where: { userId: currentUser.id },
      _sum: { currentValue: true }
    }).catch(() => ({ _sum: { currentValue: 0 } }));

    const totalLiabilities = await prisma.loan.aggregate({
      where: { userId: currentUser.id },
      _sum: { currentBalance: true }
    }).catch(() => ({ _sum: { currentBalance: 0 } }));

    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: currentUser.id },
      take: 5,
      orderBy: { date: 'desc' },
      include: { category: true }
    }).catch(() => []);

    const topGoals = await prisma.financialGoal.findMany({
      where: { 
        userId: currentUser.id,
        status: 'ACTIVE' 
      },
      take: 3,
      orderBy: { targetAmount: 'desc' },
      include: {
        contributions: true,
        investmentLinks: {
          include: {
            investment: {
              select: {
                id: true,
                name: true,
                currentValue: true,
                isActive: true
              }
            }
          }
        },
        investments: {
          select: {
            id: true,
            name: true,
            currentValue: true,
            isActive: true
          }
        }
      }
    }).catch(() => []);

    const activeLoans = await prisma.loan.findMany({
      where: { userId: currentUser.id },
      orderBy: { endDate: 'asc' }
    }).catch(() => []);

    const investments = await prisma.investment.findMany({
      where: { userId: currentUser.id },
      orderBy: { currentValue: 'desc' }
    }).catch(() => []);

    const upcomingBills = await prisma.bill.findMany({
      where: {
        userId: currentUser.id,
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
        userId: currentUser.id,
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
    let categories: any[] = [];
    if (categoryIds.length > 0) {
      categories = await prisma.category.findMany({
        where: { 
          id: { in: categoryIds },
          userId: currentUser.id
        }
      }).catch(() => []);
    }

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<string, string>);

    const enhancedCategoryBreakdown = categoryBreakdown.map(item => {
      let categoryName = 'Unknown';
      
      if (item.categoryId && categoryMap[item.categoryId]) {
        categoryName = categoryMap[item.categoryId];
      } else if (!item.categoryId) {
        categoryName = 'Uncategorized';
      }

      return {
        categoryName,
        amount: item._sum.amount || 0
      };
    });

    // Calculate savings rate
    const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0;

    // Enhanced Goals Progress Calculation
    const enhancedGoals = topGoals.map(goal => {
      let linkedInvestmentValue = 0;

      if (goal.investmentLinks) {
        linkedInvestmentValue += goal.investmentLinks.reduce((sum, link) => {
          if (link.investment && link.investment.isActive) {
            return sum + (link.investment.currentValue * (link.allocation / 100));
          }
          return sum;
        }, 0);
      }

      if (goal.investments) {
        linkedInvestmentValue += goal.investments.reduce((sum, investment) => {
          if (investment.isActive) {
            return sum + investment.currentValue;
          }
          return sum;
        }, 0);
      }

      const totalContributions = goal.contributions.reduce((sum, contribution) => {
        return sum + contribution.amount;
      }, 0);

      const totalProgress = goal.currentAmount + linkedInvestmentValue + totalContributions;
      const progress = goal.targetAmount > 0 ? (totalProgress / goal.targetAmount) * 100 : 0;
      const remainingAmount = Math.max(0, goal.targetAmount - totalProgress);

      return {
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: totalProgress,
        progress: Math.min(100, progress),
        remainingAmount,
        linkedInvestmentValue,
        totalContributions
      };
    });

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
      goals: enhancedGoals,
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
