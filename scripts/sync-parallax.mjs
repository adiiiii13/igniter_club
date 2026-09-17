import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const source = resolve(root, 'Parallax-website-main');
const targetWelcome = resolve(root, 'public', 'welcome');
const targetParallax = resolve(root, 'public', 'Parallax-website-main');

if (!existsSync(source)) {
  console.error('sync-parallax: source folder not found:', source);
  process.exit(1);
}

mkdirSync(resolve(root, 'public'), { recursive: true });

// Sync to public/welcome
if (existsSync(targetWelcome)) {
  rmSync(targetWelcome, { recursive: true, force: true });
}
cpSync(source, targetWelcome, { recursive: true });
console.log('sync-parallax: copied Parallax-website-main to public/welcome');

// Sync to public/Parallax-website-main for backward compatibility
if (existsSync(targetParallax)) {
  rmSync(targetParallax, { recursive: true, force: true });
}
cpSync(source, targetParallax, { recursive: true });
console.log('sync-parallax: copied Parallax-website-main to public/Parallax-website-main');
