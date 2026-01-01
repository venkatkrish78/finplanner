import { PrismaClient, BillFrequency } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding renewals and transactions data...');

  // Find or create demo user
  let user = await prisma.user.findUnique({
    where: { email: 'demo@finplanner.com' }
  });

  if (!user) {
    console.log('Creating demo user...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 12);
    user = await prisma.user.create({
      data: {
        email: 'demo@finplanner.com',
        name: 'Demo User',
        password: hashedPassword,
      }
    });
  }

  console.log('👤 Using user:', user.email);

  // Get or create categories
  const categories = await prisma.category.findMany({
    where: { userId: user.id }
  });

  let insuranceCategory = categories.find(c => c.name.includes('Insurance'));
  let utilitiesCategory = categories.find(c => c.name.includes('Utilities'));
  let subscriptionCategory = categories.find(c => c.name.includes('Entertainment'));
  let educationCategory = categories.find(c => c.name.includes('Education'));
  let taxCategory = categories.find(c => c.name.includes('Tax'));

  // Create missing categories if needed (using upsert)
  if (!insuranceCategory) {
    insuranceCategory = await prisma.category.upsert({
      where: { 
        name_userId: { name: 'Insurance', userId: user.id }
      },
      update: {},
      create: { name: 'Insurance', color: '#FF6B6B', userId: user.id }
    });
  }

  if (!utilitiesCategory) {
    utilitiesCategory = await prisma.category.upsert({
      where: { 
        name_userId: { name: 'Utilities', userId: user.id }
      },
      update: {},
      create: { name: 'Utilities', color: '#FFEAA7', userId: user.id }
    });
  }

  if (!subscriptionCategory) {
    subscriptionCategory = await prisma.category.upsert({
      where: { 
        name_userId: { name: 'Subscriptions', userId: user.id }
      },
      update: {},
      create: { name: 'Subscriptions', color: '#96CEB4', userId: user.id }
    });
  }

  if (!educationCategory) {
    educationCategory = await prisma.category.upsert({
      where: { 
        name_userId: { name: 'Education', userId: user.id }
      },
      update: {},
      create: { name: 'Education', color: '#98D8C8', userId: user.id }
    });
  }

  if (!taxCategory) {
    taxCategory = await prisma.category.upsert({
      where: { 
        name_userId: { name: 'Tax', userId: user.id }
      },
      update: {},
      create: { name: 'Tax', color: '#DDA0DD', userId: user.id }
    });
  }

  console.log('📦 Categories ready');

  // Sample renewals/bills data
  const now = new Date();
  const bills = [
    {
      name: 'Car Insurance - LIC',
      amount: 15000,
      frequency: 'YEARLY' as BillFrequency,
      description: 'Annual car insurance renewal',
      categoryId: insuranceCategory.id,
      userId: user.id,
      provider: 'ICICI Lombard',
      policyNumber: 'POL-2024-CAR-1234',
      reminderDays: '30,7,1',
      nextDueDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days ahead
      isActive: true
    },
    {
      name: 'School Fees - Quarterly',
      amount: 25000,
      frequency: 'QUARTERLY' as BillFrequency,
      description: 'Children school fees',
      categoryId: educationCategory.id,
      userId: user.id,
      provider: 'Delhi Public School',
      policyNumber: 'STU-2024-5678',
      reminderDays: '30,7,1',
      nextDueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days ahead (due soon)
      isActive: true
    },
    {
      name: 'Netflix Subscription',
      amount: 649,
      frequency: 'MONTHLY' as BillFrequency,
      description: 'Premium Netflix subscription',
      categoryId: subscriptionCategory.id,
      userId: user.id,
      provider: 'Netflix India',
      policyNumber: 'NET-2024-PREM-9012',
      reminderDays: '7,1',
      nextDueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow (due soon)
      isActive: true
    },
    {
      name: 'Electricity Bill',
      amount: 2400,
      frequency: 'MONTHLY' as BillFrequency,
      description: 'Monthly electricity bill',
      categoryId: utilitiesCategory.id,
      userId: user.id,
      provider: 'BSES Rajdhani',
      policyNumber: 'ELEC-12345678',
      reminderDays: '7,1',
      nextDueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days overdue
      isActive: true
    },
    {
      name: 'Property Tax',
      amount: 8000,
      frequency: 'HALF_YEARLY' as BillFrequency,
      description: 'Half-yearly property tax payment',
      categoryId: taxCategory.id,
      userId: user.id,
      provider: 'Municipal Corporation',
      policyNumber: 'PROP-TAX-2024-456',
      reminderDays: '30,7',
      nextDueDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days ahead
      isActive: true
    },
    {
      name: 'Health Insurance',
      amount: 18000,
      frequency: 'YEARLY' as BillFrequency,
      description: 'Family health insurance',
      categoryId: insuranceCategory.id,
      userId: user.id,
      provider: 'Star Health',
      policyNumber: 'HEALTH-2024-789',
      reminderDays: '30,7,1',
      nextDueDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days ahead (upcoming)
      isActive: true
    }
  ];

  console.log('💰 Creating bills/renewals...');
  
  for (const billData of bills) {
    const existingBill = await prisma.bill.findFirst({
      where: {
        name: billData.name,
        userId: user.id
      }
    });

    if (!existingBill) {
      const bill = await prisma.bill.create({
        data: billData
      });
      console.log(`  ✅ Created: ${bill.name} - ${bill.frequency} - ₹${bill.amount}`);
    } else {
      console.log(`  ⏭️  Skipped (exists): ${billData.name}`);
    }
  }

  // Create sample transactions for current month
  console.log('💳 Creating sample transactions for current month...');
  
  // Create/get additional categories for transactions
  let incomeCategory = categories.find(c => c.name.includes('Income'));
  if (!incomeCategory) {
    incomeCategory = await prisma.category.upsert({
      where: { 
        name_userId: { name: 'Income', userId: user.id }
      },
      update: {},
      create: { name: 'Income', color: '#82E0AA', userId: user.id }
    });
  }

  let foodCategory = categories.find(c => c.name.includes('Food'));
  if (!foodCategory) {
    foodCategory = await prisma.category.upsert({
      where: { 
        name_userId: { name: 'Food & Dining', userId: user.id }
      },
      update: {},
      create: { name: 'Food & Dining', color: '#FF6B6B', userId: user.id }
    });
  }

  let transportCategory = categories.find(c => c.name.includes('Transportation'));
  if (!transportCategory) {
    transportCategory = await prisma.category.upsert({
      where: { 
        name_userId: { name: 'Transportation', userId: user.id }
      },
      update: {},
      create: { name: 'Transportation', color: '#4ECDC4', userId: user.id }
    });
  }

  let shoppingCategory = categories.find(c => c.name.includes('Shopping'));
  if (!shoppingCategory) {
    shoppingCategory = await prisma.category.upsert({
      where: { 
        name_userId: { name: 'Shopping', userId: user.id }
      },
      update: {},
      create: { name: 'Shopping', color: '#45B7D1', userId: user.id }
    });
  }

  let healthcareCategory = categories.find(c => c.name.includes('Healthcare'));
  if (!healthcareCategory) {
    healthcareCategory = await prisma.category.upsert({
      where: { 
        name_userId: { name: 'Healthcare', userId: user.id }
      },
      update: {},
      create: { name: 'Healthcare', color: '#DDA0DD', userId: user.id }
    });
  }

  let entertainmentCategory = categories.find(c => c.name.includes('Entertainment'));
  if (!entertainmentCategory) {
    entertainmentCategory = await prisma.category.upsert({
      where: { 
        name_userId: { name: 'Entertainment', userId: user.id }
      },
      update: {},
      create: { name: 'Entertainment', color: '#96CEB4', userId: user.id }
    });
  }
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const transactions = [
    {
      amount: 50000,
      type: 'INCOME',
      description: 'Monthly Salary',
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      categoryId: incomeCategory.id,
      userId: user.id,
      status: 'SUCCESS',
      source: 'MANUAL'
    },
    {
      amount: 1200,
      type: 'EXPENSE',
      description: 'Grocery Shopping',
      merchant: 'Reliance Fresh',
      date: new Date(now.getFullYear(), now.getMonth(), 3),
      categoryId: foodCategory.id,
      userId: user.id,
      status: 'SUCCESS',
      source: 'MANUAL'
    },
    {
      amount: 500,
      type: 'EXPENSE',
      description: 'Uber Ride',
      merchant: 'Uber',
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      categoryId: transportCategory.id,
      userId: user.id,
      status: 'SUCCESS',
      source: 'MANUAL'
    },
    {
      amount: 2500,
      type: 'EXPENSE',
      description: 'Online Shopping',
      merchant: 'Amazon India',
      date: new Date(now.getFullYear(), now.getMonth(), 7),
      categoryId: shoppingCategory.id,
      userId: user.id,
      status: 'SUCCESS',
      source: 'MANUAL'
    },
    {
      amount: 800,
      type: 'EXPENSE',
      description: 'Restaurant Dinner',
      merchant: 'Cafe Delhi Heights',
      date: new Date(now.getFullYear(), now.getMonth(), 10),
      categoryId: foodCategory.id,
      userId: user.id,
      status: 'SUCCESS',
      source: 'MANUAL'
    },
    {
      amount: 3000,
      type: 'EXPENSE',
      description: 'Medical Checkup',
      merchant: 'Max Hospital',
      date: new Date(now.getFullYear(), now.getMonth(), 12),
      categoryId: healthcareCategory.id,
      userId: user.id,
      status: 'SUCCESS',
      source: 'MANUAL'
    },
    {
      amount: 1500,
      type: 'EXPENSE',
      description: 'Movie & Snacks',
      merchant: 'PVR Cinemas',
      date: new Date(now.getFullYear(), now.getMonth(), 15),
      categoryId: entertainmentCategory.id,
      userId: user.id,
      status: 'SUCCESS',
      source: 'MANUAL'
    },
    {
      amount: 5000,
      type: 'INCOME',
      description: 'Freelance Project Payment',
      date: new Date(now.getFullYear(), now.getMonth(), 18),
      categoryId: incomeCategory.id,
      userId: user.id,
      status: 'SUCCESS',
      source: 'MANUAL'
    }
  ];

  for (const txnData of transactions) {
    const existingTxn = await prisma.transaction.findFirst({
      where: {
        description: txnData.description,
        date: txnData.date,
        userId: user.id
      }
    });

    if (!existingTxn) {
      await prisma.transaction.create({
        data: txnData
      });
      console.log(`  ✅ Created transaction: ${txnData.description} - ₹${txnData.amount}`);
    } else {
      console.log(`  ⏭️  Skipped transaction (exists): ${txnData.description}`);
    }
  }

  console.log('✅ Seed completed successfully!');
  console.log(`
📊 Summary:
  - Created 6 sample renewals/bills (various frequencies and statuses)
  - Created 8 sample transactions for current month
  - Total Income this month: ₹55,000
  - Total Expenses this month: ₹10,500
  
🔐 Login Credentials:
  Email: demo@finplanner.com
  Password: password123
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
