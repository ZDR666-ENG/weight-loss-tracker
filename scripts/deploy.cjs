const { execSync } = require('child_process');

console.log('=== Building & Deploying ===');
// Full deploy: build + fix (via plugin) + deploy
// --skip-functions-cache ensures the freshly-built (fixed) function is used
execSync('npx netlify deploy --prod --skip-functions-cache', {
  stdio: 'inherit',
  cwd: __dirname + '/..'
});

console.log('=== Done ===');
