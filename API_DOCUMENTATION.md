
# FinPlanner API Documentation

This comprehensive guide provides detailed documentation for the FinPlanner REST API, including all endpoints, request/response formats, authentication, and usage examples.

## 📋 Table of Contents

- [Overview](#overview)
- [Base URLs](#base-urls)
- [Authentication](#authentication)
- [Request/Response Format](#requestresponse-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Examples](#examples)
- [SDKs and Libraries](#sdks-and-libraries)

## Overview

The FinPlanner API is a RESTful web service that provides programmatic access to all financial management features. Built with Next.js API routes, it offers a clean, consistent interface for managing transactions, bills, goals, loans, and investments.

### API Features
- **RESTful Design**: Standard HTTP methods and status codes
- **JSON Format**: All requests and responses use JSON
- **Comprehensive Coverage**: Access to all FinPlanner features
- **Real-time Data**: Live financial data synchronization
- **Robust Error Handling**: Detailed error messages and codes
- **Pagination Support**: Efficient handling of large datasets
- **Filtering and Sorting**: Advanced query capabilities

## Base URLs

### Development
```
http://localhost:3000/api
```

### Production
```
https://your-domain.com/api
```

### API Versioning
Currently, the API is version 1.0. Future versions will be accessible via:
```
https://your-domain.com/api/v1
https://your-domain.com/api/v2
```

## Authentication

### Session-Based Authentication
The API uses session-based authentication with NextAuth.js. Include session cookies in your requests for authenticated endpoints.

#### Authentication Flow
1. **Login**: Authenticate user and establish session
2. **Session Cookie**: Include session cookie in subsequent requests
3. **Session Validation**: API validates session for each request
4. **Logout**: Destroy session when done

#### Example Authentication
```javascript
// Login request
const response = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

// Subsequent authenticated requests
const data = await fetch('/api/transactions', {
  credentials: 'include', // Include session cookie
});
```

### API Key Authentication (Future)
Future versions will support API key authentication for third-party integrations:
```
Authorization: Bearer YOUR_API_KEY
```

## Request/Response Format

### Request Format
All API requests should include appropriate headers and follow REST conventions.

#### Required Headers
```
Content-Type: application/json
Accept: application/json
```

#### Optional Headers
```
Authorization: Bearer TOKEN (future)
X-Request-ID: unique-request-id
```

### Response Format

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-06-01T12:00:00Z"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details",
    "field": "field_name" // For validation errors
  },
  "timestamp": "2024-06-01T12:00:00Z"
}
```

#### Paginated Response
```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "message": "Data retrieved successfully",
  "timestamp": "2024-06-01T12:00:00Z"
}
```

## Error Handling

### HTTP Status Codes
- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation error
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Error Codes
| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_REQUIRED` | User must be authenticated |
| `AUTHORIZATION_DENIED` | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `DUPLICATE_RESOURCE` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `DATABASE_ERROR` | Database operation failed |
| `EXTERNAL_SERVICE_ERROR` | External service unavailable |

### Example Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": "Amount must be a positive number",
    "field": "amount"
  },
  "timestamp": "2024-06-01T12:00:00Z"
}
```

## Rate Limiting

### Current Limits
- **API Endpoints**: 100 requests per minute per IP
- **Authentication Endpoints**: 10 requests per minute per IP
- **Bulk Operations**: 10 requests per minute per user

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": "Rate limit: 100 requests per minute"
  },
  "timestamp": "2024-06-01T12:00:00Z"
}
```

## API Endpoints

### Categories Management

#### List All Categories
```
GET /api/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_123",
      "name": "Food & Dining",
      "color": "#FF6B6B",
      "isDefault": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Category
```
POST /api/categories
```

**Request Body:**
```json
{
  "name": "Entertainment",
  "color": "#4ECDC4",
  "isDefault": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cat_124",
    "name": "Entertainment",
    "color": "#4ECDC4",
    "isDefault": false,
    "createdAt": "2024-06-01T12:00:00Z",
    "updatedAt": "2024-06-01T12:00:00Z"
  },
  "message": "Category created successfully"
}
```

#### Update Category
```
PUT /api/categories/[id]
```

#### Delete Category
```
DELETE /api/categories/[id]
```

### Transaction Management

#### List Transactions
```
GET /api/transactions
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `type`: Filter by type (`INCOME`, `EXPENSE`, `TRANSFER`)
- `categoryId`: Filter by category ID
- `startDate`: Filter from date (ISO format)
- `endDate`: Filter to date (ISO format)
- `merchant`: Filter by merchant name
- `minAmount`: Minimum amount filter
- `maxAmount`: Maximum amount filter
- `sort`: Sort field (`date`, `amount`, `description`)
- `order`: Sort order (`asc`, `desc`)

