const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugInvestments() {
  try {
    const demoUser = await prisma.user.findFirst({
      where: { email: 'demo@finplanner.com' }
    });
    
    if (!demoUser) {
      console.log('Demo user not found');
      return;
    }
    
    console.log('=== DEBUGGING AI CHAT INVESTMENTS ===');
    
    // Check what AI chat is fetching (only 10 records)
    const aiChatInvestments = await prisma.investment.findMany({
      where: { userId: demoUser.id },
      orderBy: { updatedAt: 'desc' },
      take: 10  // AI chat only takes 10!
    });
    
    console.log('\n🤖 AI Chat fetches (take: 10):');
    let aiTotal = 0;
    aiChatInvestments.forEach(inv => {
      console.log(`- ${inv.name}: ₹${inv.currentValue.toLocaleString()}`);
      aiTotal += inv.currentValue;
    });
    console.log(`AI Chat Total: ₹${aiTotal.toLocaleString()}`);
    
    // Check all investments (what dashboard uses)
    const allInvestments = await prisma.investment.findMany({
      where: { userId: demoUser.id }
    });
    
    console.log('\n📊 Dashboard fetches (all):');
    let dashboardTotal = 0;
    allInvestments.forEach(inv => {
      console.log(`- ${inv.name}: ₹${inv.currentValue.toLocaleString()}`);
      dashboardTotal += inv.currentValue;
    });
    console.log(`Dashboard Total: ₹${dashboardTotal.toLocaleString()}`);
    
    console.log('\n🔍 ISSUE FOUND:');
    console.log(`AI Chat only fetches ${aiChatInvestments.length} investments`);
    console.log(`Dashboard fetches all ${allInvestments.length} investments`);
    console.log(`Missing: ₹${(dashboardTotal - aiTotal).toLocaleString()}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugInvestments();
