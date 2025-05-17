import fs from 'fs/promises';
import path from 'path';

const VALID_EXTENSIONS = ['.js', '.json', '.node'];

function needsJsExtension(importPath) {
  return (
    importPath.startsWith('.') &&
    !VALID_EXTENSIONS.some(ext => importPath.endsWith(ext))
  );
}

async function fixImportsInFile(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');

  const fixed = content.replace(
    /(import|export)\s+(.*?from\s+)?['"](\.\/[^'"]+|\.{2}\/[^'"]+)['"]/g,
    (match, keyword, fromPart, importPath) => {
      if (needsJsExtension(importPath)) {
        return `${keyword} ${fromPart || ''}'${importPath}.js'`;
      }
      return match;
    }
  );

  if (fixed !== content) {
    await fs.writeFile(filePath, fixed);
    console.log(`✔ Fixed imports in ${filePath}`);
  }
}

async function walk(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const res = path.resolve(dir, file.name);
    if (file.isDirectory()) {
      await walk(res);
    } else if (file.name.endsWith('.js')) {
      await fixImportsInFile(res);
    }
  }
}

walk('./dist').catch(console.error);
