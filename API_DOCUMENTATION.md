
# FinPlanner API Documentation

This document provides an overview of the FinPlanner REST API endpoints.

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication
Currently, the API uses session-based authentication. All endpoints require proper authentication except for health checks.

## API Endpoints

### Categories
Manage expense and income categories.

#### GET /api/categories
Get all categories.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "color": "string",
    "isDefault": boolean,
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

#### POST /api/categories
Create a new category.

**Request Body:**
```json
{
  "name": "string",
  "color": "string",
  "isDefault": boolean
}
```

#### PUT /api/categories/[id]
Update a category.

#### DELETE /api/categories/[id]
Delete a category.

### Transactions
Manage income and expense transactions.

#### GET /api/transactions
Get all transactions with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `type`: Filter by transaction type (INCOME, EXPENSE, TRANSFER)
- `categoryId`: Filter by category
- `startDate`: Filter from date
- `endDate`: Filter to date

**Response:**
```json
{
  "transactions": [
    {
      "id": "string",
      "amount": number,
      "type": "INCOME|EXPENSE|TRANSFER",
      "description": "string",
      "merchant": "string",
      "date": "datetime",
      "categoryId": "string",
      "category": {
        "id": "string",
        "name": "string",
        "color": "string"
      }
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

#### POST /api/transactions
Create a new transaction.

**Request Body:**
```json
{
  "amount": number,
  "type": "INCOME|EXPENSE|TRANSFER",
  "description": "string",
  "merchant": "string",
  "date": "datetime",
  "categoryId": "string"
}
```

#### PUT /api/transactions/[id]
Update a transaction.

#### DELETE /api/transactions/[id]
Delete a transaction.

### Bills
Manage recurring bills and payments.

#### GET /api/bills
Get all bills.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "amount": number,
    "frequency": "WEEKLY|MONTHLY|QUARTERLY|HALF_YEARLY|YEARLY",
    "description": "string",
    "isActive": boolean,
    "nextDueDate": "datetime",
    "categoryId": "string",
    "category": {
      "name": "string",
      "color": "string"
    }
  }
]
```

#### POST /api/bills
Create a new bill.

**Request Body:**
```json
{
  "name": "string",
  "amount": number,
  "frequency": "WEEKLY|MONTHLY|QUARTERLY|HALF_YEARLY|YEARLY",
  "description": "string",
  "categoryId": "string",
  "nextDueDate": "datetime"
}
```

#### PUT /api/bills/[id]
Update a bill.

#### DELETE /api/bills/[id]
Delete a bill.

### Financial Goals
Manage savings and financial goals.

#### GET /api/goals
Get all financial goals.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "goalType": "SAVINGS|DEBT_PAYOFF|INVESTMENT|EMERGENCY_FUND|EDUCATION|HOUSE|VACATION|RETIREMENT|OTHER",
    "targetAmount": number,
    "currentAmount": number,
    "targetDate": "datetime",
    "status": "ACTIVE|COMPLETED|PAUSED|CANCELLED",
    "categoryId": "string",
    "category": {
      "name": "string",
      "color": "string"
    }
  }
]
```

#### POST /api/goals
Create a new financial goal.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "goalType": "SAVINGS|DEBT_PAYOFF|INVESTMENT|EMERGENCY_FUND|EDUCATION|HOUSE|VACATION|RETIREMENT|OTHER",
  "targetAmount": number,
  "targetDate": "datetime",
  "categoryId": "string"
}
```

#### PUT /api/goals/[id]
Update a financial goal.

#### DELETE /api/goals/[id]
Delete a financial goal.

### Loans
Manage loans and EMI tracking.

#### GET /api/loans
Get all loans.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "loanType": "HOME_LOAN|PERSONAL_LOAN|CAR_LOAN|EDUCATION_LOAN|CREDIT_CARD|BUSINESS_LOAN|GOLD_LOAN|OTHER",
    "principalAmount": number,
    "currentBalance": number,
    "interestRate": number,
    "emiAmount": number,
    "tenure": number,
    "startDate": "datetime",
    "endDate": "datetime",
    "categoryId": "string",
    "category": {
      "name": "string",
      "color": "string"
    }
  }
]
```

#### POST /api/loans
Create a new loan.

**Request Body:**
```json
{
  "name": "string",
  "loanType": "HOME_LOAN|PERSONAL_LOAN|CAR_LOAN|EDUCATION_LOAN|CREDIT_CARD|BUSINESS_LOAN|GOLD_LOAN|OTHER",
  "principalAmount": number,
  "currentBalance": number,
  "interestRate": number,
  "emiAmount": number,
  "tenure": number,
  "startDate": "datetime",
  "categoryId": "string"
}
```

#### PUT /api/loans/[id]
Update a loan.

#### DELETE /api/loans/[id]
Delete a loan.

### Investments
Manage investment portfolio.

#### GET /api/investments
Get all investments.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "symbol": "string",
    "assetClass": "STOCKS|MUTUAL_FUNDS|CRYPTO|REAL_ESTATE|GOLD|BONDS|PPF|EPF|NSC|ELSS|FD|RD|ETF|OTHER",
    "platform": "ZERODHA|GROWW|ANGEL_ONE|UPSTOX|PAYTM_MONEY|KUVERA|OTHER",
    "quantity": number,
    "averagePrice": number,
    "currentPrice": number,
    "totalInvested": number,
    "currentValue": number,
    "goalId": "string",
    "categoryId": "string"
  }
]
```

#### POST /api/investments
Create a new investment.

**Request Body:**
```json
{
  "name": "string",
  "symbol": "string",
  "assetClass": "STOCKS|MUTUAL_FUNDS|CRYPTO|REAL_ESTATE|GOLD|BONDS|PPF|EPF|NSC|ELSS|FD|RD|ETF|OTHER",
  "platform": "ZERODHA|GROWW|ANGEL_ONE|UPSTOX|PAYTM_MONEY|KUVERA|OTHER",
  "quantity": number,
  "averagePrice": number,
  "currentPrice": number,
  "goalId": "string",
  "categoryId": "string"
}
```

#### PUT /api/investments/[id]
Update an investment.

#### DELETE /api/investments/[id]
Delete an investment.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting
- API endpoints: 10 requests per second
- Authentication endpoints: 1 request per second

## Data Formats
- All dates are in ISO 8601 format
- All monetary amounts are in the base currency (INR by default)
- All timestamps are in UTC

## Pagination
List endpoints support pagination with the following parameters:
- `page`: Page number (starts from 1)
- `limit`: Number of items per page (max 100)

## Filtering and Sorting
Most list endpoints support filtering and sorting:
- Use query parameters for filtering
- Use `sort` parameter for sorting (e.g., `sort=createdAt:desc`)
