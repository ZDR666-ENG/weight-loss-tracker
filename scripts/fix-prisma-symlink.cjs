const fs = require('fs');
const path = require('path');

const prismaDir = path.join('.next', 'node_modules', '@prisma');
if (!fs.existsSync(prismaDir)) {
  console.log('No .next/node_modules/@prisma directory, skipping');
  process.exit(0);
}

const entries = fs.readdirSync(prismaDir);
const clientDir = entries.find(e => e.startsWith('client-'));
if (!clientDir) {
  console.log('No client symlink found, skipping');
  process.exit(0);
}

const linkPath = path.join(prismaDir, clientDir);
const stat = fs.lstatSync(linkPath);

if (stat.isSymbolicLink()) {
  console.log(`Replacing symlink ${linkPath} with real directory`);
  const target = path.resolve('node_modules', '@prisma', 'client');
  fs.unlinkSync(linkPath);
  copyRecursive(target, linkPath);

  // Also copy .prisma inside the copied client dir
  const dotPrismaSrc = path.resolve('node_modules', '.prisma');
  if (fs.existsSync(dotPrismaSrc)) {
    copyRecursive(dotPrismaSrc, path.join(linkPath, '.prisma'));
  }
  console.log('Done');
} else {
  console.log(`${linkPath} is not a symlink, skipping`);
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}
