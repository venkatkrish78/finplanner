
# Testing Guidelines for FinPlanner

This document outlines the testing patterns, conventions, and best practices for the FinPlanner application.

## Table of Contents

1. [Testing Stack](#testing-stack)
2. [Test Structure](#test-structure)
3. [Testing Patterns](#testing-patterns)
4. [Component Testing](#component-testing)
5. [API Testing](#api-testing)
6. [Utility Testing](#utility-testing)
7. [Mocking Strategies](#mocking-strategies)
8. [Coverage Requirements](#coverage-requirements)
9. [Running Tests](#running-tests)
10. [Best Practices](#best-practices)

## Testing Stack

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **Jest DOM**: Custom Jest matchers for DOM elements
- **User Event**: Simulating user interactions
- **ts-jest**: TypeScript support for Jest

## Test Structure

Tests are organized in the `app/__tests__/` directory with the following structure:

```
app/__tests__/
├── components/           # Component tests
│   ├── ui/              # UI component tests
│   └── [feature]/       # Feature-specific component tests
├── lib/                 # Utility function tests
├── api/                 # API route tests
└── hooks/               # Custom hook tests
```

## Testing Patterns

### 1. Component Testing Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ComponentName } from '@/components/component-name'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle user interactions', () => {
    const mockHandler = jest.fn()
    render(<ComponentName onClick={mockHandler} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(mockHandler).toHaveBeenCalledTimes(1)
  })
})
```

### 2. API Testing Pattern

```typescript
import { GET } from '@/app/api/route-name/route'
import { NextRequest } from 'next/server'

describe('/api/route-name', () => {
  it('should return data successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/route-name')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('expectedProperty')
  })
})
```

### 3. Utility Testing Pattern

```typescript
import { utilityFunction } from '@/lib/utilities'

describe('utilityFunction', () => {
  it('should process input correctly', () => {
    const result = utilityFunction('input')
    expect(result).toBe('expectedOutput')
  })

  it('should handle edge cases', () => {
    expect(utilityFunction('')).toBe('defaultValue')
    expect(utilityFunction(null)).toBe('defaultValue')
  })
})
```

## Component Testing

### UI Components

- Test rendering with different props
- Test user interactions (clicks, form submissions)
- Test accessibility features
- Test responsive behavior when applicable

### Business Components

- Test data fetching and loading states
- Test error handling
- Test user workflows
- Test integration with external APIs

### Example: Testing a Form Component

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddTransactionDialog } from '@/components/add-transaction-dialog'

describe('AddTransactionDialog', () => {
  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = jest.fn()
    
    render(<AddTransactionDialog onSubmit={mockOnSubmit} />)
    
    await user.type(screen.getByLabelText(/amount/i), '100')
    await user.type(screen.getByLabelText(/description/i), 'Test transaction')
    await user.click(screen.getByRole('button', { name: /save/i }))
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        amount: 100,
        description: 'Test transaction'
      })
    })
  })
})
```

## API Testing

### Testing API Routes

- Mock database operations
- Test successful responses
- Test error handling
- Test input validation
- Test authentication/authorization

### Example: Testing API Route

```typescript
import { POST } from '@/app/api/transactions/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/db', () => ({
  transaction: {
    create: jest.fn(),
  },
}))

describe('/api/transactions POST', () => {
  it('should create transaction successfully', async () => {
    const { transaction } = require('@/lib/db')
    transaction.create.mockResolvedValue({ id: 1, amount: 100 })

    const request = new NextRequest('http://localhost:3000/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ amount: 100, description: 'Test' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('id')
  })
})
```

## Utility Testing

### Testing Pure Functions

- Test with various inputs
- Test edge cases
- Test error conditions
- Test performance for complex operations

### Testing Async Functions

```typescript
describe('async utility function', () => {
  it('should handle async operations', async () => {
    const result = await asyncUtilityFunction('input')
    expect(result).toBe('expectedOutput')
  })

  it('should handle errors', async () => {
    await expect(asyncUtilityFunction('invalid')).rejects.toThrow('Error message')
  })
})
```

## Mocking Strategies

### 1. External Dependencies

```typescript
// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}))

// Mock Prisma client
jest.mock('@/lib/db', () => ({
  transaction: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}))
```

### 2. API Calls

```typescript
// Mock fetch globally
global.fetch = jest.fn()

beforeEach(() => {
  (fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ data: 'mock data' }),
  })
})
```

### 3. Component Dependencies

```typescript
// Mock child components
jest.mock('@/components/complex-chart', () => {
  return function MockChart() {
    return <div data-testid="mock-chart">Chart</div>
  }
})
```

## Coverage Requirements

### Minimum Coverage Thresholds

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Priority Areas for Testing

1. **Critical Business Logic**: Transaction processing, calculations
2. **User Workflows**: Form submissions, data manipulation
3. **API Endpoints**: All CRUD operations
4. **Utility Functions**: Currency formatting, date handling
5. **Error Handling**: Network failures, validation errors

## Running Tests

### Available Commands

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run tests for CI/CD
yarn test:ci

# Debug tests
yarn test:debug
```

### Test Execution

```bash
# Run specific test file
yarn test button.test.tsx

# Run tests matching pattern
yarn test --testNamePattern="should render"

# Run tests for specific directory
yarn test __tests__/components/
```

## Best Practices

### 1. Test Naming

- Use descriptive test names that explain the expected behavior
- Follow the pattern: "should [expected behavior] when [condition]"
- Group related tests using `describe` blocks

### 2. Test Organization

- One test file per component/utility
- Group tests by functionality
- Keep tests focused and atomic

### 3. Assertions

- Use specific matchers (`toBeInTheDocument`, `toHaveClass`)
- Test user-visible behavior, not implementation details
- Avoid testing internal state directly

### 4. Async Testing

- Use `waitFor` for async operations
- Use `findBy` queries for elements that appear asynchronously
- Handle loading states in tests

### 5. Accessibility Testing

- Test with screen readers in mind
- Use semantic queries (`getByRole`, `getByLabelText`)
- Test keyboard navigation

### 6. Performance

- Keep tests fast and focused
- Mock heavy dependencies
- Use `beforeEach` and `afterEach` for setup/cleanup

### 7. Maintenance

- Update tests when functionality changes
- Remove obsolete tests
- Keep mocks up to date with real implementations

## Common Testing Scenarios

### 1. Form Validation

```typescript
it('should show validation errors for invalid input', async () => {
  render(<FormComponent />)
  
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(await screen.findByText(/required field/i)).toBeInTheDocument()
})
```

### 2. Loading States

```typescript
it('should show loading spinner while fetching data', () => {
  render(<DataComponent />)
  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
})
```

### 3. Error Handling

```typescript
it('should display error message when API fails', async () => {
  (fetch as jest.Mock).mockRejectedValue(new Error('API Error'))
  
  render(<DataComponent />)
  
  expect(await screen.findByText(/error occurred/i)).toBeInTheDocument()
})
```

### 4. User Interactions

```typescript
it('should update UI when user interacts', async () => {
  const user = userEvent.setup()
  render(<InteractiveComponent />)
  
  await user.click(screen.getByRole('button'))
  
  expect(screen.getByText(/updated state/i)).toBeInTheDocument()
})
```

## Continuous Integration

Tests are automatically run on:
- Pull requests
- Pushes to main branch
- Before deployments

### CI Requirements

- All tests must pass
- Coverage thresholds must be met
- No console errors or warnings
- TypeScript compilation must succeed

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Accessibility Testing](https://testing-library.com/docs/guide-which-query)

---

For questions or suggestions about testing practices, please refer to the development team or create an issue in the project repository.
