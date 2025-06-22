const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

console.log('🔍 Checking which models actually need userId...');

// Check each model
const models = ['BillInstance', 'SIP', 'InvestmentGoalLink'];

models.forEach(modelName => {
  const modelRegex = new RegExp(`model ${modelName} \\{[\\s\\S]*?\\}`, 'g');
  const modelMatch = schema.match(modelRegex);
  
  if (modelMatch) {
    const modelContent = modelMatch[0];
    if (modelContent.includes('userId')) {
      console.log(`✅ ${modelName} already has userId`);
    } else {
      console.log(`❌ ${modelName} missing userId - will add it`);
      
      if (modelName === 'SIP') {
        // Add userId to SIP model
        const oldSIP = /model SIP \{\s+id\s+String\s+@id @default\(cuid\(\)\)/;
        const newSIP = `model SIP {
  id           String     @id @default(cuid())
  userId       String`;
        schema = schema.replace(oldSIP, newSIP);
        
        // Add user relation if not exists
        if (!modelContent.includes('user     User')) {
          schema = schema.replace(
            /investment   Investment @relation\(fields: \[investmentId\], references: \[id\], onDelete: Cascade\)/,
            `investment   Investment @relation(fields: [investmentId], references: [id], onDelete: Cascade)
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)`
          );
        }
      }
      
      if (modelName === 'InvestmentGoalLink') {
        // Add userId to InvestmentGoalLink
        const oldLink = /model InvestmentGoalLink \{\s+id\s+String\s+@id @default\(cuid\(\)\)/;
        const newLink = `model InvestmentGoalLink {
  id           String  @id @default(cuid())
  userId       String`;
        schema = schema.replace(oldLink, newLink);
        
        // Add user relation if not exists
        if (!modelContent.includes('user     User')) {
          schema = schema.replace(
            /investment   Investment      @relation\(fields: \[investmentId\], references: \[id\], onDelete: Cascade\)/,
            `user         User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  investment   Investment      @relation(fields: [investmentId], references: [id], onDelete: Cascade)`
          );
        }
      }
    }
  }
});

// Add missing User relations
const userModelMatch = schema.match(/(model User \{[\s\S]*?)(  @@map\("users"\)\s*\})/);
if (userModelMatch) {
  const userModelContent = userModelMatch[1];
  const userModelEnd = userModelMatch[2];
  
  let newUserContent = userModelContent;
  let needsUpdate = false;
  
  if (!userModelContent.includes('sips') && !userModelContent.includes('SIP[]')) {
    newUserContent += '  sips                  SIP[]\n';
    needsUpdate = true;
    console.log('➕ Adding sips relation to User');
  }
  
  if (!userModelContent.includes('investmentGoalLinks') && !userModelContent.includes('InvestmentGoalLink[]')) {
    newUserContent += '  investmentGoalLinks   InvestmentGoalLink[]\n';
    needsUpdate = true;
    console.log('➕ Adding investmentGoalLinks relation to User');
  }
  
  if (needsUpdate) {
    schema = schema.replace(userModelMatch[0], newUserContent + userModelEnd);
  }
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('✅ Schema updated successfully!');
