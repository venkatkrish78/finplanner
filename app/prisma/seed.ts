import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const defaultUser = await prisma.user.upsert({
    where: { email: 'demo@finplanner.com' },
    update: {},
    create: {
      email: 'demo@finplanner.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  })

  console.log('👤 Created default user:', defaultUser.email)

  const categories = [
    { name: 'Food & Dining', color: '#FF6B6B', userId: defaultUser.id },
    { name: 'Transportation', color: '#4ECDC4', userId: defaultUser.id },
    { name: 'Shopping', color: '#45B7D1', userId: defaultUser.id },
    { name: 'Entertainment', color: '#96CEB4', userId: defaultUser.id },
    { name: 'Bills & Utilities', color: '#FFEAA7', userId: defaultUser.id },
    { name: 'Healthcare', color: '#DDA0DD', userId: defaultUser.id },
    { name: 'Education', color: '#98D8C8', userId: defaultUser.id },
    { name: 'Travel', color: '#F7DC6F', userId: defaultUser.id },
    { name: 'Income', color: '#82E0AA', userId: defaultUser.id },
    { name: 'Investment', color: '#85C1E9', userId: defaultUser.id },
  ]

  const createdCategories = []
  for (const category of categories) {
    // Try to find existing category first
    const existing = await prisma.category.findFirst({
      where: { 
        name: category.name,
        userId: category.userId
      }
    })
    
    if (existing) {
      createdCategories.push(existing)
    } else {
      // Create new category
      const created = await prisma.category.create({
        data: category
      })
      createdCategories.push(created)
  }
    }

  console.log('📂 Created categories:', createdCategories.length)

  const transactions = [
    // Income - January 2026 (Current Month)
    { amount: 75000, type: 'INCOME' as const, description: 'Monthly Salary', date: new Date('2026-01-01'), categoryId: createdCategories.find(c => c.name === 'Income')!.id, userId: defaultUser.id },
    { amount: 12000, type: 'INCOME' as const, description: 'Freelance Project', date: new Date('2026-01-01'), categoryId: createdCategories.find(c => c.name === 'Income')!.id, userId: defaultUser.id },
    { amount: 5000, type: 'INCOME' as const, description: 'Bonus', date: new Date('2026-01-01'), categoryId: createdCategories.find(c => c.name === 'Income')!.id, userId: defaultUser.id },
    
    // Expenses - January 2026 (Current Month)
    { amount: -25000, type: 'EXPENSE' as const, description: 'Rent Payment', merchant: 'Landlord', date: new Date('2026-01-01'), categoryId: createdCategories.find(c => c.name === 'Bills & Utilities')!.id, userId: defaultUser.id },
    { amount: -2500, type: 'EXPENSE' as const, description: 'Grocery Shopping', merchant: 'BigBasket', date: new Date('2026-01-01'), categoryId: createdCategories.find(c => c.name === 'Food & Dining')!.id, userId: defaultUser.id },
    { amount: -1800, type: 'EXPENSE' as const, description: 'Restaurant Dinner', merchant: 'Swiggy', date: new Date('2026-01-01'), categoryId: createdCategories.find(c => c.name === 'Food & Dining')!.id, userId: defaultUser.id },
    { amount: -3500, type: 'EXPENSE' as const, description: 'Fuel', merchant: 'Indian Oil', date: new Date('2026-01-01'), categoryId: createdCategories.find(c => c.name === 'Transportation')!.id, userId: defaultUser.id },
    { amount: -8500, type: 'EXPENSE' as const, description: 'Online Shopping', merchant: 'Amazon', date: new Date('2026-01-01'), categoryId: createdCategories.find(c => c.name === 'Shopping')!.id, userId: defaultUser.id },
    { amount: -800, type: 'EXPENSE' as const, description: 'Electricity Bill', merchant: 'Power Company', date: new Date('2026-01-01'), categoryId: createdCategories.find(c => c.name === 'Bills & Utilities')!.id, userId: defaultUser.id },
    { amount: -1500, type: 'EXPENSE' as const, description: 'Internet Bill', merchant: 'Airtel', date: new Date('2026-01-01'), categoryId: createdCategories.find(c => c.name === 'Bills & Utilities')!.id, userId: defaultUser.id },
    { amount: -500, type: 'EXPENSE' as const, description: 'Uber Rides', merchant: 'Uber', date: new Date('2026-01-01'), categoryId: createdCategories.find(c => c.name === 'Transportation')!.id, userId: defaultUser.id },
  ]

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction,
    })
  }

  console.log('💰 Created transactions:', transactions.length)

  const bills = [
    // Monthly Bills
    { 
      name: 'Electricity Bill', 
      amount: 800, 
      frequency: 'MONTHLY' as const, 
      description: 'Monthly electricity bill', 
      nextDueDate: new Date('2026-02-01'), 
      provider: 'Power Company',
      reminderDays: '7,1',
      categoryId: createdCategories.find(c => c.name === 'Bills & Utilities')!.id, 
      userId: defaultUser.id 
    },
    { 
      name: 'Internet Bill', 
      amount: 1500, 
      frequency: 'MONTHLY' as const, 
      description: 'Monthly internet subscription', 
      nextDueDate: new Date('2026-02-05'), 
      provider: 'Airtel',
      policyNumber: 'INT-12345',
      reminderDays: '7,1',
      categoryId: createdCategories.find(c => c.name === 'Bills & Utilities')!.id, 
      userId: defaultUser.id 
    },
    { 
      name: 'Netflix Subscription', 
      amount: 199, 
      frequency: 'MONTHLY' as const, 
      description: 'Monthly Netflix subscription', 
      nextDueDate: new Date('2026-01-02'), // Due tomorrow - shows "due soon"
      provider: 'Netflix',
      policyNumber: 'NFX-789',
      reminderDays: '30,7,1',
      categoryId: createdCategories.find(c => c.name === 'Entertainment')!.id, 
      userId: defaultUser.id 
    },
    // Quarterly Bills
    { 
      name: 'School Fees', 
      amount: 25000, 
      frequency: 'QUARTERLY' as const, 
      description: 'Quarterly school tuition fees', 
      nextDueDate: new Date('2026-01-08'), // Due next week
      provider: 'Delhi Public School',
      policyNumber: 'STU-45678',
      reminderDays: '30,7,1',
      categoryId: createdCategories.find(c => c.name === 'Education')!.id, 
      userId: defaultUser.id 
    },
    // Half-yearly Bills
    { 
      name: 'Tax Payment', 
      amount: 50000, 
      frequency: 'HALF_YEARLY' as const, 
      description: 'Half-yearly income tax advance payment', 
      nextDueDate: new Date('2026-03-15'), // Due in 2.5 months
      provider: 'Income Tax Department',
      policyNumber: 'PAN-ABC123',
      reminderDays: '30,7,1',
      categoryId: createdCategories.find(c => c.name === 'Bills & Utilities')!.id, 
      userId: defaultUser.id 
    },
    // Yearly Bills
    { 
      name: 'Car Insurance', 
      amount: 15000, 
      frequency: 'YEARLY' as const, 
      description: 'Annual car insurance premium', 
      nextDueDate: new Date('2026-03-15'), // Due in 2 months
      provider: 'ICICI Lombard',
      policyNumber: 'POL-987654',
      reminderDays: '30,7,1',
      categoryId: createdCategories.find(c => c.name === 'Bills & Utilities')!.id, 
      userId: defaultUser.id 
    },
    { 
      name: 'Life Insurance', 
      amount: 24000, 
      frequency: 'YEARLY' as const, 
      description: 'Annual LIC premium', 
      nextDueDate: new Date('2026-03-01'), // Due in ~2 months
      provider: 'LIC of India',
      policyNumber: 'LIC-123456789',
      reminderDays: '30,7,1',
      categoryId: createdCategories.find(c => c.name === 'Bills & Utilities')!.id, 
      userId: defaultUser.id 
    },
    // Overdue Bill
    { 
      name: 'Credit Card Bill', 
      amount: 8500, 
      frequency: 'MONTHLY' as const, 
      description: 'Monthly credit card payment', 
      nextDueDate: new Date('2025-12-28'), // Overdue - 4 days ago
      provider: 'HDFC Bank',
      policyNumber: 'CC-4567',
      reminderDays: '7,1',
      categoryId: createdCategories.find(c => c.name === 'Bills & Utilities')!.id, 
      userId: defaultUser.id 
    },
  ]

  for (const bill of bills) {
    await prisma.bill.create({ data: bill })
  }

  console.log('📄 Created bills:', bills.length)

  const goals = [
    { name: 'Emergency Fund', description: 'Build emergency fund', goalType: 'EMERGENCY_FUND' as const, targetAmount: 100000, currentAmount: 25000, targetDate: new Date('2024-12-31'), categoryId: createdCategories.find(c => c.name === 'Income')!.id, userId: defaultUser.id },
    { name: 'Vacation Fund', description: 'Save for Europe trip', goalType: 'VACATION' as const, targetAmount: 200000, currentAmount: 50000, targetDate: new Date('2024-08-30'), categoryId: createdCategories.find(c => c.name === 'Travel')!.id, userId: defaultUser.id },
  ]

  for (const goal of goals) {
    await prisma.financialGoal.create({ data: goal })
  }

  console.log('🎯 Created financial goals:', goals.length)

  const investments = [
    { name: 'HDFC Top 100 Fund', symbol: 'HDFC_TOP_100', assetClass: 'MUTUAL_FUNDS' as const, platform: 'GROWW' as const, quantity: 100, averagePrice: 500, currentPrice: 520, totalInvested: 50000, currentValue: 52000, categoryId: createdCategories.find(c => c.name === 'Investment')!.id, userId: defaultUser.id },
    { name: 'Reliance Industries', symbol: 'RELIANCE', assetClass: 'STOCKS' as const, platform: 'ZERODHA' as const, quantity: 10, averagePrice: 2500, currentPrice: 2600, totalInvested: 25000, currentValue: 26000, categoryId: createdCategories.find(c => c.name === 'Investment')!.id, userId: defaultUser.id },
  ]

  for (const investment of investments) {
    await prisma.investment.create({ data: investment })
  }

  console.log('📈 Created investments:', investments.length)

  const loan = {
    name: 'Home Loan',
    loanType: 'HOME_LOAN' as const,
    principalAmount: 2000000,
    currentBalance: 1800000,
    interestRate: 8.5,
    emiAmount: 15000,
    tenure: 240,
    startDate: new Date('2020-01-01'),
    description: 'Home loan for apartment purchase',
    categoryId: createdCategories.find(c => c.name === 'Bills & Utilities')!.id,
    userId: defaultUser.id,
  }

  await prisma.loan.create({ data: loan })
  console.log('🏠 Created loan: Home Loan')

  console.log('✅ Database seeded successfully!')
  console.log('📧 Demo user email: demo@finplanner.com')
  console.log('🔑 Demo user password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
