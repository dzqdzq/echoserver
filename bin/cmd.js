#!/usr/bin/env node

import createServer from '../server.js';

const args = process.argv.slice(2);
const command = args[0];
const port = args[1] ? parseInt(args[1], 10) : 9191;

if (command === 'server') {
  createServer(port);
} else if (command === 'client' || command === 'cli') {
  import('./client.js').then((res) => {
    res.default("client.js");
  });
} else if (command === 'wxclient' || command === 'wxcli') {
  import('./client.js').then((res) => {
    res.default("wxclient.js");
  });
} else if (command === 'wxlogin') {
  import('./client.js').then((res) => {
    res.default("wxlogin.js");
  });
} else {
  console.log('Usage:');
  console.log('  hecho server [port]    - Start echo server (default port: 9191)');
  console.log('  hecho client           - Copy client code to clipboard');
  console.log('  hecho wxclient         - Copy wechat miniprogram client code to clipboard');
  console.log('  hecho wxlogin          - Copy hook wxlogin code to clipboard');
  console.log('  hecho cli              - Alias for client');
  console.log('  hecho wxcli            - Alias for wxclient');
}