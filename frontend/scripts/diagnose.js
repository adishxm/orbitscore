import fs from 'fs';
import path from 'path';

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = walk('./src');
const cssFiles = allFiles.filter(f => f.endsWith('.css')).map(f => path.normalize(f));
const tsxFiles = allFiles.filter(f => f.endsWith('.tsx') || f.endsWith('.ts')).map(f => path.normalize(f));

// Parse CSS classes
const cssClasses = {};
for (const f of cssFiles) {
  const content = fs.readFileSync(f, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');
  const classes = new Set();
  const re = /\.([a-zA-Z0-9_-]+)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    if (!/^\d/.test(m[1])) classes.add(m[1]);
  }
  cssClasses[f] = Array.from(classes).sort();
}

// Module imports in TS/TSX
const moduleImports = [];
const undefinedClasses = [];
const staticClassNames = {};

for (const f of tsxFiles) {
  const content = fs.readFileSync(f, 'utf-8');
  const importRe = /import\s+(\w+)\s+from\s+['"]([^'"]+\.module\.css)['"]/g;
  let m;
  const mods = {};
  while ((m = importRe.exec(content)) !== null) {
    const varName = m[1];
    const rel = m[2];
    const resolved = path.normalize(path.join(path.dirname(f), rel));
    mods[varName] = resolved;
    moduleImports.push({ file: f, varName, rel, resolved });
  }

  // Check usage of styles.<cls>
  for (const [varName, cssPath] of Object.entries(mods)) {
    const available = new Set(cssClasses[cssPath] || []);
    const usageRe = new RegExp(`\\b${varName}\\.([a-zA-Z0-9_-]+)`, 'g');
    let u;
    while ((u = usageRe.exec(content)) !== null) {
      const cls = u[1];
      if (!available.has(cls)) {
        undefinedClasses.push({ file: f, cssPath, cls });
      }
    }
  }

  // Static class names
  const staticClassRe = /className=["']([^"'${}]+)["']/g;
  let sc;
  while ((sc = staticClassRe.exec(content)) !== null) {
    const list = sc[1].split(/\s+/).filter(Boolean);
    for (const c of list) {
      if (!staticClassNames[f]) staticClassNames[f] = new Set();
      staticClassNames[f].add(c);
    }
  }
}

console.log('=== 1. CSS-MODULE IMPORTS USED IN SRC/ ===');
moduleImports.forEach(i => console.log(`${i.file} -> ${i.rel} (${i.resolved}) as ${i.varName}`));

console.log('\n=== 2. CLASSES ACTUALLY DEFINED IN STYLESHEETS ===');
for (const [f, cls] of Object.entries(cssClasses)) {
  console.log(`[${f}] (${cls.length} classes): ${cls.join(', ')}`);
}

console.log('\n=== 3. REPORT: CLASSES USED BUT UNDEFINED ===');
if (undefinedClasses.length === 0) {
  console.log('None! All CSS-module class names used in TSX exist in their respective .module.css files.');
} else {
  console.log(undefinedClasses);
}

console.log('\n=== 4. STYLESHEETS DEFINED BUT NEVER IMPORTED ===');
const importedCss = new Set();
for (const f of tsxFiles) {
  const content = fs.readFileSync(f, 'utf-8');
  const importRegex = /import\s+(?:(?:\*\s+as\s+\w+|\w+|\{[^}]+\})\s+from\s+)?['"]([^'"]+\.css)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    importedCss.add(path.normalize(path.join(path.dirname(f), match[1])));
  }
}
// check if tokens.css or print.css or global.css imports other css
for (const f of cssFiles) {
  const content = fs.readFileSync(f, 'utf-8');
  const atImport = /@import\s+['"]([^'"]+\.css)['"]/g;
  let match;
  while ((match = atImport.exec(content)) !== null) {
    importedCss.add(path.normalize(path.join(path.dirname(f), match[1])));
  }
}

const unimported = cssFiles.filter(f => !importedCss.has(f));
console.log(unimported.length === 0 ? 'None! All stylesheets are imported directly or via @import.' : unimported);

console.log('\n=== 5. GLOBAL ENTRY CHECK IN main.tsx ===');
const mainContent = fs.readFileSync('src/main.tsx', 'utf-8');
console.log(mainContent);

console.log('\n=== 6. TAILWIND CHECK ===');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const hasTailwind = pkg.dependencies?.tailwindcss || pkg.devDependencies?.tailwindcss;
console.log('Tailwind installed in package.json?', Boolean(hasTailwind));
console.log('tailwind.config exists?', fs.existsSync('tailwind.config.js') || fs.existsSync('tailwind.config.ts'));

console.log('\n=== 7. GLOBAL STATIC CLASSES USED (e.g. container) ===');
for (const [f, set] of Object.entries(staticClassNames)) {
  console.log(`${f}: ${Array.from(set).join(', ')}`);
}
