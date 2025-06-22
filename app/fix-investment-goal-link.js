const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

console.log('🔧 Adding missing user relation to InvestmentGoalLink...');

// Find the InvestmentGoalLink model
const linkModelMatch = schema.match(/(model InvestmentGoalLink \{[\s\S]*?\})/);

if (linkModelMatch) {
  const originalModel = linkModelMatch[0];
  console.log('Original InvestmentGoalLink model:');
  console.log(originalModel);
  
  // Check if user relation exists
  if (!originalModel.includes('user     User')) {
    console.log('❌ Missing user relation - adding it');
    
    // Add user relation after userId field
    let fixedModel = originalModel.replace(
      /userId\s+String/,
      `userId       String
  
  user         User            @relation(fields: [userId], references: [id], onDelete: Cascade)`
    );
    
    console.log('\nFixed InvestmentGoalLink model:');
    console.log(fixedModel);
    
    schema = schema.replace(originalModel, fixedModel);
  } else {
    console.log('✅ User relation already exists');
  }
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('✅ Fixed InvestmentGoalLink relations');
