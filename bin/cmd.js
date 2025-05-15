#!/usr/bin/env node

import createServer from '../server.js';

const args = process.argv.slice(2);
const command = args[0];
const port = args[1] ? parseInt(args[1], 10) : 9191;

if (command === 'server') {
  createServer(port);
} else if (command === 'client' || command === 'cli') {
  // 导入并执行client.js的功能
  import('./client.js').catch(err => {
    console.error('Failed to load client:', err);
  });
} else {
  console.log('Usage:');
  console.log('  echo server [port]    - Start echo server (default port: 9191)');
  console.log('  echo client           - Copy client code to clipboard');
  console.log('  echo cli              - Alias for client');
}