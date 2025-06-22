const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

console.log('🔧 Fixing duplicate userId in BillInstance...');

// Find the BillInstance model
const billInstanceMatch = schema.match(/(model BillInstance \{[\s\S]*?\})/);

if (billInstanceMatch) {
  const originalModel = billInstanceMatch[0];
  console.log('Original BillInstance model:');
  console.log(originalModel);
  
  // Remove duplicate userId lines
  let fixedModel = originalModel;
  
  // Count how many userId lines there are
  const userIdMatches = originalModel.match(/userId\s+String/g);
  if (userIdMatches && userIdMatches.length > 1) {
    console.log(`Found ${userIdMatches.length} userId fields - removing duplicates`);
    
    // Keep only the first userId and remove others
    let userIdCount = 0;
    fixedModel = originalModel.replace(/userId\s+String/g, (match) => {
      userIdCount++;
      return userIdCount === 1 ? match : '';
    });
    
    // Clean up empty lines
    fixedModel = fixedModel.replace(/\n\s*\n/g, '\n');
  }
  
  console.log('\nFixed BillInstance model:');
  console.log(fixedModel);
  
  schema = schema.replace(originalModel, fixedModel);
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('✅ Fixed duplicate userId in BillInstance');
