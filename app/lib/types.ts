export type Expense = {
  id: string
  amount: number
  category: string
  description: string
  date: Date
}

// Core Prisma Model Types
export type Category = {
  id: string
  name: string
  color: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}

export enum TransactionSource {
  MANUAL = 'MANUAL',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  BANK_STATEMENT = 'BANK_STATEMENT'
}

export type Transaction = {
  id: string
  amount: number
  type: TransactionType
  description?: string
  merchant?: string
  accountNumber?: string
  transactionId?: string
  date: Date
  balance?: number
  status: TransactionStatus
  source: TransactionSource
  rawMessage?: string
  categoryId: string
  category?: Category
  createdAt: Date
  updatedAt: Date
}

export type ExpenseFormData = Omit<Expense, 'id' | 'date'> & {
  date: string
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Other'
] as const

export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

// Bill Management Types
export enum BillFrequency {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  YEARLY = 'YEARLY',
  ONE_TIME = 'ONE_TIME'
}

export enum BillStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export type Bill = {
  id: string
  name: string
  amount: number
  frequency: BillFrequency
  description?: string
  isActive: boolean
  categoryId: string
  category: {
    id: string
    name: string
    color: string
  }
  nextDueDate: Date
  createdAt: Date
  updatedAt: Date
}

export type BillInstance = {
  id: string
  dueDate: Date
  amount: number
  status: BillStatus
  paidDate?: Date
  notes?: string
  billId: string
  bill: {
    id: string
    name: string
    category: {
      id: string
      name: string
      color: string
    }
  }
  transactionId?: string
  createdAt: Date
  updatedAt: Date
}

export type BillFormData = {
  name: string
  amount: number
  frequency: BillFrequency
  description?: string
  categoryId: string
  nextDueDate: string
}

export type BillStats = {
  totalMonthlyBills: number
  paidThisMonth: number
  pendingThisMonth: number
  overdueCount: number
  upcomingWeek: number
}

export type BillAnalytics = {
  monthlySpending: Array<{
    month: string
    amount: number
  }>
  categoryBreakdown: Array<{
    category: string
    amount: number
    color: string
  }>
}

// Financial Goals Types
export enum GoalType {
  SAVINGS = 'SAVINGS',
  DEBT_PAYOFF = 'DEBT_PAYOFF',
  INVESTMENT = 'INVESTMENT',
  EMERGENCY_FUND = 'EMERGENCY_FUND',
  EDUCATION = 'EDUCATION',
  HOUSE = 'HOUSE',
  VACATION = 'VACATION',
  RETIREMENT = 'RETIREMENT',
  OTHER = 'OTHER'
}

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED'
}

export type FinancialGoal = {
  id: string
  name: string
  description?: string
  goalType: GoalType
  targetAmount: number
  currentAmount: number
  targetDate?: Date
  status: GoalStatus
  categoryId?: string
  category?: {
    id: string
    name: string
    color: string
  }
  contributions: GoalContribution[]
  createdAt: Date
  updatedAt: Date
}

export type GoalContribution = {
  id: string
  goalId: string
  amount: number
  note?: string
  transactionId?: string
  createdAt: Date
}

export type GoalFormData = {
  name: string
  description?: string
  goalType: GoalType
  targetAmount: number
  targetDate?: string
  categoryId?: string
}

export type GoalStats = {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  totalTargetAmount: number
  totalCurrentAmount: number
  averageProgress: number
}

// Loan Management Types
export enum LoanType {
  HOME_LOAN = 'HOME_LOAN',
  PERSONAL_LOAN = 'PERSONAL_LOAN',
  CAR_LOAN = 'CAR_LOAN',
  EDUCATION_LOAN = 'EDUCATION_LOAN',
  CREDIT_CARD = 'CREDIT_CARD',
  BUSINESS_LOAN = 'BUSINESS_LOAN',
  GOLD_LOAN = 'GOLD_LOAN',
  OTHER = 'OTHER'
}

export enum LoanPaymentType {
  EMI = 'EMI',
  PREPAYMENT = 'PREPAYMENT',
  PARTIAL_PAYMENT = 'PARTIAL_PAYMENT',
  INTEREST_ONLY = 'INTEREST_ONLY'
}

export type Loan = {
  id: string
  name: string
  loanType: LoanType
  principalAmount: number
  currentBalance: number
  interestRate: number
  emiAmount: number
  tenure: number
  startDate: Date
  endDate?: Date
  description?: string
  categoryId?: string
  category?: {
    id: string
    name: string
    color: string
  }
  payments: LoanPayment[]
  createdAt: Date
  updatedAt: Date
}

export type LoanPayment = {
  id: string
  loanId: string
  amount: number
  paymentType: LoanPaymentType
  principalPaid: number
  interestPaid: number
  note?: string
  transactionId?: string
  paymentDate: Date
  createdAt: Date
}

export type LoanFormData = {
  name: string
  loanType: LoanType
  principalAmount: number
  interestRate: number
  tenure: number
  startDate: string
  description?: string
  categoryId?: string
}

export type LoanStats = {
  totalLoans: number
  totalDebt: number
  monthlyEMI: number
  totalInterestPaid: number
  averageInterestRate: number
}

export type EMICalculation = {
  emi: number
  totalAmount: number
  totalInterest: number
  schedule: Array<{
    month: number
    emi: number
    principal: number
    interest: number
    balance: number
  }>
}

