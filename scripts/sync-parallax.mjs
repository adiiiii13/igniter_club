import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const source = resolve(root, 'Parallax-website-main');
const target = resolve(root, 'public', 'Parallax-website-main');

if (!existsSync(source)) {
  console.error('sync-parallax: source folder not found:', source);
  process.exit(1);
}

if (existsSync(target)) {
  rmSync(target, { recursive: true, force: true });
}

mkdirSync(resolve(root, 'public'), { recursive: true });
cpSync(source, target, { recursive: true });

console.log('sync-parallax: copied Parallax-website-main to public/Parallax-website-main');
