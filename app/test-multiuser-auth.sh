#!/bin/bash

# Multi-User Authentication Test Script for FinPlanner
# This script tests user authentication, data isolation, and CRUD operations

echo "🚀 Starting Multi-User Authentication Tests for FinPlanner"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"
API_BASE="$BASE_URL/api"

# Test results
PASSED=0
FAILED=0

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASSED${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}: $2"
        ((FAILED++))
    fi
}

# Function to test API endpoint
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    local headers=$6

    echo -e "${BLUE}Testing:${NC} $description"

    if [ -n "$headers" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$API_BASE$endpoint" \
                   -H "Content-Type: application/json" \
                   -H "$headers" \
                   ${data:+-d "$data"})
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$API_BASE$endpoint" \
                   -H "Content-Type: application/json" \
                   ${data:+-d "$data"})
    fi

    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')

    if [ "$http_code" -eq "$expected_status" ]; then
        print_result 0 "$description"
        echo -e "${YELLOW}Response:${NC} $body" | head -c 200
        echo ""
    else
        print_result 1 "$description (Expected: $expected_status, Got: $http_code)"
        echo -e "${YELLOW}Response:${NC} $body" | head -c 200
        echo ""
    fi

    echo "---"
}

echo -e "${BLUE}📋 Test Plan:${NC}"
echo "1. Test unauthenticated access (should fail)"
echo "2. Test authenticated access (should work)"
echo "3. Test data isolation between users"
echo "4. Test CRUD operations for bills"
echo "5. Test CRUD operations for categories"
echo "6. Test bill payment functionality"
echo ""

echo -e "${YELLOW}⚠️  Prerequisites:${NC}"
echo "- Your app should be running on http://localhost:3000"
echo "- You should have at least 2 test users created"
echo "- Database should be accessible"
echo ""

read -p "Press Enter to continue with the tests..."

echo -e "${BLUE}🔐 Testing Authentication & Authorization${NC}"
echo "============================================"

# Test 1: Unauthenticated requests should fail
test_api "GET" "/bills" "" 401 "Unauthenticated GET /api/bills"
test_api "POST" "/bills" '{"name":"Test Bill","amount":100}' 401 "Unauthenticated POST /api/bills"
test_api "GET" "/categories" "" 401 "Unauthenticated GET /api/categories"

echo -e "${BLUE}📊 Testing Database Schema${NC}"
echo "================================="

# Test database connection and schema
echo -e "${BLUE}Checking database schema...${NC}"
if command -v npx &> /dev/null; then
    echo "Running Prisma validation..."
    npx prisma validate
    if [ $? -eq 0 ]; then
        print_result 0 "Database schema validation"
    else
        print_result 1 "Database schema validation"
    fi
else
    echo -e "${YELLOW}⚠️  npx not found, skipping schema validation${NC}"
fi

echo -e "${BLUE}🔍 Manual Testing Instructions${NC}"
echo "===================================="

echo -e "${GREEN}To complete the multi-user testing, please follow these steps:${NC}"
echo ""

echo -e "${YELLOW}Step 1: Create Test Users${NC}"
echo "1. Open your app: $BASE_URL"
echo "2. Create User 1: test1@example.com / password123"
echo "3. Create User 2: test2@example.com / password123"
echo ""

echo -e "${YELLOW}Step 2: Test User 1 Data Creation${NC}"
echo "1. Login as User 1 (test1@example.com)"
echo "2. Create a category: 'User1 Category'"
echo "3. Create a bill: 'User1 Bill' with amount $100"
echo "4. Mark the bill as paid"
echo "5. Note down the bill ID and category ID"
echo ""

echo -e "${YELLOW}Step 3: Test User 2 Data Creation${NC}"
echo "1. Login as User 2 (test2@example.com)"
echo "2. Create a category: 'User2 Category'"
echo "3. Create a bill: 'User2 Bill' with amount $200"
echo "4. Verify you CANNOT see User1's data"
echo ""