export type GoalCalculation = {
  monthlyRequired: number
  timeToGoal: number
  projectedDate: Date
}

// Investment Management Types
export enum AssetClass {
  STOCKS = 'STOCKS',
  MUTUAL_FUNDS = 'MUTUAL_FUNDS',
  CRYPTO = 'CRYPTO',
  REAL_ESTATE = 'REAL_ESTATE',
  GOLD = 'GOLD',
  BONDS = 'BONDS',
  PPF = 'PPF',
  EPF = 'EPF',
  NSC = 'NSC',
  ELSS = 'ELSS',
  FD = 'FD',
  RD = 'RD',
  ETF = 'ETF',
  OTHER = 'OTHER'
}

export enum InvestmentPlatform {
  ZERODHA = 'ZERODHA',
  GROWW = 'GROWW',
  ANGEL_ONE = 'ANGEL_ONE',
  UPSTOX = 'UPSTOX',
  PAYTM_MONEY = 'PAYTM_MONEY',
  KUVERA = 'KUVERA',
  COIN_DCBBANK = 'COIN_DCBBANK',
  HDFC_SECURITIES = 'HDFC_SECURITIES',
  ICICI_DIRECT = 'ICICI_DIRECT',
  KOTAK_SECURITIES = 'KOTAK_SECURITIES',
  SBI_SECURITIES = 'SBI_SECURITIES',
  BANK_BRANCH = 'BANK_BRANCH',
  POST_OFFICE = 'POST_OFFICE',
  OTHER = 'OTHER'
}

export enum InvestmentTransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  DIVIDEND = 'DIVIDEND',
  BONUS = 'BONUS',
  SPLIT = 'SPLIT',
  SIP_INSTALLMENT = 'SIP_INSTALLMENT',
  INTEREST = 'INTEREST',
  MATURITY = 'MATURITY'
}

export enum SIPStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum SIPFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  WEEKLY = 'WEEKLY',
  YEARLY = 'YEARLY'
}

export type Investment = {
  id: string
  name: string
  symbol?: string
  assetClass: AssetClass
  platform: InvestmentPlatform
  quantity: number
  averagePrice: number
  currentPrice: number
  totalInvested: number
  currentValue: number
  purchaseDate?: Date
  description?: string
  isActive: boolean
  goalId?: string
  goal?: {
    id: string
    name: string
    goalType: GoalType
  }
  categoryId?: string
  category?: {
    id: string
    name: string
    color: string
  }
  transactions: InvestmentTransaction[]
  sips: SIP[]
  createdAt: Date
  updatedAt: Date
}

export type InvestmentTransaction = {
  id: string
  investmentId: string
  type: InvestmentTransactionType
  quantity: number
  price: number
  amount: number
  fees: number
  tax: number
  date: Date
  notes?: string
  transactionId?: string
  createdAt: Date
  updatedAt: Date
}

export type SIP = {
  id: string
  investmentId: string
  investment: {
    id: string
    name: string
    assetClass: AssetClass
  }
  name: string
  amount: number
  frequency: SIPFrequency
  startDate: Date
  endDate?: Date
  nextDate: Date
  status: SIPStatus
  installmentsPaid: number
  totalInstallments?: number
  createdAt: Date
  updatedAt: Date
}

export type InvestmentFormData = {
  name: string
  symbol?: string
  assetClass: AssetClass
  platform: InvestmentPlatform
  quantity: number
  purchasePrice: number
  currentPrice: number
  purchaseDate: string
  description?: string
  goalId?: string
  categoryId?: string
}

export type InvestmentTransactionFormData = {
  type: InvestmentTransactionType
  quantity: number
  price: number
  fees?: number
  tax?: number
  date: string
  notes?: string
}

export type SIPFormData = {
  name: string
  amount: number
  frequency: SIPFrequency
  startDate: string
  endDate?: string
  totalInstallments?: number
}

export type PortfolioStats = {
  totalInvestments: number
  totalInvested: number
  currentValue: number
  totalGainLoss: number
  totalGainLossPercentage: number
  dayGainLoss: number
  dayGainLossPercentage: number
}

export type AssetAllocation = {
  assetClass: AssetClass
  value: number
  percentage: number
  gainLoss: number
  gainLossPercentage: number
}

export type PlatformAllocation = {
  platform: InvestmentPlatform
  value: number
  percentage: number
  investmentCount: number
}

export type InvestmentPerformance = {
  investmentId: string
  name: string
  assetClass: AssetClass
  invested: number
  currentValue: number
  gainLoss: number
  gainLossPercentage: number
  dayChange: number
  dayChangePercentage: number
}

export type PortfolioAnalytics = {
  monthlyPerformance: Array<{
    month: string
    invested: number
    value: number
    gainLoss: number
  }>
  assetAllocation: AssetAllocation[]
  platformAllocation: PlatformAllocation[]
  topPerformers: InvestmentPerformance[]
  worstPerformers: InvestmentPerformance[]
}

export type SIPCalculation = {
  monthlyInvestment: number
  totalInvestment: number
  maturityAmount: number
  totalReturns: number
  schedule: Array<{
    month: number
    investment: number
    value: number
    returns: number
  }>
}

export type InvestmentGrowthCalculation = {
  futureValue: number
  totalReturns: number
  cagr: number
  projectedGrowth: Array<{
    year: number
    value: number
    returns: number
  }>
}