const fs = require('fs');
const path = require('path');

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

function fixPrismaSymlinks(baseDir) {
  const prismaDir = path.join(baseDir, 'node_modules', '@prisma');
  if (!fs.existsSync(prismaDir)) return false;

  const entries = fs.readdirSync(prismaDir);
  const clientDir = entries.find(e => e.startsWith('client-'));
  if (!clientDir) return false;

  const linkPath = path.join(prismaDir, clientDir);
  let stat;
  try {
    stat = fs.lstatSync(linkPath);
  } catch { return false; }

  // Check if it's a symlink or a tiny stub file (Windows symlink stored as text)
  const isSymlink = stat.isSymbolicLink();
  const isStub = stat.isFile() && stat.size < 200;

  if (isSymlink || isStub) {
    console.log(`  [fix-prisma] Fixing ${linkPath} (${isSymlink ? 'symlink' : 'stub'})`);
    if (isSymlink || isStub) {
      fs.unlinkSync(linkPath);
    }
    const src = path.resolve('node_modules', '@prisma', 'client');
    copyRecursive(src, linkPath);
    console.log(`  [fix-prisma] Replaced with real @prisma/client`);
    return true;
  }
  return false;
}

module.exports = {
  onPostBuild({ utils }) {
    console.log('[fix-prisma] Running onPostBuild — checking for Prisma symlinks...');

    // Fix in .next (may already be fixed by build command, but verify)
    fixPrismaSymlinks('.next');

    // Fix in functions-internal (created by @netlify/plugin-nextjs after build)
    const funcDir = '.netlify/functions-internal';
    if (fs.existsSync(funcDir)) {
      const entries = fs.readdirSync(funcDir);
      for (const entry of entries) {
        const subDir = path.join(funcDir, entry, '.next');
        if (fs.existsSync(subDir)) {
          fixPrismaSymlinks(subDir);
        }
      }
    }

    console.log('[fix-prisma] Done');
  },
};
