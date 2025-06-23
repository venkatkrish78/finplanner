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
  
  // Run seed to create demo user and data
  console.log('🌱 Running database seed...');
  exec('npx prisma db seed', (seedError, seedStdout, seedStderr) => {
    if (seedError) {
      console.error('⚠️ Seed failed (continuing anyway):', seedError);
      console.error('seed stderr:', seedStderr);
    } else {
      console.log('✅ Seed completed:', seedStdout);
    }
    
    // Start the Next.js standalone server
    console.log('🚀 Starting Next.js application...');
    const app = exec('node server.js', { stdio: 'inherit' });
    
    app.on('close', (code) => {
      console.log(`App exited with code ${code}`);
      process.exit(code);
    });
  });
});
