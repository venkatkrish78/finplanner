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
    { name: 'Salary', color: '#22C55E', userId: defaultUser.id },
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

  const createdInvestments = []
  for (const investment of investments) {
    const created = await prisma.investment.create({ data: investment })
    createdInvestments.push(created)
  }

  console.log('📈 Created investments:', investments.length)

  // Create recurring investments with SIPs
  const recurringInvestments = [
    // SBI Bluechip Fund - Monthly SIP
    {
      name: 'SBI Bluechip Fund',
      symbol: 'SBI_BLUE',
      assetClass: 'MUTUAL_FUNDS' as const,
      platform: 'GROWW' as const,
      quantity: 33.33, // ₹5000 / ₹150 NAV
      averagePrice: 150,
      currentPrice: 155,
      totalInvested: 5000,
      currentValue: 5165, // 33.33 * 155
      categoryId: createdCategories.find(c => c.name === 'Investment')!.id,
      userId: defaultUser.id,
    },
    // ICICI Prudential - Monthly SIP
    {
      name: 'ICICI Prudential Equity Fund',
      symbol: 'ICICI_EQ',
      assetClass: 'ELSS' as const,
      platform: 'PAYTM_MONEY' as const,
      quantity: 66.67, // ₹10000 / ₹150 NAV
      averagePrice: 150,
      currentPrice: 158,
      totalInvested: 10000,
      currentValue: 10533, // 66.67 * 158
      categoryId: createdCategories.find(c => c.name === 'Investment')!.id,
      userId: defaultUser.id,
    },
    // HDFC Bank RD - Monthly
    {
      name: 'HDFC Bank Recurring Deposit',
      symbol: 'HDFC_RD',
      assetClass: 'RD' as const,
      platform: 'BANK_BRANCH' as const,
      quantity: 3000, // 3 months * ₹1000
      averagePrice: 1,
      currentPrice: 1,
      totalInvested: 3000,
      currentValue: 3000,
      categoryId: createdCategories.find(c => c.name === 'Investment')!.id,
      userId: defaultUser.id,
    },
    // Axis Long Term Equity - Quarterly SIP
    {
      name: 'Axis Long Term Equity Fund',
      symbol: 'AXIS_LTE',
      assetClass: 'ELSS' as const,
      platform: 'KUVERA' as const,
      quantity: 133.33, // ₹20000 / ₹150 NAV
      averagePrice: 150,
      currentPrice: 160,
      totalInvested: 20000,
      currentValue: 21333, // 133.33 * 160
      categoryId: createdCategories.find(c => c.name === 'Investment')!.id,
      userId: defaultUser.id,
    },
    // Kotak Equity Fund - Monthly SIP
    {
      name: 'Kotak Equity Opportunities Fund',
      symbol: 'KOTAK_EQ',
      assetClass: 'MUTUAL_FUNDS' as const,
      platform: 'GROWW' as const,
      quantity: 50, // ₹7500 / ₹150 NAV
      averagePrice: 150,
      currentPrice: 152,
      totalInvested: 7500,
      currentValue: 7600, // 50 * 152
      categoryId: createdCategories.find(c => c.name === 'Investment')!.id,
      userId: defaultUser.id,
    },
  ]

  const createdRecurringInvestments = []
  for (const investment of recurringInvestments) {
    const created = await prisma.investment.create({ data: investment })
    createdRecurringInvestments.push(created)
  }

  console.log('📊 Created recurring investments:', recurringInvestments.length)

  // Create SIPs for recurring investments
  const sips = [
    {
      investmentId: createdRecurringInvestments[0].id,
      name: 'SBI Bluechip Fund - SIP',
      amount: 5000,
      frequency: 'MONTHLY' as const,
      startDate: new Date('2025-11-05'),
      nextDate: new Date('2026-02-05'),
      status: 'ACTIVE' as const,
      installmentsPaid: 3,
      userId: defaultUser.id,
    },
    {
      investmentId: createdRecurringInvestments[1].id,
      name: 'ICICI Prudential Equity Fund - SIP',
      amount: 10000,
      frequency: 'MONTHLY' as const,
      startDate: new Date('2025-10-10'),
      nextDate: new Date('2026-02-10'),
      status: 'ACTIVE' as const,
      installmentsPaid: 4,
      userId: defaultUser.id,
    },
    {
      investmentId: createdRecurringInvestments[2].id,
      name: 'HDFC Bank RD - Monthly',
      amount: 1000,
      frequency: 'MONTHLY' as const,
      startDate: new Date('2025-11-01'),
      nextDate: new Date('2026-02-01'),
      status: 'ACTIVE' as const,
      installmentsPaid: 3,
      userId: defaultUser.id,
    },
    {
      investmentId: createdRecurringInvestments[3].id,
      name: 'Axis Long Term Equity Fund - SIP',
      amount: 20000,
      frequency: 'QUARTERLY' as const,
      startDate: new Date('2025-10-01'),
      nextDate: new Date('2026-04-01'),
      status: 'ACTIVE' as const,
      installmentsPaid: 1,
      userId: defaultUser.id,
    },
    {
      investmentId: createdRecurringInvestments[4].id,
      name: 'Kotak Equity Opportunities Fund - SIP',
      amount: 7500,
      frequency: 'MONTHLY' as const,
      startDate: new Date('2025-12-15'),
      nextDate: new Date('2026-01-15'),
      status: 'ACTIVE' as const,
      installmentsPaid: 2,
      userId: defaultUser.id,
    },
  ]

  for (const sip of sips) {
    await prisma.sIP.create({ data: sip })
  }

  console.log('💰 Created SIPs:', sips.length)

  // Create auto-generated bills for SIPs
  const sipBills = [
    {
      name: 'SBI Bluechip Fund - SIP',
      amount: 5000,
      frequency: 'MONTHLY' as const,
      description: 'Monthly SIP for SBI Bluechip Fund',
      categoryId: createdCategories.find(c => c.name === 'Investment')!.id,
      nextDueDate: new Date('2026-02-05'),
      linkedInvestmentId: createdRecurringInvestments[0].id,
      isActive: true,
      userId: defaultUser.id,
    },
    {
      name: 'ICICI Prudential Equity Fund - SIP',
      amount: 10000,
      frequency: 'MONTHLY' as const,
      description: 'Monthly SIP for ICICI Prudential Equity Fund',
      categoryId: createdCategories.find(c => c.name === 'Investment')!.id,
      nextDueDate: new Date('2026-02-10'),
      linkedInvestmentId: createdRecurringInvestments[1].id,
      isActive: true,
      userId: defaultUser.id,
    },
    {
      name: 'HDFC Bank RD - Monthly',
      amount: 1000,
      frequency: 'MONTHLY' as const,
      description: 'Monthly RD for HDFC Bank',
      categoryId: createdCategories.find(c => c.name === 'Investment')!.id,
      nextDueDate: new Date('2026-02-01'),
      linkedInvestmentId: createdRecurringInvestments[2].id,
      isActive: true,
      userId: defaultUser.id,
    },
    {
      name: 'Axis Long Term Equity Fund - SIP',
      amount: 20000,
      frequency: 'QUARTERLY' as const,
      description: 'Quarterly SIP for Axis Long Term Equity Fund',
      categoryId: createdCategories.find(c => c.name === 'Investment')!.id,
      nextDueDate: new Date('2026-04-01'),
      linkedInvestmentId: createdRecurringInvestments[3].id,
      isActive: true,
      userId: defaultUser.id,
    },
    {
      name: 'Kotak Equity Opportunities Fund - SIP',
      amount: 7500,
      frequency: 'MONTHLY' as const,
      description: 'Monthly SIP for Kotak Equity Fund',
      categoryId: createdCategories.find(c => c.name === 'Investment')!.id,
      nextDueDate: new Date('2026-01-15'),
      linkedInvestmentId: createdRecurringInvestments[4].id,
      isActive: true,
      userId: defaultUser.id,
    },
  ]

  for (const bill of sipBills) {
    await prisma.bill.create({ data: bill })
  }

  console.log('📋 Created SIP bills:', sipBills.length)

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
