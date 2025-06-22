const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanupAll() {
  try {
    const userId = 'cmc6oqztx00062u1l8rahni95' // Your demo user ID
    
    console.log('Cleaning up all financial data...')
    
    // Delete all transactions
    const transactions = await prisma.transaction.deleteMany({
      where: { userId }
    })
    console.log(`Deleted ${transactions.count} transactions`)
    
    // Delete all bill instances
    const billInstances = await prisma.billInstance.deleteMany({
      where: { userId }
    })
    console.log(`Deleted ${billInstances.count} bill instances`)
    
    // Delete all loan payments
    const loanPayments = await prisma.loanPayment.deleteMany({
      where: { userId }
    })
    console.log(`Deleted ${loanPayments.count} loan payments`)
    
    // Delete all investment transactions
    const investmentTxns = await prisma.investmentTransaction.deleteMany({
      where: { userId }
    })
    console.log(`Deleted ${investmentTxns.count} investment transactions`)
    
    console.log('Cleanup complete!')
  } catch (error) {
    console.error('Cleanup error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupAll()