**Example Request:**
```
GET /api/transactions?page=1&limit=20&type=EXPENSE&startDate=2024-01-01&endDate=2024-01-31&sort=date&order=desc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "txn_123",
      "amount": 1500.00,
      "type": "EXPENSE",
      "description": "Grocery shopping",
      "merchant": "SuperMart",
      "date": "2024-01-15T10:30:00Z",
      "categoryId": "cat_123",
      "category": {
        "id": "cat_123",
        "name": "Food & Dining",
        "color": "#FF6B6B"
      },
      "status": "SUCCESS",
      "source": "MANUAL",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Create Transaction
```
POST /api/transactions
```

**Request Body:**
```json
{
  "amount": 2500.00,
  "type": "INCOME",
  "description": "Salary payment",
  "merchant": "Company Inc.",
  "date": "2024-06-01T09:00:00Z",
  "categoryId": "cat_salary",
  "accountNumber": "****1234",
  "transactionId": "TXN123456"
}
```

#### Update Transaction
```
PUT /api/transactions/[id]
```

#### Delete Transaction
```
DELETE /api/transactions/[id]
```

#### Get Transaction Statistics
```
GET /api/transactions/stats
```

**Query Parameters:**
- `startDate`: Start date for statistics
- `endDate`: End date for statistics
- `groupBy`: Group by (`day`, `week`, `month`, `year`)

### Bills Management

#### List All Bills
```
GET /api/bills
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "bill_123",
      "name": "Electricity Bill",
      "amount": 1200.00,
      "frequency": "MONTHLY",
      "description": "Monthly electricity bill",
      "isActive": true,
      "nextDueDate": "2024-06-15T00:00:00Z",
      "categoryId": "cat_utilities",
      "category": {
        "id": "cat_utilities",
        "name": "Utilities",
        "color": "#FFD93D"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Bill
```
POST /api/bills
```

**Request Body:**
```json
{
  "name": "Internet Bill",
  "amount": 999.00,
  "frequency": "MONTHLY",
  "description": "Monthly internet subscription",
  "categoryId": "cat_utilities",
  "nextDueDate": "2024-06-10T00:00:00Z"
}
```

#### Get Upcoming Bills
```
GET /api/bills/upcoming
```

**Query Parameters:**
- `days`: Number of days to look ahead (default: 7)

#### Mark Bill as Paid
```
POST /api/bills/[id]/pay
```

**Request Body:**
```json
{
  "paidDate": "2024-06-01T12:00:00Z",
  "amount": 1200.00,
  "notes": "Paid online"
}
```

### Financial Goals

#### List All Goals
```
GET /api/goals
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "goal_123",
      "name": "Emergency Fund",
      "description": "6 months of expenses",
      "goalType": "EMERGENCY_FUND",
      "targetAmount": 100000.00,
      "currentAmount": 25000.00,
      "targetDate": "2024-12-31T00:00:00Z",
      "status": "ACTIVE",
      "categoryId": "cat_savings",
      "category": {
        "id": "cat_savings",
        "name": "Savings",
        "color": "#4ECDC4"
      },
      "progress": 25.0,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-06-01T00:00:00Z"
    }
  ]
}
```

#### Create Goal
```
POST /api/goals
```

**Request Body:**
```json
{
  "name": "Vacation Fund",
  "description": "Trip to Europe",
  "goalType": "VACATION",
  "targetAmount": 150000.00,
  "targetDate": "2024-12-31T00:00:00Z",
  "categoryId": "cat_travel"
}
```

#### Add Goal Contribution
```
POST /api/goals/[id]/contribute
```

**Request Body:**
```json
{
  "amount": 5000.00,
  "note": "Monthly contribution",
  "transactionId": "txn_456" // Optional: link to existing transaction
}
```

### Loan Management

#### List All Loans
```
GET /api/loans
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "loan_123",
      "name": "Home Loan",
      "loanType": "HOME_LOAN",
      "principalAmount": 2500000.00,
      "currentBalance": 2100000.00,
      "interestRate": 8.5,
      "emiAmount": 25000.00,
      "tenure": 240,
      "startDate": "2023-01-01T00:00:00Z",
      "endDate": "2043-01-01T00:00:00Z",
      "categoryId": "cat_loans",
      "category": {
        "id": "cat_loans",
        "name": "Loans",
        "color": "#FF6B6B"
      },
      "remainingTenure": 220,
      "totalInterest": 3500000.00,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2024-06-01T00:00:00Z"
    }
  ]
}
```

#### Create Loan
```
POST /api/loans
```

**Request Body:**
```json
{
  "name": "Car Loan",
  "loanType": "CAR_LOAN",
  "principalAmount": 800000.00,
  "currentBalance": 800000.00,
  "interestRate": 9.5,
  "emiAmount": 15000.00,
  "tenure": 60,
  "startDate": "2024-06-01T00:00:00Z",
  "categoryId": "cat_loans",
  "description": "Honda City loan"
}
```

#### Record Loan Payment
```
POST /api/loans/[id]/payment
```

**Request Body:**
```json
{
  "amount": 15000.00,
  "paymentType": "EMI",
  "principalPaid": 8000.00,
  "interestPaid": 7000.00,
  "paymentDate": "2024-06-01T00:00:00Z",
  "note": "Monthly EMI payment"
}
```

### Investment Portfolio

#### List All Investments
```
GET /api/investments
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "inv_123",
      "name": "HDFC Top 100 Fund",
      "symbol": "HDFC_TOP_100",
      "assetClass": "MUTUAL_FUNDS",
      "platform": "GROWW",
      "quantity": 1000.00,
      "averagePrice": 45.50,
      "currentPrice": 52.30,
      "totalInvested": 45500.00,
      "currentValue": 52300.00,
      "gainLoss": 6800.00,
      "gainLossPercentage": 14.95,
      "purchaseDate": "2023-06-01T00:00:00Z",
      "isActive": true,
      "goalId": "goal_123",
      "categoryId": "cat_investments",
      "createdAt": "2023-06-01T00:00:00Z",
      "updatedAt": "2024-06-01T00:00:00Z"
    }
  ]
}
```

#### Create Investment
```
POST /api/investments
```

**Request Body:**
```json
{
  "name": "Reliance Industries",
  "symbol": "RELIANCE",
  "assetClass": "STOCKS",
  "platform": "ZERODHA",
  "quantity": 50.00,
  "averagePrice": 2450.00,
  "currentPrice": 2650.00,
  "purchaseDate": "2024-06-01T00:00:00Z",
  "goalId": "goal_investment",
  "categoryId": "cat_investments"
}
```

#### Get Portfolio Summary
```
GET /api/investments/portfolio
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalInvested": 500000.00,
    "currentValue": 575000.00,
    "totalGainLoss": 75000.00,
    "gainLossPercentage": 15.0,
    "assetAllocation": [
      {
        "assetClass": "STOCKS",
        "value": 300000.00,
        "percentage": 52.17
      },
      {
        "assetClass": "MUTUAL_FUNDS",
        "value": 275000.00,
        "percentage": 47.83
      }
    ],
    "topPerformers": [
      {
        "id": "inv_123",
        "name": "HDFC Top 100 Fund",
        "gainLossPercentage": 25.5
      }
    ],
    "recentTransactions": []
  }
}
```

#### Setup SIP
```
POST /api/investments/[id]/sip
```

**Request Body:**
```json
{
  "name": "Monthly SIP - HDFC Top 100",
  "amount": 5000.00,
  "frequency": "MONTHLY",
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2025-06-01T00:00:00Z",
  "totalInstallments": 12
}
```

### Dashboard Analytics

#### Get Dashboard Overview
```
GET /api/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "financialOverview": {
      "totalIncome": 150000.00,
      "totalExpenses": 85000.00,
      "netSavings": 65000.00,
      "savingsRate": 43.33,
      "netWorth": 1250000.00
    },
    "recentTransactions": [],
    "upcomingBills": [],
    "goalProgress": [],
    "investmentSummary": {
      "totalValue": 575000.00,
      "totalGainLoss": 75000.00,
      "gainLossPercentage": 15.0
    },
    "loanSummary": {
      "totalOutstanding": 2100000.00,
      "monthlyEMI": 40000.00,
      "nextPaymentDate": "2024-06-15T00:00:00Z"
    }
  }
}
```

#### Get Chart Data
```
GET /api/dashboard/charts
```

**Query Parameters:**
- `type`: Chart type (`expense`, `income`, `networth`, `goals`)
- `period`: Time period (`week`, `month`, `quarter`, `year`)
- `startDate`: Start date for custom period
- `endDate`: End date for custom period

#### Get Financial Statistics
```
GET /api/dashboard/stats
```

**Query Parameters:**
- `period`: Statistics period (`month`, `quarter`, `year`)
- `compare`: Compare with previous period (`true`, `false`)

### Health Check

#### Application Health
```
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-06-01T12:00:00Z",
    "version": "2.0.0",
    "uptime": 86400,
    "database": "connected",
    "services": {
      "api": "operational",
      "database": "operational",
      "cache": "operational"
    }
  }
}
```

## Data Models

### Category Model
```typescript
interface Category {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Transaction Model
```typescript
interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  description?: string;
  merchant?: string;
  accountNumber?: string;
  transactionId?: string;
  date: string;
  balance?: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  source: 'MANUAL' | 'SMS' | 'EMAIL' | 'BANK_STATEMENT';
  rawMessage?: string;
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}
```

### Bill Model
```typescript
interface Bill {
  id: string;
  name: string;
  amount: number;
  frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY' | 'ONE_TIME';
  description?: string;
  isActive: boolean;
  nextDueDate: string;
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}
```

### Financial Goal Model
```typescript
interface FinancialGoal {
  id: string;
  name: string;
  description?: string;
  goalType: 'SAVINGS' | 'DEBT_PAYOFF' | 'INVESTMENT' | 'EMERGENCY_FUND' | 'EDUCATION' | 'HOUSE' | 'VACATION' | 'RETIREMENT' | 'OTHER';
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  categoryId?: string;
  category?: Category;
  progress: number;
  createdAt: string;
  updatedAt: string;
}
```

### Loan Model
```typescript
interface Loan {
  id: string;
  name: string;
  loanType: 'HOME_LOAN' | 'PERSONAL_LOAN' | 'CAR_LOAN' | 'EDUCATION_LOAN' | 'CREDIT_CARD' | 'BUSINESS_LOAN' | 'GOLD_LOAN' | 'OTHER';
  principalAmount: number;
  currentBalance: number;
  interestRate: number;
  emiAmount: number;
  tenure: number;
  startDate: string;
  endDate?: string;
  description?: string;
  categoryId?: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}
