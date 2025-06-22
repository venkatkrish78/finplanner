const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTransactions() {
  const demoUserId = 'cmc6o34760000g92xekuyaf2e';
  
  // Check existing transactions
  const transactions = await prisma.transaction.findMany({
    where: { userId: demoUserId },
    include: { category: true }
  });
  
  console.log('Existing transactions:');
  transactions.forEach(t => {
    console.log(`- ${t.description}: ₹${t.amount} (${t.type}) - Category: ${t.category?.name || 'None'}`);
  });
  
  // Check categories
  const categories = await prisma.category.findMany({
    where: { userId: demoUserId }
  });
  
  console.log('\nAvailable categories:');
  categories.forEach(c => {
    console.log(`- ${c.name} (${c.id})`);
  });
  
  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  
  console.log(`\n📊 Financial Summary:`);
  console.log(`Income: ₹${totalIncome}`);
  console.log(`Expenses: ₹${totalExpenses}`);
  console.log(`Balance: ₹${totalIncome - totalExpenses}`);
}

checkTransactions().then(() => process.exit());
