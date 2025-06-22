const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserIds() {
  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  const transactions = await prisma.transaction.findMany({ 
    select: { userId: true },
    distinct: ['userId']
  });
  
  console.log('Users:', users);
  console.log('Transaction userIds:', transactions);
  
  // Check if demo user has transactions
  const demoUser = users.find(u => u.email === 'demo@finplanner.com');
  if (demoUser) {
    const userTransactions = await prisma.transaction.count({
      where: { userId: demoUser.id }
    });
    console.log(`Demo user (${demoUser.id}) has ${userTransactions} transactions`);
  }
}

checkUserIds().then(() => process.exit());
