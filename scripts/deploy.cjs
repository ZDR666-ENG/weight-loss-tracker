const { execSync } = require('child_process');

console.log('=== Building ===');
execSync('npx netlify build', { stdio: 'inherit', cwd: __dirname + '/..' });

console.log('=== Fixing Prisma module resolution ===');
execSync('node scripts/fix-prisma-symlink.cjs', { stdio: 'inherit', cwd: __dirname + '/..' });

console.log('=== Deploying ===');
execSync('npx netlify deploy --prod --no-build --skip-functions-cache', { stdio: 'inherit', cwd: __dirname + '/..' });

console.log('=== Done ===');