```

### Investment Model
```typescript
interface Investment {
  id: string;
  name: string;
  symbol?: string;
  assetClass: 'STOCKS' | 'MUTUAL_FUNDS' | 'CRYPTO' | 'REAL_ESTATE' | 'GOLD' | 'BONDS' | 'PPF' | 'EPF' | 'NSC' | 'ELSS' | 'FD' | 'RD' | 'ETF' | 'OTHER';
  platform: 'ZERODHA' | 'GROWW' | 'ANGEL_ONE' | 'UPSTOX' | 'PAYTM_MONEY' | 'KUVERA' | 'OTHER';
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  purchaseDate?: string;
  isActive: boolean;
  goalId?: string;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Examples

### Complete Transaction Workflow

#### 1. Create a Transaction
```javascript
const createTransaction = async () => {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      amount: 1500.00,
      type: 'EXPENSE',
      description: 'Grocery shopping',
      merchant: 'SuperMart',
      date: new Date().toISOString(),
      categoryId: 'cat_food'
    })
  });
  
  const result = await response.json();
  console.log('Transaction created:', result.data);
  return result.data;
};
```

#### 2. Get Transactions with Filtering
```javascript
const getTransactions = async (filters = {}) => {
  const params = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 10,
    ...(filters.type && { type: filters.type }),
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    sort: filters.sort || 'date',
    order: filters.order || 'desc'
  });
  
  const response = await fetch(`/api/transactions?${params}`, {
    credentials: 'include'
  });
  
  const result = await response.json();
  return result;
};

// Usage
const expenseTransactions = await getTransactions({
  type: 'EXPENSE',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  page: 1,
  limit: 20
});
```

#### 3. Update Transaction
```javascript
const updateTransaction = async (id, updates) => {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updates)
  });
  
  const result = await response.json();
  return result.data;
};
```

### Goal Management Workflow

#### 1. Create a Financial Goal
```javascript
const createGoal = async () => {
  const response = await fetch('/api/goals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      name: 'Emergency Fund',
      description: '6 months of expenses',
      goalType: 'EMERGENCY_FUND',
      targetAmount: 300000.00,
      targetDate: '2024-12-31T00:00:00Z',
      categoryId: 'cat_savings'
    })
  });
  
  const result = await response.json();
  return result.data;
};
```

#### 2. Add Goal Contribution
```javascript
const addContribution = async (goalId, amount, note) => {
  const response = await fetch(`/api/goals/${goalId}/contribute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      amount: amount,
      note: note
    })
  });
  
  const result = await response.json();
  return result.data;
};
```

### Investment Portfolio Management

#### 1. Add Investment
```javascript
const addInvestment = async () => {
  const response = await fetch('/api/investments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      name: 'HDFC Top 100 Fund',
      symbol: 'HDFC_TOP_100',
      assetClass: 'MUTUAL_FUNDS',
      platform: 'GROWW',
      quantity: 1000.00,
      averagePrice: 45.50,
      currentPrice: 52.30,
      purchaseDate: '2023-06-01T00:00:00Z',
      goalId: 'goal_retirement',
      categoryId: 'cat_investments'
    })
  });
  
  const result = await response.json();
  return result.data;
};
```

#### 2. Get Portfolio Summary
```javascript
const getPortfolioSummary = async () => {
  const response = await fetch('/api/investments/portfolio', {
    credentials: 'include'
  });
  
  const result = await response.json();
  return result.data;
};
```

### Error Handling Example

```javascript
const handleApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error('API Error:', error.message);
    
    // Handle specific error types
    if (error.message.includes('VALIDATION_ERROR')) {
      // Handle validation errors
      alert('Please check your input data');
    } else if (error.message.includes('AUTHENTICATION_REQUIRED')) {
      // Handle authentication errors
      window.location.href = '/login';
    } else {
      // Handle general errors
      alert('An error occurred. Please try again.');
    }
    
    throw error;
  }
};
```

## SDKs and Libraries

### JavaScript/TypeScript SDK (Planned)
```javascript
import { FinPlannerAPI } from '@finplanner/sdk';

