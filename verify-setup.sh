
#!/bin/bash

# FinPlanner Setup Verification Script
# This script verifies that all necessary files and configurations are in place

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

ERRORS=0

print_header "🔍 FinPlanner Setup Verification"
echo

# Check main files
print_header "📁 Checking main files..."

files=(
    "README.md"
    "package.json"
    "docker-compose.yml"
    "Dockerfile"
    ".gitignore"
    "LICENSE"
    "CHANGELOG.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file is missing"
        ((ERRORS++))
    fi
done

# Check environment files
print_header "🔧 Checking environment configuration..."

env_files=(
    ".env.example"
    ".env.local.example"
    ".env.production.example"
)

for file in "${env_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file is missing"
        ((ERRORS++))
    fi
done

# Check deployment files
print_header "🚀 Checking deployment files..."

deployment_files=(
    "deploy.sh.example"
    "nginx.conf.example"
    "pm2.config.js.example"
    "ecosystem.config.js"
    "init-db.sql"
)

for file in "${deployment_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file is missing"
        ((ERRORS++))
    fi
done

# Check documentation files
print_header "📚 Checking documentation..."

doc_files=(
    "API_DOCUMENTATION.md"
    "FEATURES.md"
    "TROUBLESHOOTING.md"
)

for file in "${doc_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file is missing"
        ((ERRORS++))
    fi
done

# Check app directory structure
print_header "📱 Checking app directory..."

if [ -d "app" ]; then
    print_success "app directory exists"
    
    app_files=(
        "app/package.json"
        "app/next.config.js"
        "app/tailwind.config.ts"
        "app/tsconfig.json"
        "app/prisma/schema.prisma"
        "app/prisma/seed.ts"
    )
    
    for file in "${app_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file exists"
        else
            print_error "$file is missing"
            ((ERRORS++))
        fi
    done
    
    # Check app directories
    app_dirs=(
        "app/app"
        "app/components"
        "app/lib"
        "app/prisma"
    )
    
    for dir in "${app_dirs[@]}"; do
        if [ -d "$dir" ]; then
            print_success "$dir directory exists"
        else
            print_error "$dir directory is missing"
            ((ERRORS++))
        fi
    done
else
    print_error "app directory is missing"
    ((ERRORS++))
fi

# Check API routes
print_header "🔌 Checking API routes..."

api_routes=(
    "app/app/api/categories/route.ts"
    "app/app/api/transactions/route.ts"
    "app/app/api/bills/route.ts"
    "app/app/api/goals/route.ts"
    "app/app/api/loans/route.ts"
    "app/app/api/investments/route.ts"
    "app/app/api/health/route.ts"
)

for route in "${api_routes[@]}"; do
    if [ -f "$route" ]; then
        print_success "$(basename $(dirname $route)) API exists"
    else
        print_error "$(basename $(dirname $route)) API is missing"
        ((ERRORS++))
    fi
done

# Check package.json scripts
print_header "📦 Checking package.json scripts..."

if [ -f "app/package.json" ]; then
    required_scripts=(
        "dev"
        "build"
        "start"
        "db:migrate"
        "db:generate"
        "db:seed"
    )
    
    for script in "${required_scripts[@]}"; do
        if grep -q "\"$script\":" app/package.json; then
            print_success "$script script exists"
        else
            print_error "$script script is missing"
            ((ERRORS++))
        fi
    done
fi

# Check Docker files
print_header "🐳 Checking Docker configuration..."

if [ -f "Dockerfile" ]; then
    if grep -q "FROM node:" Dockerfile; then
        print_success "Dockerfile has Node.js base image"
    else
        print_warning "Dockerfile might not have proper Node.js base image"
    fi
fi

if [ -f "docker-compose.yml" ]; then
    if grep -q "postgres:" docker-compose.yml; then
        print_success "Docker Compose includes PostgreSQL"
    else
        print_warning "Docker Compose might not include PostgreSQL"
    fi
    
    if grep -q "finplanner:" docker-compose.yml; then
        print_success "Docker Compose includes FinPlanner app"
    else
        print_warning "Docker Compose might not include FinPlanner app"
    fi
fi

# Summary
echo
print_header "📊 Verification Summary"

if [ $ERRORS -eq 0 ]; then
    print_success "All checks passed! FinPlanner is ready for deployment."
    echo
    echo "Next steps:"
    echo "1. Copy environment files and configure them"
    echo "2. Set up your database"
    echo "3. Run the setup script: ./setup.sh"
    echo "4. Start development: cd app && npm run dev"
else
    print_error "Found $ERRORS issues that need to be resolved."
    echo
    echo "Please check the missing files and fix the issues before proceeding."
fi

echo
print_header "🔗 Quick Links"
echo "• Setup Guide: ./setup.sh"
echo "• Documentation: README.md"
echo "• API Docs: API_DOCUMENTATION.md"
echo "• Troubleshooting: TROUBLESHOOTING.md"

exit $ERRORS
