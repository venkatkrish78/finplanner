import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create or find demo user
  let demoUser = await prisma.user.findUnique({
    where: { email: 'demo@finplanner.com' }
  })

  if (!demoUser) {
    console.log('👤 Creating demo user...')
    const hashedPassword = await bcrypt.hash('demo123', 12)
    
    demoUser = await prisma.user.create({
      data: {
        name: 'Demo User',
        email: 'demo@finplanner.com',
        password: hashedPassword
      }
    })
    console.log('✅ Demo user created')
  } else {
    console.log('👤 Demo user already exists')
  }

  // Clear existing data for demo user
  console.log('🧹 Clearing existing demo data...')
  await prisma.asset.deleteMany({ where: { userId: demoUser.id } })
  await prisma.transaction.deleteMany({ where: { userId: demoUser.id } })
  await prisma.bill.deleteMany({ where: { userId: demoUser.id } })
  await prisma.financialGoal.deleteMany({ where: { userId: demoUser.id } })
  await prisma.loan.deleteMany({ where: { userId: demoUser.id } })
  await prisma.investment.deleteMany({ where: { userId: demoUser.id } })
  await prisma.category.deleteMany({ where: { userId: demoUser.id } })

  // Create categories
  console.log('📂 Creating categories...')
  const foodCategory = await prisma.category.create({
    data: { name: 'Food & Dining', userId: demoUser.id, color: '#FF6B6B' }
  })
  
  const salaryCategory = await prisma.category.create({
    data: { name: 'Salary', userId: demoUser.id, color: '#98D8C8' }
  })
  
  const utilitiesCategory = await prisma.category.create({
    data: { name: 'Utilities', userId: demoUser.id, color: '#FFEAA7' }
  })

  // Create transactions
  console.log('💰 Creating transactions...')
  await prisma.transaction.create({
    data: {
      userId: demoUser.id,
      type: 'INCOME',
      amount: 75000,
      description: 'Monthly Salary',
      categoryId: salaryCategory.id,
      date: new Date('2024-06-01')
    }
  })

  await prisma.transaction.create({
    data: {
      userId: demoUser.id,
      type: 'EXPENSE',
      amount: 1200,
      description: 'Grocery Shopping',
      categoryId: foodCategory.id,
      date: new Date('2024-06-02')
    }
  })

  await prisma.transaction.create({
    data: {
      userId: demoUser.id,
      type: 'EXPENSE',
      amount: 2500,
      description: 'Electricity Bill',
      categoryId: utilitiesCategory.id,
      date: new Date('2024-06-05')
    }
  })

  // Create financial goals
  console.log('🎯 Creating financial goals...')
  await prisma.financialGoal.create({
    data: {
      userId: demoUser.id,
      name: 'Emergency Fund',
      targetAmount: 500000,
      currentAmount: 125000,
      targetDate: new Date('2024-12-31'),
      description: '6 months of expenses as emergency fund',
      goalType: 'EMERGENCY_FUND'
    }
  })

  // Create bills
  console.log('📄 Creating bills...')
  await prisma.bill.create({
    data: {
      userId: demoUser.id,
      name: 'Electricity Bill',
      amount: 2500,
      frequency: 'MONTHLY',
      categoryId: utilitiesCategory.id,
      nextDueDate: new Date('2024-07-05'),
      description: 'Monthly electricity bill'
    }
  })

  // Create loans
  console.log('🏦 Creating loans...')
  await prisma.loan.create({
    data: {
      userId: demoUser.id,
      name: 'Home Loan - HDFC',
      loanType: 'HOME_LOAN',
      principalAmount: 2500000,
      currentBalance: 2200000,
      interestRate: 8.5,
      emiAmount: 21500,
      tenure: 240,
      startDate: new Date('2022-01-01'),
      endDate: new Date('2042-01-01'),
      description: 'Home loan from HDFC Bank'
    }
  })

  // Create investments
  console.log('📈 Creating investments...')
  await prisma.investment.create({
    data: {
      userId: demoUser.id,
      name: 'Nifty 50 Index Fund',
      assetClass: 'MUTUAL_FUNDS',
      platform: 'ZERODHA',
      quantity: 100,
      averagePrice: 500,
      currentPrice: 550,
      totalInvested: 50000,
      currentValue: 55000,
      purchaseDate: new Date('2024-01-15'),
      description: 'Nifty 50 index fund investment'
    }
  })

  await prisma.investment.create({
    data: {
      userId: demoUser.id,
      name: 'HDFC Bank Shares',
      symbol: 'HDFCBANK',
      assetClass: 'STOCKS',
      platform: 'ZERODHA',
      quantity: 20,
      averagePrice: 1250,
      currentPrice: 1400,
      totalInvested: 25000,
      currentValue: 28000,
      purchaseDate: new Date('2024-03-10'),
      description: 'HDFC Bank equity shares'
    }
  })

  // Create assets
  console.log('🏠 Creating assets...')
  await prisma.asset.create({
    data: {
      userId: demoUser.id,
      name: 'Family Home',
      type: 'PROPERTY',
      value: 5000000,
      description: '3BHK apartment in Mumbai',
      location: 'Mumbai',
      purchaseDate: new Date('2020-01-15')
    }
  })

  await prisma.asset.create({
    data: {
      userId: demoUser.id,
      name: 'SBI Savings Account',
      type: 'BANK_ACCOUNT',
      value: 150000,
      description: 'Primary savings account'
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('📊 Demo data created:')
  console.log('   💰 3 transactions')
  console.log('   🎯 1 financial goal')
  console.log('   📄 1 bill')
  console.log('   🏦 1 loan')
  console.log('   📈 2 investments')
  console.log('   🏠 2 assets')
  console.log('')
  console.log('🔑 Login with: demo@finplanner.com / demo123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
