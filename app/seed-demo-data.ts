import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // NEW - Uses existing demo user
const demoUser = await prisma.user.findUnique({
  where: { email: 'demo@finplanner.com' }
})

if (!demoUser) {
  throw new Error('Demo user not found! Please create demo@finplanner.com first.')
}

// Update AI insights for existing user
await prisma.user.update({
  where: { id: demoUser.id },
  data: {
    aiInsights: JSON.stringify({
      lastAnalysis: new Date().toISOString(),
      riskProfile: 'moderate',
      recommendations: []
    })
  }
})

  console.log('✅ Demo user created:', demoUser.email)

  // Create Transactions (last 6 months)
  const transactions = [
    // Income transactions
    { date: '2024-06-15', description: 'Salary - TechCorp Inc', amount: 7200, category: 'Salary', type: 'income' },
    { date: '2024-05-15', description: 'Salary - TechCorp Inc', amount: 7200, category: 'Salary', type: 'income' },
    { date: '2024-04-15', description: 'Salary - TechCorp Inc', amount: 7200, category: 'Salary', type: 'income' },
    { date: '2024-06-10', description: 'Freelance Project', amount: 1200, category: 'Freelance', type: 'income' },
    { date: '2024-05-20', description: 'Investment Dividend', amount: 450, category: 'Investment', type: 'income' },
    
    // Housing expenses
    { date: '2024-06-01', description: 'Rent Payment', amount: -1850, category: 'Housing', type: 'expense' },
    { date: '2024-05-01', description: 'Rent Payment', amount: -1850, category: 'Housing', type: 'expense' },
    { date: '2024-04-01', description: 'Rent Payment', amount: -1850, category: 'Housing', type: 'expense' },
    { date: '2024-06-15', description: 'Electric Bill', amount: -125, category: 'Utilities', type: 'expense' },
    { date: '2024-06-10', description: 'Internet Bill', amount: -79, category: 'Utilities', type: 'expense' },
    
    // Food & Dining
    { date: '2024-06-20', description: 'Whole Foods', amount: -156, category: 'Groceries', type: 'expense' },
    { date: '2024-06-18', description: 'Starbucks', amount: -12, category: 'Dining', type: 'expense' },
    { date: '2024-06-17', description: 'Pizza Palace', amount: -28, category: 'Dining', type: 'expense' },
    { date: '2024-06-15', description: 'Trader Joes', amount: -89, category: 'Groceries', type: 'expense' },
    { date: '2024-06-14', description: 'Fine Dining Restaurant', amount: -85, category: 'Dining', type: 'expense' },
    
    // Transportation
    { date: '2024-06-19', description: 'Shell Gas Station', amount: -65, category: 'Transportation', type: 'expense' },
    { date: '2024-06-05', description: 'Car Insurance', amount: -145, category: 'Insurance', type: 'expense' },
    { date: '2024-06-12', description: 'Uber Ride', amount: -18, category: 'Transportation', type: 'expense' },
    
    // Entertainment & Shopping
    { date: '2024-06-16', description: 'Amazon Purchase', amount: -67, category: 'Shopping', type: 'expense' },
    { date: '2024-06-13', description: 'Movie Theater', amount: -24, category: 'Entertainment', type: 'expense' },
    { date: '2024-06-11', description: 'Netflix Subscription', amount: -16, category: 'Entertainment', type: 'expense' },
    { date: '2024-06-08', description: 'Gym Membership', amount: -45, category: 'Health', type: 'expense' },
    
    // Healthcare
    { date: '2024-06-07', description: 'Health Insurance', amount: -320, category: 'Insurance', type: 'expense' },
    { date: '2024-06-03', description: 'Doctor Visit', amount: -150, category: 'Healthcare', type: 'expense' },
    
    // More recent transactions for variety
    { date: '2024-06-21', description: 'Target Shopping', amount: -45, category: 'Shopping', type: 'expense' },
    { date: '2024-06-21', description: 'Coffee Shop', amount: -8, category: 'Dining', type: 'expense' },
    { date: '2024-06-20', description: 'Gas Station', amount: -52, category: 'Transportation', type: 'expense' },
    { date: '2024-06-19', description: 'Grocery Store', amount: -78, category: 'Groceries', type: 'expense' },
    { date: '2024-06-18', description: 'Online Shopping', amount: -134, category: 'Shopping', type: 'expense' }
  ]

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: {
        ...transaction,
        date: new Date(transaction.date),
        userId: demoUser.id
      }
    })
  }

  console.log(`✅ Created ${transactions.length} transactions`)

  // Create Bills
  const bills = [
    { name: 'Rent/Mortgage', amount: 1850, dueDate: new Date('2024-07-01'), category: 'Housing', status: 'pending' },
    { name: 'Electric Bill', amount: 125, dueDate: new Date('2024-07-15'), category: 'Utilities', status: 'pending' },
    { name: 'Internet', amount: 79, dueDate: new Date('2024-07-10'), category: 'Utilities', status: 'paid' },
    { name: 'Phone Bill', amount: 95, dueDate: new Date('2024-07-22'), category: 'Utilities', status: 'pending' },
    { name: 'Car Insurance', amount: 145, dueDate: new Date('2024-07-05'), category: 'Insurance', status: 'paid' },
    { name: 'Health Insurance', amount: 320, dueDate: new Date('2024-07-01'), category: 'Insurance', status: 'pending' },
    { name: 'Netflix', amount: 15.99, dueDate: new Date('2024-07-12'), category: 'Entertainment', status: 'paid' },
    { name: 'Spotify', amount: 9.99, dueDate: new Date('2024-07-18'), category: 'Entertainment', status: 'paid' },
    { name: 'Gym Membership', amount: 45, dueDate: new Date('2024-07-03'), category: 'Health', status: 'pending' },
    { name: 'Credit Card Payment', amount: 450, dueDate: new Date('2024-07-25'), category: 'Debt', status: 'pending' }
  ]

  for (const bill of bills) {
    await prisma.bill.create({
      data: {
        ...bill,
        userId: demoUser.id
      }
    })
  }

  console.log(`✅ Created ${bills.length} bills`)

  // Create Goals
  const goals = [
    {
      name: 'Emergency Fund',
      targetAmount: 15000,
      currentAmount: 8500,
      deadline: new Date('2024-12-31'),
      priority: 'high',
      status: 'active'
    },
    {
      name: 'Vacation to Europe',
      targetAmount: 5000,
      currentAmount: 2300,
      deadline: new Date('2024-08-15'),
      priority: 'medium',
      status: 'active'
    },
    {
      name: 'New Car Down Payment',
      targetAmount: 8000,
      currentAmount: 3200,
      deadline: new Date('2025-03-01'),
      priority: 'medium',
      status: 'active'
    },
    {
      name: 'Home Renovation',
      targetAmount: 25000,
      currentAmount: 5800,
      deadline: new Date('2025-06-30'),
      priority: 'low',
      status: 'active'
    },
    {
      name: 'Retirement Boost',
      targetAmount: 50000,
      currentAmount: 12000,
      deadline: new Date('2026-12-31'),
      priority: 'high',
      status: 'active'
    }
  ]

  for (const goal of goals) {
    await prisma.goal.create({
      data: {
        ...goal,
        userId: demoUser.id
      }
    })
  }

  console.log(`✅ Created ${goals.length} goals`)

  // Create Loans
  const loans = [
    {
      name: 'Mortgage',
      balance: 285000,
      interestRate: 3.75,
      monthlyPayment: 1850,
      termYears: 30,
      type: 'mortgage',
      status: 'active'
    },
    {
      name: 'Car Loan',
      balance: 18500,
      interestRate: 4.2,
      monthlyPayment: 425,
      termYears: 5,
      type: 'auto',
      status: 'active'
    },
    {
      name: 'Student Loan',
      balance: 32000,
      interestRate: 5.8,
      monthlyPayment: 350,
      termYears: 10,
      type: 'student',
      status: 'active'
    },
    {
      name: 'Credit Card',
      balance: 4500,
      interestRate: 18.9,
      monthlyPayment: 150,
      termYears: 0,
      type: 'credit_card',
      status: 'active'
    }
  ]

  for (const loan of loans) {
    await prisma.loan.create({
      data: {
        ...loan,
        userId: demoUser.id
      }
    })
  }

  console.log(`✅ Created ${loans.length} loans`)

  // Create Investments
  const investments = [
    {
      name: '401(k) Retirement',
      type: 'retirement',
      currentValue: 45000,
      monthlyContribution: 800,
      performanceYtd: 8.5,
      riskLevel: 'medium',
      status: 'active'
    },
    {
      name: 'Roth IRA',
      type: 'retirement',
      currentValue: 28000,
      monthlyContribution: 500,
      performanceYtd: 7.2,
      riskLevel: 'medium',
      status: 'active'
    },
    {
      name: 'S&P 500 Index Fund',
      type: 'stocks',
      currentValue: 15000,
      monthlyContribution: 300,
      performanceYtd: 12.3,
      riskLevel: 'medium',
      status: 'active'
    },
    {
      name: 'Tech Stocks Portfolio',
      type: 'stocks',
      currentValue: 8500,
      monthlyContribution: 200,
      performanceYtd: 15.7,
      riskLevel: 'high',
      status: 'active'
    },
    {
      name: 'Bond Fund',
      type: 'bonds',
      currentValue: 12000,
      monthlyContribution: 150,
      performanceYtd: 3.8,
      riskLevel: 'low',
      status: 'active'
    },
    {
      name: 'High-Yield Savings',
      type: 'savings',
      currentValue: 8500,
      monthlyContribution: 400,
      performanceYtd: 4.5,
      riskLevel: 'low',
      status: 'active'
    }
  ]

  for (const investment of investments) {
    await prisma.investment.create({
      data: {
        ...investment,
        userId: demoUser.id
      }
    })
  }

  console.log(`✅ Created ${investments.length} investments`)

  // Calculate and log summary
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
  const totalInvestments = investments.reduce((sum, i) => sum + i.currentValue, 0)
  const totalDebt = loans.reduce((sum, l) => sum + l.balance, 0)
  const netWorth = totalInvestments - totalDebt

  console.log('\\n📊 Demo Data Summary:')
  console.log(`💰 Total Income: $${totalIncome.toLocaleString()}`)
  console.log(`💸 Total Expenses: $${totalExpenses.toLocaleString()}`)
  console.log(`📈 Total Investments: $${totalInvestments.toLocaleString()}`)
  console.log(`💳 Total Debt: $${totalDebt.toLocaleString()}`)
  console.log(`🏦 Net Worth: $${netWorth.toLocaleString()}`)
  console.log('\\n🎉 Demo user data created successfully!')
  console.log('\\n🔑 Demo Login Credentials:')
  console.log('Email: demo@finplanner.com')
  console.log('Password: demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
