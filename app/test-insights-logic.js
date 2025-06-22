const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInsightsLogic() {
  const demoUserId = 'cmc6o34760000g92xekuyaf2e';
  
  // Simulate the same logic as the AI insights API
  const transactions = await prisma.transaction.findMany({ 
    where: { userId: demoUserId }, 
    take: 30, 
    orderBy: { date: 'desc' },
    include: { category: true }
  });
  
  console.log(`Found ${transactions.length} transactions`);
  
  if (transactions.length === 0) {
    console.log('❌ No transactions found - would show welcome message');
    return;
  }
  
  // Calculate insights
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;
  
  console.log(`\n📊 Calculations:`);
  console.log(`Income: ₹${totalIncome}`);
  console.log(`Expenses: ₹${totalExpenses}`);
  console.log(`Balance: ₹${balance}`);
  console.log(`Savings Rate: ${savingsRate.toFixed(1)}%`);
  
  // Test insight generation logic
  const insights = [];
  
  if (balance > 0) {
    insights.push({
      type: 'SAVINGS_OPPORTUNITY',
      title: 'Great Balance!',
      description: `You have ₹${balance.toFixed(0)} positive balance. Consider investing some of it.`,
      priority: 1
    });
  }
  
  if (savingsRate > 30) {
    insights.push({
      type: 'INVESTMENT_SUGGESTION',
      title: 'High Savings!',
      description: `${savingsRate.toFixed(0)}% savings rate is excellent! Consider investing more.`,
      priority: 1
    });
  }
  
  console.log(`\n🧠 Generated ${insights.length} insights:`);
  insights.forEach(insight => {
    console.log(`- ${insight.title}: ${insight.description}`);
  });
  
  // Check if insights already exist in database
  const existingInsights = await prisma.aIInsight.findMany({
    where: {
      userId: demoUserId,
      isRead: false,
      isArchived: false,
      createdAt: { gt: new Date(Date.now() - 6 * 60 * 60 * 1000) }
    }
  });
  
  console.log(`\n💾 Existing insights in DB: ${existingInsights.length}`);
  existingInsights.forEach(insight => {
    console.log(`- ${insight.title}: ${insight.description}`);
  });
}

testInsightsLogic().then(() => process.exit());
