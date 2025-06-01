
// Default categories for Indian spending patterns

export interface CategoryData {
  name: string;
  color: string;
  isDefault: boolean;
}

export const defaultCategories: CategoryData[] = [
  { name: 'Food & Dining', color: '#EF4444', isDefault: true },
  { name: 'Transportation', color: '#3B82F6', isDefault: true },
  { name: 'Bills & Utilities', color: '#F59E0B', isDefault: true },
  { name: 'Entertainment', color: '#8B5CF6', isDefault: true },
  { name: 'Shopping', color: '#EC4899', isDefault: true },
  { name: 'Healthcare', color: '#10B981', isDefault: true },
  { name: 'Education', color: '#6366F1', isDefault: true },
  { name: 'Investment', color: '#059669', isDefault: true },
  { name: 'Groceries', color: '#84CC16', isDefault: true },
  { name: 'Fuel', color: '#F97316', isDefault: true },
  { name: 'Insurance', color: '#0EA5E9', isDefault: true },
  { name: 'Salary', color: '#22C55E', isDefault: true },
  { name: 'Business', color: '#A855F7', isDefault: true },
  // Bill-specific categories
  { name: 'Rent', color: '#DC2626', isDefault: true },
  { name: 'Electricity', color: '#FBBF24', isDefault: true },
  { name: 'Water', color: '#06B6D4', isDefault: true },
  { name: 'Gas', color: '#F97316', isDefault: true },
  { name: 'Internet & Phone', color: '#8B5CF6', isDefault: true },
  { name: 'Subscriptions', color: '#EC4899', isDefault: true },
  { name: 'Loan EMI', color: '#EF4444', isDefault: true },
  { name: 'Credit Card', color: '#6366F1', isDefault: true },
  { name: 'Maintenance', color: '#64748B', isDefault: true },
  { name: 'Savings', color: '#10B981', isDefault: true },
  { name: 'Loan Payment', color: '#EF4444', isDefault: true },
  { name: 'Goal Contribution', color: '#3B82F6', isDefault: true },
  // Investment-specific categories
  { name: 'Stock Investment', color: '#059669', isDefault: true },
  { name: 'Mutual Fund', color: '#0D9488', isDefault: true },
  { name: 'SIP Investment', color: '#0891B2', isDefault: true },
  { name: 'Crypto Investment', color: '#7C3AED', isDefault: true },
  { name: 'Gold Investment', color: '#D97706', isDefault: true },
  { name: 'Real Estate', color: '#DC2626', isDefault: true },
  { name: 'PPF/EPF', color: '#16A34A', isDefault: true },
  { name: 'Fixed Deposit', color: '#2563EB', isDefault: true },
  { name: 'Investment Dividend', color: '#059669', isDefault: true },
  { name: 'Investment Sale', color: '#DC2626', isDefault: true },
  { name: 'Brokerage Fees', color: '#6B7280', isDefault: true },
  { name: 'Others', color: '#6B7280', isDefault: true }
];

export function getCategoryColor(categoryName: string): string {
  const category = defaultCategories.find(cat => cat.name === categoryName);
  return category?.color || '#6B7280';
}

export function suggestCategory(description: string, merchant?: string): string {
  const text = (description + ' ' + (merchant || '')).toLowerCase();
  
  // Food & Dining keywords
  if (text.includes('restaurant') || text.includes('food') || text.includes('cafe') || 
      text.includes('zomato') || text.includes('swiggy') || text.includes('dominos') ||
      text.includes('mcdonald') || text.includes('kfc') || text.includes('pizza')) {
    return 'Food & Dining';
  }
  
  // Transportation keywords
  if (text.includes('uber') || text.includes('ola') || text.includes('metro') ||
      text.includes('bus') || text.includes('taxi') || text.includes('auto') ||
      text.includes('petrol') || text.includes('diesel') || text.includes('fuel')) {
    return 'Transportation';
  }
  
  // Bills & Utilities keywords
  if (text.includes('electricity') || text.includes('water') || text.includes('gas') ||
      text.includes('internet') || text.includes('broadband') || text.includes('mobile') ||
      text.includes('recharge') || text.includes('bill') || text.includes('utility')) {
    return 'Bills & Utilities';
  }
  
  // Entertainment keywords
  if (text.includes('movie') || text.includes('netflix') || text.includes('amazon prime') ||
      text.includes('hotstar') || text.includes('spotify') || text.includes('game') ||
      text.includes('entertainment') || text.includes('cinema')) {
    return 'Entertainment';
  }
  
  // Shopping keywords
  if (text.includes('amazon') || text.includes('flipkart') || text.includes('myntra') ||
      text.includes('shopping') || text.includes('mall') || text.includes('store') ||
      text.includes('purchase') || text.includes('buy')) {
    return 'Shopping';
  }
  
  // Healthcare keywords
  if (text.includes('hospital') || text.includes('doctor') || text.includes('medical') ||
      text.includes('pharmacy') || text.includes('medicine') || text.includes('health') ||
      text.includes('clinic') || text.includes('apollo') || text.includes('fortis')) {
    return 'Healthcare';
  }
  
  // Groceries keywords
  if (text.includes('grocery') || text.includes('supermarket') || text.includes('bigbasket') ||
      text.includes('grofers') || text.includes('vegetables') || text.includes('fruits') ||
      text.includes('milk') || text.includes('bread')) {
    return 'Groceries';
  }
  
  // Investment keywords
  if (text.includes('mutual fund') || text.includes('mf') || text.includes('sip')) {
    return 'Mutual Fund';
  }
  
  if (text.includes('stock') || text.includes('equity') || text.includes('share') ||
      text.includes('nse') || text.includes('bse')) {
    return 'Stock Investment';
  }
  
  if (text.includes('crypto') || text.includes('bitcoin') || text.includes('ethereum') ||
      text.includes('binance') || text.includes('wazirx')) {
    return 'Crypto Investment';
  }
  
  if (text.includes('gold') || text.includes('silver') || text.includes('precious metal')) {
    return 'Gold Investment';
  }
  
  if (text.includes('ppf') || text.includes('epf') || text.includes('provident fund')) {
    return 'PPF/EPF';
  }
  
  if (text.includes('fd') || text.includes('fixed deposit') || text.includes('rd') ||
      text.includes('recurring deposit')) {
    return 'Fixed Deposit';
  }
  
  if (text.includes('dividend') || text.includes('interest earned')) {
    return 'Investment Dividend';
  }
  
  if (text.includes('brokerage') || text.includes('commission') || text.includes('charges')) {
    return 'Brokerage Fees';
  }
  
  if (text.includes('investment') || text.includes('zerodha') || text.includes('groww') ||
      text.includes('upstox') || text.includes('angel one') || text.includes('kuvera')) {
    return 'Investment';
  }
  
  // Salary keywords
  if (text.includes('salary') || text.includes('credited') || text.includes('income') ||
      text.includes('bonus') || text.includes('allowance')) {
    return 'Salary';
  }
  
  return 'Others';
}
