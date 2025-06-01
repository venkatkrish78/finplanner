
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default categories
  const categories = [
    { name: 'Food & Dining', color: '#FF6B6B', isDefault: true },
    { name: 'Transportation', color: '#4ECDC4', isDefault: true },
    { name: 'Shopping', color: '#45B7D1', isDefault: true },
    { name: 'Entertainment', color: '#96CEB4', isDefault: true },
    { name: 'Bills & Utilities', color: '#FFEAA7', isDefault: true },
    { name: 'Healthcare', color: '#DDA0DD', isDefault: true },
    { name: 'Education', color: '#98D8C8', isDefault: true },
    { name: 'Travel', color: '#F7DC6F', isDefault: true },
    { name: 'Salary', color: '#82E0AA', isDefault: true },
    { name: 'Investment', color: '#85C1E9', isDefault: true },
    { name: 'Business', color: '#F8C471', isDefault: true },
    { name: 'Other Income', color: '#D7BDE2', isDefault: true },
    { name: 'Savings', color: '#A9DFBF', isDefault: true },
    { name: 'Insurance', color: '#F9E79F', isDefault: true },
    { name: 'Taxes', color: '#FADBD8', isDefault: true },
  ];

  console.log('📂 Creating default categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Get created categories for reference
  const createdCategories = await prisma.category.findMany();
  const foodCategory = createdCategories.find(c => c.name === 'Food & Dining');
  const salaryCategory = createdCategories.find(c => c.name === 'Salary');
  const billsCategory = createdCategories.find(c => c.name === 'Bills & Utilities');
  const savingsCategory = createdCategories.find(c => c.name === 'Savings');
  const investmentCategory = createdCategories.find(c => c.name === 'Investment');

  // Create sample transactions
  if (foodCategory && salaryCategory) {
    console.log('💰 Creating sample transactions...');
    
    const sampleTransactions = [
      {
        amount: 50000,
        type: 'INCOME' as const,
        description: 'Monthly Salary',
        date: new Date('2024-01-01'),
        categoryId: salaryCategory.id,
      },
      {
        amount: 1200,
        type: 'EXPENSE' as const,
        description: 'Grocery Shopping',
        merchant: 'BigBasket',
        date: new Date('2024-01-02'),
        categoryId: foodCategory.id,
      },
      {
        amount: 800,
        type: 'EXPENSE' as const,
        description: 'Restaurant Dinner',
        merchant: 'Zomato',
        date: new Date('2024-01-03'),
        categoryId: foodCategory.id,
      },
    ];

    for (const transaction of sampleTransactions) {
      await prisma.transaction.create({
        data: transaction,
      });
    }
  }

  // Create sample bills
  if (billsCategory) {
    console.log('📋 Creating sample bills...');
    
    const sampleBills = [
      {
        name: 'Electricity Bill',
        amount: 2500,
        frequency: 'MONTHLY' as const,
        description: 'Monthly electricity bill',
        nextDueDate: new Date('2024-02-05'),
        categoryId: billsCategory.id,
      },
      {
        name: 'Internet Bill',
        amount: 1200,
        frequency: 'MONTHLY' as const,
        description: 'Broadband internet subscription',
        nextDueDate: new Date('2024-02-10'),
        categoryId: billsCategory.id,
      },
      {
        name: 'Netflix Subscription',
        amount: 649,
        frequency: 'MONTHLY' as const,
        description: 'Netflix premium subscription',
        nextDueDate: new Date('2024-02-15'),
        categoryId: billsCategory.id,
      },
    ];

    for (const bill of sampleBills) {
      await prisma.bill.create({
        data: bill,
      });
    }
  }

  // Create sample financial goals
  if (savingsCategory) {
    console.log('🎯 Creating sample financial goals...');
    
    const sampleGoals = [
      {
        name: 'Emergency Fund',
        description: 'Build an emergency fund for 6 months of expenses',
        goalType: 'EMERGENCY_FUND' as const,
        targetAmount: 300000,
        currentAmount: 50000,
        targetDate: new Date('2024-12-31'),
        categoryId: savingsCategory.id,
      },
      {
        name: 'Vacation to Europe',
        description: 'Save for a 2-week vacation to Europe',
        goalType: 'VACATION' as const,
        targetAmount: 200000,
        currentAmount: 25000,
        targetDate: new Date('2024-08-15'),
        categoryId: savingsCategory.id,
      },
      {
        name: 'House Down Payment',
        description: 'Save for house down payment',
        goalType: 'HOUSE' as const,
        targetAmount: 1000000,
        currentAmount: 150000,
        targetDate: new Date('2025-12-31'),
        categoryId: savingsCategory.id,
      },
    ];

    for (const goal of sampleGoals) {
      await prisma.financialGoal.create({
        data: goal,
      });
    }
  }

  // Create sample investments
  if (investmentCategory) {
    console.log('📈 Creating sample investments...');
    
    const sampleInvestments = [
      {
        name: 'SBI Bluechip Fund',
        symbol: 'SBI_BLUECHIP',
        assetClass: 'MUTUAL_FUNDS' as const,
        platform: 'GROWW' as const,
        quantity: 100,
        averagePrice: 500,
        currentPrice: 520,
        totalInvested: 50000,
        currentValue: 52000,
        categoryId: investmentCategory.id,
      },
      {
        name: 'Reliance Industries',
        symbol: 'RELIANCE',
        assetClass: 'STOCKS' as const,
        platform: 'ZERODHA' as const,
        quantity: 10,
        averagePrice: 2500,
        currentPrice: 2600,
        totalInvested: 25000,
        currentValue: 26000,
        categoryId: investmentCategory.id,
      },
      {
        name: 'PPF Account',
        assetClass: 'PPF' as const,
        platform: 'BANK_BRANCH' as const,
        quantity: 1,
        averagePrice: 150000,
        currentPrice: 150000,
        totalInvested: 150000,
        currentValue: 150000,
        categoryId: investmentCategory.id,
      },
    ];

    for (const investment of sampleInvestments) {
      await prisma.investment.create({
        data: investment,
      });
    }
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Created:');
  console.log(`   - ${categories.length} categories`);
  console.log(`   - 3 sample transactions`);
  console.log(`   - 3 sample bills`);
  console.log(`   - 3 sample financial goals`);
  console.log(`   - 3 sample investments`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
