
// Basic test to verify Jest is working
describe('Basic functionality', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    expect('hello'.toUpperCase()).toBe('HELLO')
  })

  it('should handle array operations', () => {
    const arr = [1, 2, 3]
    expect(arr.length).toBe(3)
    expect(arr.includes(2)).toBe(true)
  })

  it('should handle object operations', () => {
    const obj = { name: 'test', value: 42 }
    expect(obj.name).toBe('test')
    expect(obj.value).toBe(42)
  })
})

// Test currency formatting without imports
describe('Currency formatting (basic)', () => {
  function formatCurrencyBasic(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  it('should format currency correctly', () => {
    expect(formatCurrencyBasic(1000)).toMatch(/₹/)
    expect(formatCurrencyBasic(0)).toMatch(/₹/)
  })

  it('should handle negative amounts', () => {
    expect(formatCurrencyBasic(-1000)).toMatch(/-₹/)
  })
})

// Test date formatting without imports
describe('Date formatting (basic)', () => {
  function formatDateBasic(date) {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  it('should format dates correctly', () => {
    const date = new Date('2024-01-15')
    const formatted = formatDateBasic(date)
    expect(formatted).toMatch(/15/)
    expect(formatted).toMatch(/01/)
    expect(formatted).toMatch(/2024/)
  })
})
