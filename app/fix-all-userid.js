const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

console.log('🔧 Adding userId to models...');

// 1. Add userId to BillInstance
const oldBillInstance = `model BillInstance {
  id       String     @id @default(cuid())
  dueDate  DateTime
  amount   Float
  status   BillStatus @default(PENDING)
  paidDate DateTime?`;

const newBillInstance = `model BillInstance {
  id       String     @id @default(cuid())
  userId   String
  dueDate  DateTime
  amount   Float
  status   BillStatus @default(PENDING)
  paidDate DateTime?`;

schema = schema.replace(oldBillInstance, newBillInstance);

// Add user relation to BillInstance
schema = schema.replace(
  /billId   String\s+bill     Bill/,
  `billId   String
  bill     Bill      @relation(fields: [billId], references: [id], onDelete: Cascade)
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)`
);

// 2. Add userId to SIP
const oldSIP = `model SIP {
  id           String     @id @default(cuid())
  investmentId String
  investment   Investment @relation(fields: [investmentId], references: [id], onDelete: Cascade)

  name              String`;

const newSIP = `model SIP {
  id           String     @id @default(cuid())
  userId       String
  investmentId String
  investment   Investment @relation(fields: [investmentId], references: [id], onDelete: Cascade)
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  name              String`;

schema = schema.replace(oldSIP, newSIP);

// 3. Add userId to InvestmentGoalLink
const oldInvestmentGoalLink = `model InvestmentGoalLink {
  id           String  @id @default(cuid())
  investmentId String
  goalId       String
  allocation   Float   @default(100) // Percentage allocation of investment to this goal
  notes        String?`;

const newInvestmentGoalLink = `model InvestmentGoalLink {
  id           String  @id @default(cuid())
  userId       String
  investmentId String
  goalId       String
  allocation   Float   @default(100) // Percentage allocation of investment to this goal
  notes        String?`;

schema = schema.replace(oldInvestmentGoalLink, newInvestmentGoalLink);

// Add user relation to InvestmentGoalLink
schema = schema.replace(
  /investment   Investment      @relation\(fields: \[investmentId\], references: \[id\], onDelete: Cascade\)\s+goal         FinancialGoal   @relation\(fields: \[goalId\], references: \[id\], onDelete: Cascade\)/,
  `user         User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  investment   Investment      @relation(fields: [investmentId], references: [id], onDelete: Cascade)
  goal         FinancialGoal   @relation(fields: [goalId], references: [id], onDelete: Cascade)`
);

// 4. Add relations to User model
const userModelMatch = schema.match(/(model User \{[\s\S]*?)(  @@map\("users"\)\s*\})/);
if (userModelMatch) {
  const userModelContent = userModelMatch[1];
  const userModelEnd = userModelMatch[2];
  
  let newUserContent = userModelContent;
  
  // Add missing relations
  if (!userModelContent.includes('billInstances')) {
    newUserContent += '  billInstances         BillInstance[]\n';
  }
  if (!userModelContent.includes('sips')) {
    newUserContent += '  sips                  SIP[]\n';
  }
  if (!userModelContent.includes('investmentGoalLinks')) {
    newUserContent += '  investmentGoalLinks   InvestmentGoalLink[]\n';
  }
  
  schema = schema.replace(userModelMatch[0], newUserContent + userModelEnd);
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('✅ Added userId to all models!');
console.log('📋 Updated models: BillInstance, SIP, InvestmentGoalLink');
console.log('🔗 Added User relations for all models');
