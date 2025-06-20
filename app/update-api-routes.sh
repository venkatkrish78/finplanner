#!/bin/bash

echo "🔍 Analyzing API routes for authentication..."

# Function to check if a route has authentication
check_auth() {
    local file="$1"
    if [ -f "$file" ]; then
        if grep -q "getCurrentUser\|getServerSession" "$file"; then
            echo "✅ $file - Has authentication"
            return 0
        else
            echo "❌ $file - Missing authentication"
            return 1
        fi
    else
        echo "⚠️  $file - File not found"
        return 2
    fi
}

# Routes that need authentication (most critical first)
routes=(
    "app/api/dashboard/route.ts"
    "app/api/transactions/stats/route.ts"
    "app/api/transactions/summary/route.ts"
    "app/api/transactions/analytics/route.ts"
    "app/api/transactions/export/route.ts"
    "app/api/transactions/[id]/route.ts"
    "app/api/bills/stats/route.ts"
    "app/api/bills/analytics/route.ts"
    "app/api/bills/[id]/route.ts"
    "app/api/goals/stats/route.ts"
    "app/api/investments/route.ts"
    "app/api/investments/portfolio/route.ts"
    "app/api/loans/route.ts"
    "app/api/loans/stats/route.ts"
)

missing_auth=()
has_auth=()

echo "Checking ${#routes[@]} critical routes..."
echo

for route in "${routes[@]}"; do
    if check_auth "$route"; then
        has_auth+=("$route")
    else
        missing_auth+=("$route")
    fi
done

echo
echo "📊 Summary:"
echo "✅ Routes with authentication: ${#has_auth[@]}"
echo "❌ Routes missing authentication: ${#missing_auth[@]}"

if [ ${#missing_auth[@]} -gt 0 ]; then
    echo
    echo "🚨 Routes that need updating:"
    for route in "${missing_auth[@]}"; do
        echo "   - $route"
    done
    
    echo
    echo "💡 Next steps:"
    echo "1. Pick a route from the list above"
    echo "2. Share its content with me: cat [route-path]"
    echo "3. I'll provide the updated version with authentication"
    echo
    echo "🎯 Start with: ${missing_auth[0]}"
fi