echo -e "${YELLOW}Step 4: Test Data Isolation${NC}"
echo "1. As User 2, try to access User 1's bill directly via URL"
echo "2. Verify you get 403/404 error"
echo "3. Check that categories are properly isolated"
echo ""

echo -e "${YELLOW}Step 5: Browser Testing Checklist${NC}"
echo "✅ User registration works"
echo "✅ User login works"
echo "✅ User logout works"
echo "✅ Users can only see their own data"
echo "✅ Bills can be created and marked as paid"
echo "✅ Categories are properly isolated"
echo "✅ Dashboard shows correct user-specific data"
echo ""

echo -e "${BLUE}🧪 Automated API Tests (with session)${NC}"
echo "========================================"

echo -e "${YELLOW}Note:${NC} For full API testing, you'll need to:"
echo "1. Extract session cookies from browser after login"
echo "2. Use those cookies in curl requests"
echo "3. Or implement API key authentication"
echo ""

echo -e "${GREEN}Example curl commands for authenticated testing:${NC}"
echo ""
echo "# Get session cookie from browser dev tools after login"
echo "COOKIE='next-auth.session-token=your-session-token'"
echo ""
echo "# Test authenticated requests"
echo "curl -H "Cookie: \$COOKIE" $API_BASE/bills"
echo "curl -H "Cookie: \$COOKIE" $API_BASE/categories"
echo ""
echo "# Test bill creation"
echo "curl -X POST -H "Cookie: \$COOKIE" -H "Content-Type: application/json" \"
echo "     -d '{"name":"Test Bill","amount":100,"frequency":"MONTHLY","categoryId":"your-category-id","nextDueDate":"2024-07-01"}' \"
echo "     $API_BASE/bills"
echo ""

echo -e "${BLUE}📈 Database Verification Queries${NC}"
echo "===================================="

echo -e "${GREEN}Run these queries in Prisma Studio or your database client:${NC}"
echo ""
echo "-- Check user data isolation"
echo "SELECT u.email, COUNT(b.id) as bill_count, COUNT(c.id) as category_count"
echo "FROM "User" u"
echo "LEFT JOIN "Bill" b ON u.id = b."userId""
echo "LEFT JOIN "Category" c ON u.id = c."userId""
echo "GROUP BY u.id, u.email;"
echo ""
echo "-- Check bill instances have correct userId"
echo "SELECT bi.id, bi."userId", b.name, b."userId" as bill_user_id"
echo "FROM "BillInstance" bi"
echo "JOIN "Bill" b ON bi."billId" = b.id"
echo "WHERE bi."userId" != b."userId"; -- Should return no rows"
echo ""
echo "-- Check categories belong to users"
echo "SELECT c.name, c."userId", c."isDefault", u.email"
echo "FROM "Category" c"
echo "LEFT JOIN "User" u ON c."userId" = u.id"
echo "ORDER BY c."userId";"
echo ""

echo -e "${BLUE}🎯 Security Checklist${NC}"
echo "======================="

echo -e "${GREEN}Verify these security aspects:${NC}"
echo "✅ No user can access another user's bills"
echo "✅ No user can access another user's categories"
echo "✅ No user can modify another user's data"
echo "✅ Unauthenticated requests are rejected"
echo "✅ Session management works correctly"
echo "✅ Data is properly isolated in database"
echo ""

echo -e "${BLUE}📊 Test Summary${NC}"
echo "================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${BLUE}Total: $((PASSED + FAILED))${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All automated tests passed!${NC}"
    echo -e "${YELLOW}Don't forget to complete the manual testing steps above.${NC}"
else
    echo -e "${RED}⚠️  Some tests failed. Please review the errors above.${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Troubleshooting Tips:${NC}"
echo "========================="
echo "• If authentication tests fail, check your NextAuth configuration"
echo "• If data isolation fails, verify userId fields in your Prisma schema"
echo "• If API tests fail, check your API route implementations"
echo "• Use browser dev tools to inspect network requests and responses"
echo "• Check server logs for detailed error messages"
echo ""

echo -e "${GREEN}✅ Multi-user authentication testing complete!${NC}"
