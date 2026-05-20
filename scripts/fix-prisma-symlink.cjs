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

function fixSymlink(baseDir) {
  const prismaDir = path.join(baseDir, 'node_modules', '@prisma');
  if (!fs.existsSync(prismaDir)) {
    console.log(`  No ${prismaDir}, skipping`);
    return;
  }

  const entries = fs.readdirSync(prismaDir);
  const clientDir = entries.find(e => e.startsWith('client-'));
  if (!clientDir) {
    console.log(`  No client symlink found in ${prismaDir}, skipping`);
    return;
  }

  const linkPath = path.join(prismaDir, clientDir);
  let stat;
  try {
    stat = fs.lstatSync(linkPath);
  } catch { return; }

  if (stat.isSymbolicLink()) {
    console.log(`  Replacing symlink ${linkPath} with real directory`);
    const target = path.resolve('node_modules', '@prisma', 'client');
    fs.unlinkSync(linkPath);
    copyRecursive(target, linkPath);
    console.log(`  Done`);
  } else {
    console.log(`  ${linkPath} is not a symlink, skipping`);
  }
}

// Also copy Prisma client to .next/server/node_modules/ so that
// Turbopack chunks can resolve @prisma/client-HASH from there.
// Node.js walks up: .../chunks/ → .../server/ → .../server/node_modules/
function copyToServerModules(clientDirName) {
  const src = path.resolve('node_modules', '@prisma', 'client');
  const dest = path.join('.next', 'server', 'node_modules', '@prisma', clientDirName);
  if (!fs.existsSync(src)) return false;
  console.log(`  Copying @prisma/client to ${dest}`);
  copyRecursive(src, dest);
  return true;
}

// Fix in .next
fixSymlink('.next');

// Find the client hash name and copy to server node_modules
const prismaDir = path.join('.next', 'node_modules', '@prisma');
if (fs.existsSync(prismaDir)) {
  const entries = fs.readdirSync(prismaDir);
  const clientDir = entries.find(e => e.startsWith('client-'));
  if (clientDir) {
    copyToServerModules(clientDir);
  }
}

// Also fix in .netlify/functions-internal (if exists)
const netlifyDir = '.netlify/functions-internal';
if (fs.existsSync(netlifyDir)) {
  const entries = fs.readdirSync(netlifyDir);
  for (const entry of entries) {
    const subDir = path.join(netlifyDir, entry, '.next');
    if (fs.existsSync(subDir)) {
      fixSymlink(subDir);
      // Also copy to server node_modules
      const prismaSubDir = path.join(subDir, 'node_modules', '@prisma');
      if (fs.existsSync(prismaSubDir)) {
        const subEntries = fs.readdirSync(prismaSubDir);
        const clientSubDir = subEntries.find(e => e.startsWith('client-'));
        if (clientSubDir) {
          const src = path.resolve('node_modules', '@prisma', 'client');
          const dest = path.join(subDir, 'server', 'node_modules', '@prisma', clientSubDir);
          console.log(`  Copying @prisma/client to ${dest}`);
          copyRecursive(src, dest);
        }
      }
    }
  }
}
