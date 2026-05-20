const fs = require('fs');
const path = require('path');

const zipPath = '.netlify/functions/___netlify-server-handler.zip';
if (!fs.existsSync(zipPath)) {
  console.log('No function zip found, skipping');
  process.exit(0);
}

// Use a tmp directory to rebuild the zip
const AdmZip = require('adm-zip');
let AdmZipClass;
try {
  AdmZipClass = require('adm-zip');
} catch {
  // Try to install adm-zip temporarily
  console.log('Installing adm-zip...');
  require('child_process').execSync('npm install --no-save adm-zip', { stdio: 'inherit' });
  AdmZipClass = require('adm-zip');
}

const zip = new AdmZipClass(zipPath);
const entries = zip.getEntries();

let fixed = false;

for (const entry of entries) {
  // Look for the Prisma client stub (63 bytes, in .next/node_modules/@prisma/client-*)
  if (entry.entryName.match(/\.next\/node_modules\/@prisma\/client-[^/]+$/) && entry.header.size < 200) {
    const content = entry.getData().toString('utf8');
    if (content.includes('node_modules/@prisma/client')) {
      console.log(`Found symlink stub: ${entry.entryName}`);
      console.log(`  Content: ${content}`);

      // Remove this entry
      zip.deleteFile(entry.entryName);

      // Add the actual Prisma client files under this path as a directory
      const prismaClientDir = path.resolve('node_modules/@prisma/client');
      const dirName = entry.entryName; // e.g., .next/node_modules/@prisma/client-abc123

      addDirToZip(zip, prismaClientDir, dirName);

      console.log(`  Replaced with real @prisma/client directory`);
      fixed = true;
    }
  }
}

if (fixed) {
  zip.writeZip(zipPath);
  console.log('Zip fixed successfully');
} else {
  console.log('No symlink stubs found in zip');
}

function addDirToZip(zip, srcDir, zipDir) {
  function walk(dir, zipBase) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(dir, entry.name);
      const zipPath = path.join(zipBase, entry.name).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        walk(srcPath, zipPath);
      } else {
        zip.addLocalFile(srcPath, path.dirname(zipPath));
      }
    }
  }
  walk(srcDir, zipDir);
}
