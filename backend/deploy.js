/**
 * Deployment script for Render
 * Runs migrations before starting the server
 */
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting deployment process...');

try {
  // Run migrations
  console.log('📦 Running database migrations...');
  execSync('npm run migrate', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('✅ Migrations completed successfully!');
  console.log('🎉 Deployment process completed!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}