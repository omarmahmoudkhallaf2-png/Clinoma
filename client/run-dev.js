import { execSync, spawn } from 'child_process';

console.log('Checking for updates from repository...');
try {
  // Run git pull in the parent directory (git root)
  execSync('git pull', { stdio: 'inherit', cwd: '..' });
} catch (error) {
  console.log('\n[Offline Mode] Could not connect to repository. Starting server with local files...\n');
}

// Start Vite development server
const child = spawn('npx', ['vite', '--host'], { stdio: 'inherit', shell: true });

child.on('exit', (code) => {
  process.exit(code || 0);
});
