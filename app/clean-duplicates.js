const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDuplicates() {
  try {
    const demoUser = await prisma.user.findFirst({
      where: { email: 'demo@finplanner.com' }
    });
    
    if (!demoUser) {
      console.log('Demo user not found');
      return;
    }
    
    console.log('🧹 Cleaning duplicate investments...');
    
    // Get all investments grouped by name
    const investments = await prisma.investment.findMany({
      where: { userId: demoUser.id },
      orderBy: { createdAt: 'asc' } // Keep the first one
    });
    
    const seen = new Set();
    const toDelete = [];
    
    investments.forEach(inv => {
      if (seen.has(inv.name)) {
        toDelete.push(inv.id);
        console.log(`🗑️ Marking duplicate: ${inv.name} (₹${inv.currentValue.toLocaleString()})`);
      } else {
        seen.add(inv.name);
        console.log(`✅ Keeping: ${inv.name} (₹${inv.currentValue.toLocaleString()})`);
      }
    });
    
    // Delete duplicates
    if (toDelete.length > 0) {
      await prisma.investment.deleteMany({
        where: { id: { in: toDelete } }
      });
      console.log(`\n🎉 Deleted ${toDelete.length} duplicate investments!`);
    }
    
    // Calculate final total
    const finalInvestments = await prisma.investment.aggregate({
      where: { userId: demoUser.id },
      _sum: { currentValue: true }
    });
    
    const loans = await prisma.loan.aggregate({
      where: { userId: demoUser.id },
      _sum: { currentBalance: true }
    });
    
    const totalAssets = finalInvestments._sum.currentValue || 0;
    const totalLiabilities = loans._sum.currentBalance || 0;
    const netWorth = totalAssets - totalLiabilities;
    
    console.log('\n📊 FINAL CLEAN TOTALS:');
    console.log(`Total Assets: ₹${totalAssets.toLocaleString()}`);
    console.log(`Total Liabilities: ₹${totalLiabilities.toLocaleString()}`);
    console.log(`Net Worth: ₹${netWorth.toLocaleString()}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDuplicates();
