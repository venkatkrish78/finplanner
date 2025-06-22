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
    const created = await prisma.category.upsert({
      where: { 
        name_userId: { 
          name: category.name, 
          userId: category.userId 
        } 
      },
      update: {},
      create: category,
    })
    createdCategories.push(created)
  }

  console.log('📂 Created categories:', createdCategories.length)

  const transactions = [
    // Income
    { amount: 75000, type: 'INCOME' as const, description: 'Monthly Salary', date: new Date('2024-06-15'), categoryId: createdCategories.find(c => c.name === 'Income')!.id, userId: defaultUser.id },
    { amount: 12000, type: 'INCOME' as const, description: 'Freelance Project', date: new Date('2024-06-10'), categoryId: createdCategories.find(c => c.name === 'Income')!.id, userId: defaultUser.id },
    
    // Expenses
    { amount: -25000, type: 'EXPENSE' as const, description: 'Rent Payment', merchant: 'Landlord', date: new Date('2024-06-01'), categoryId: createdCategories.find(c => c.name === 'Bills & Utilities')!.id, userId: defaultUser.id },
    { amount: -2500, type: 'EXPENSE' as const, description: 'Grocery Shopping', merchant: 'BigBasket', date: new Date('2024-06-20'), categoryId: createdCategories.find(c => c.name === 'Food & Dining')!.id, userId: defaultUser.id },
    { amount: -1800, type: 'EXPENSE' as const, description: 'Restaurant Dinner', merchant: 'Restaurant', date: new Date('2024-06-18'), categoryId: createdCategories.find(c => c.name === 'Food & Dining')!.id, userId: defaultUser.id },
    { amount: -3500, type: 'EXPENSE' as const, description: 'Fuel', merchant: 'Petrol Pump', date: new Date('2024-06-19'), categoryId: createdCategories.find(c => c.name === 'Transportation')!.id, userId: defaultUser.id },
    { amount: -8500, type: 'EXPENSE' as const, description: 'Online Shopping', merchant: 'Amazon', date: new Date('2024-06-14'), categoryId: createdCategories.find(c => c.name === 'Shopping')!.id, userId: defaultUser.id },
    { amount: -800, type: 'EXPENSE' as const, description: 'Electricity Bill', merchant: 'Power Company', date: new Date('2024-06-03'), categoryId: createdCategories.find(c => c.name === 'Bills & Utilities')!.id, userId: defaultUser.id },
  ]

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction,
    })
  }

  console.log('💰 Created transactions:', transactions.length)

  const bills = [
    { name: 'Electricity Bill', amount: 800, frequency: 'MONTHLY' as const, description: 'Monthly electricity bill', nextDueDate: new Date('2024-07-01'), categoryId: createdCategories.find(c => c.name === 'Bills & Utilities')!.id, userId: defaultUser.id },
    { name: 'Internet Bill', amount: 1500, frequency: 'MONTHLY' as const, description: 'Monthly internet subscription', nextDueDate: new Date('2024-07-05'), categoryId: createdCategories.find(c => c.name === 'Bills & Utilities')!.id, userId: defaultUser.id },
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
