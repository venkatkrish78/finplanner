#!/usr/bin/env node
const { exec } = require('child_process');

console.log('🚀 Custom start script running...');
console.log('🔍 Checking DATABASE_URL:', process.env.DATABASE_URL ? 'Available' : 'Missing');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

console.log('🔄 Running Prisma migrations...');

exec('npx prisma migrate deploy', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Migration failed:', error);
    console.error('stderr:', stderr);
    process.exit(1);
  }
  
  console.log('✅ Migration completed:', stdout);
  
  // Start the Next.js app
  console.log('🚀 Starting Next.js application...');
  const app = exec('node server.js');
  
  app.stdout.on('data', (data) => {
    console.log(data);
  });
  
  app.stderr.on('data', (data) => {
    console.error(data);
  });
  
  app.on('close', (code) => {
    console.log(`App exited with code ${code}`);
    process.exit(code);
  });
});
