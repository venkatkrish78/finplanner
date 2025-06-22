const fs = require('fs');

// Read the current AI chat route
let content = fs.readFileSync('app/api/ai/chat/route.ts', 'utf8');

// Replace the incorrect net worth calculation
const oldCalculation = `    // Net Worth = Balance + Assets + Investments - Loans
    const netWorth = totalBalance + totalAssets + totalInvestments - totalLoans`;

const newCalculation = `    // Net Worth = Investments - Loans (matching dashboard)
    const netWorth = totalInvestments - totalLoans`;

content = content.replace(oldCalculation, newCalculation);

// Also fix the financial data response to match dashboard
const oldResponse = `      context += \`Net Worth: \${formatIndianCurrency(financialData.netWorth)}\\n\`
      context += \`Balance: \${formatIndianCurrency(financialData.totalBalance)}\\n\`
      context += \`Assets: \${formatIndianCurrency(financialData.totalAssets)}\\n\`
      context += \`Investments: \${formatIndianCurrency(financialData.totalInvestments)}\\n\`
      context += \`Loans: \${formatIndianCurrency(financialData.totalLoans)}\\n\``;

const newResponse = `      context += \`Net Worth: \${formatIndianCurrency(financialData.netWorth)}\\n\`
      context += \`Total Assets (Investments): \${formatIndianCurrency(financialData.totalInvestments)}\\n\`
      context += \`Total Liabilities (Loans): \${formatIndianCurrency(financialData.totalLoans)}\\n\``;

content = content.replace(oldResponse, newResponse);

// Fix the net worth display response
const oldNetWorthResponse = `      response: \`💎 Net Worth: \${formatIndianCurrency(netWorth)}\\n💰 Balance: \${formatIndianCurrency(totalBalance)}\\n🏠 Assets: \${formatIndianCurrency(totalAssets)}\\n📈 Investments: \${formatIndianCurrency(totalInvestments)}\\n💳 Loans: \${formatIndianCurrency(totalLoans)}\`,`;

const newNetWorthResponse = `      response: \`💎 Net Worth: \${formatIndianCurrency(netWorth)}\\n📈 Total Assets: \${formatIndianCurrency(totalInvestments)}\\n💳 Total Liabilities: \${formatIndianCurrency(totalLoans)}\\n\\n(Assets - Liabilities = Net Worth)\`,`;

content = content.replace(oldNetWorthResponse, newNetWorthResponse);

// Write the fixed content back
fs.writeFileSync('app/api/ai/chat/route.ts', content);

console.log('✅ Fixed AI chat net worth calculation to match dashboard!');
console.log('📊 Now both will show: Net Worth = Investments - Loans');
