const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearOldInsights() {
  const demoUserId = 'cmc6o34760000g92xekuyaf2e';
  
  // Delete old insights
  const deleted = await prisma.aIInsight.deleteMany({
    where: { userId: demoUserId }
  });
  
  console.log(`🗑️ Deleted ${deleted.count} old insights`);
  console.log('✅ Now refresh your AI home page to see new insights!');
}

clearOldInsights().then(() => process.exit());
