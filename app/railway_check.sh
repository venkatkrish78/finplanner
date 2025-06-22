#!/bin/bash

echo "🚀 Running Railway-style deployment checks..."
echo "================================================"

echo ""
echo "1️⃣ TypeScript Static Analysis..."
echo "--------------------------------"
npx tsc --noEmit
if [ $? -eq 0 ]; then
    echo "✅ TypeScript check passed"
else
    echo "❌ TypeScript check failed"
    exit 1
fi

echo ""
echo "2️⃣ Next.js Production Build..."
echo "------------------------------"
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "3️⃣ ESLint Check..."
echo "------------------"
npm run lint 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Linting passed"
else
    echo "⚠️  Linting issues found (non-blocking)"
fi

echo ""
echo "4️⃣ Dependency Verification..."
echo "-----------------------------"
npm ls --depth=0 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ All dependencies resolved"
else
    echo "⚠️  Some dependency issues found"
    npm ls --depth=0 | grep -E "(UNMET|missing)"
fi

echo ""
echo "5️⃣ Environment Variables Check..."
echo "---------------------------------"
echo "Required environment variables found in code:"
grep -r "process.env\." app/ --include="*.ts" --include="*.tsx" | \
    sed 's/.*process\.env\.\([A-Z_]*\).*/\1/' | \
    sort | uniq | \
    grep -v "NODE_ENV" | \
    head -10

echo ""
echo "6️⃣ Build Output Analysis..."
echo "---------------------------"
if [ -d ".next" ]; then
    echo "✅ .next directory created"
    echo "📊 Build size:"
    du -sh .next/ 2>/dev/null || echo "Could not calculate size"
    
    echo "📁 Key build files:"
    ls -la .next/static/chunks/ 2>/dev/null | head -5 || echo "No chunks found"
else
    echo "❌ .next directory not found"
fi

echo ""
echo "7️⃣ Runtime Dependencies Check..."
echo "--------------------------------"
echo "Checking for dynamic imports..."
grep -r "await import" app/ --include="*.ts" --include="*.tsx" | wc -l | xargs echo "Dynamic imports found:"

echo ""
echo "🎯 Railway Deployment Readiness Summary:"
echo "========================================"
if [ -d ".next" ] && npx tsc --noEmit > /dev/null 2>&1; then
    echo "✅ READY FOR DEPLOYMENT"
    echo "   - TypeScript compilation: ✅"
    echo "   - Next.js build: ✅"
    echo "   - Build artifacts: ✅"
else
    echo "❌ NOT READY FOR DEPLOYMENT"
    echo "   - Fix the issues above first"
fi

echo ""
echo "🚀 To deploy to Railway:"
echo "   1. git add ."
echo "   2. git commit -m 'Fix build issues'"
echo "   3. git push"
