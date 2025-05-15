#!/usr/bin/env node

import clipboardy from 'clipboardy';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 构建client.js的绝对路径
const clientPath = path.join(__dirname, '..', 'client.js');

try {
  const clientCode = fs.readFileSync(clientPath, 'utf8');
  clipboardy.writeSync(clientCode);
  console.log('Client code has been copied to clipboard!\nYou can paste it into the app you are cracking.');
} catch (error) {
  console.error('Failed to copy client code:', error.message);
}