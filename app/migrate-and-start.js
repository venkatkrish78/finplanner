#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('🚀 Custom start script running...');
console.log('🔍 Checking DATABASE_URL:', process.env.DATABASE_URL ? 'Available' : 'Missing');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

try {
  console.log('🔄 Running Prisma migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migration completed');
  
  console.log('🌱 Running database seed...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  console.log('✅ Seed completed');
  
} catch (error) {
  console.error('❌ Migration/Seed error:', error.message);
  // Continue anyway - don't let seed failure stop the app
  console.log('⚠️ Continuing with app start...');
}

console.log('🚀 Starting Next.js application...');
execSync('npm start', { stdio: 'inherit' });
