const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMoreTransactions() {
  const demoUserId = 'cmc6o34760000g92xekuyaf2e';
  
  // Get or create categories
  const categories = await prisma.category.findMany({
    where: { userId: demoUserId }
  });
  
  const foodCat = categories.find(c => c.name === 'Food') || categories[0];
  const transportCat = categories.find(c => c.name === 'Transport') || categories[1];
  const entertainmentCat = categories.find(c => c.name === 'Entertainment') || categories[2];
  
  // Add more transactions
  const newTransactions = [
    // More expenses
    { amount: 2500, type: 'EXPENSE', description: 'Grocery shopping', categoryId: foodCat?.id, date: new Date('2024-06-15') },
    { amount: 800, type: 'EXPENSE', description: 'Uber ride', categoryId: transportCat?.id, date: new Date('2024-06-14') },
    { amount: 1200, type: 'EXPENSE', description: 'Movie tickets', categoryId: entertainmentCat?.id, date: new Date('2024-06-13') },
    { amount: 3500, type: 'EXPENSE', description: 'Restaurant dinner', categoryId: foodCat?.id, date: new Date('2024-06-12') },
    { amount: 500, type: 'EXPENSE', description: 'Coffee', categoryId: foodCat?.id, date: new Date('2024-06-11') },
    
    // Add another income
    { amount: 25000, type: 'INCOME', description: 'Freelance payment', date: new Date('2024-06-10') },
  ];
  
  for (const transaction of newTransactions) {
    await prisma.transaction.create({
      data: {
        ...transaction,
        userId: demoUserId,
        merchant: transaction.description
      }
    });
  }
  
  console.log(`✅ Added ${newTransactions.length} more transactions`);
  
  // Check total transactions now
  const totalTransactions = await prisma.transaction.count({
    where: { userId: demoUserId }
  });
  
  console.log(`📊 Demo user now has ${totalTransactions} total transactions`);
}

addMoreTransactions().then(() => process.exit());
