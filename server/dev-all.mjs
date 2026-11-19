import { spawn } from 'node:child_process';

const children = [
  spawn('node', ['server/socket.mjs'], { stdio: 'inherit' }),
  spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true }),
];

function shutdown(signal) {
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

for (const child of children) {
  child.on('exit', (code) => {
    if (code && code !== 0) shutdown('SIGTERM');
  });
}