const api = new FinPlannerAPI({
  baseUrl: 'https://your-domain.com/api',
  apiKey: 'your-api-key' // Future feature
});

// Usage
const transactions = await api.transactions.list({
  type: 'EXPENSE',
  limit: 20
});

const newTransaction = await api.transactions.create({
  amount: 1500.00,
  type: 'EXPENSE',
  description: 'Grocery shopping'
});
```

### Python SDK (Planned)
```python
from finplanner import FinPlannerAPI

api = FinPlannerAPI(
    base_url='https://your-domain.com/api',
    api_key='your-api-key'
)

# Usage
transactions = api.transactions.list(type='EXPENSE', limit=20)
new_transaction = api.transactions.create(
    amount=1500.00,
    type='EXPENSE',
    description='Grocery shopping'
)
```

### React Hooks (Available)
```javascript
import { useTransactions, useGoals, useInvestments } from '@/hooks/api';

function TransactionList() {
  const { data: transactions, loading, error } = useTransactions({
    type: 'EXPENSE',
    limit: 20
  });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {transactions.map(transaction => (
        <div key={transaction.id}>{transaction.description}</div>
      ))}
    </div>
  );
}
```

## Best Practices

### API Usage Guidelines

#### 1. Authentication
- Always include session cookies for authenticated requests
- Handle authentication errors gracefully
- Implement proper logout functionality

#### 2. Error Handling
- Check response status codes
- Parse error responses properly
- Implement retry logic for transient errors
- Show user-friendly error messages

#### 3. Performance
- Use pagination for large datasets
- Implement client-side caching where appropriate
- Avoid unnecessary API calls
- Use appropriate query parameters for filtering

#### 4. Data Validation
- Validate data on the client side before sending
- Handle validation errors from the server
- Provide clear feedback for validation failures

#### 5. Security
- Never expose sensitive data in URLs
- Use HTTPS for all API calls
- Implement proper CORS handling
- Validate and sanitize all inputs

### Example Implementation

```javascript
class FinPlannerAPIClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  
  // Transaction methods
  async getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/transactions?${query}`);
  }
  
  async createTransaction(data) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  // Goal methods
  async getGoals() {
    return this.request('/goals');
  }
  
  async createGoal(data) {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

// Usage
const api = new FinPlannerAPIClient('/api');

// Get transactions
const transactions = await api.getTransactions({
  type: 'EXPENSE',
  limit: 20
});

// Create transaction
const newTransaction = await api.createTransaction({
  amount: 1500.00,
  type: 'EXPENSE',
  description: 'Grocery shopping',
  categoryId: 'cat_food'
});
```

---

This API documentation provides comprehensive coverage of all FinPlanner API endpoints and usage patterns. For additional support or questions, please refer to the main documentation or contact the development team.

**Happy coding with FinPlanner API!** 🚀
