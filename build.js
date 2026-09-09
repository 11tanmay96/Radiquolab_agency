// build.js
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = __dirname;
const SRC_DIR = path.join(PROJECT_ROOT, 'templates');
const OUTPUT_DIR = PROJECT_ROOT; // Outputs directly to the root

const INCLUDE_REGEX = /<([a-zA-Z0-9]+)[^>]*\bdata-include=["']([^"']+)["'][^>]*>([\s\S]*?)<\/\1>/gi;

function resolvePath(includePath, sourceFilePath) {
  const cleanPath = includePath.split('?')[0].trim();
  if (cleanPath.startsWith('/')) {
    return path.join(PROJECT_ROOT, cleanPath);
  }
  return path.resolve(path.dirname(sourceFilePath), cleanPath);
}

function inlineComponents(content, filePath, depth = 0) {
  if (depth > 10) return content;

  return content.replace(INCLUDE_REGEX, (match, tag, includePath) => {
    const fullComponentPath = resolvePath(includePath, filePath);
    if (!fs.existsSync(fullComponentPath)) {
      console.error(`[Error] File not found: ${fullComponentPath}`);
      return `<!-- Missing component: ${includePath} -->`;
    }
    const componentContent = fs.readFileSync(fullComponentPath, 'utf8');
    return inlineComponents(componentContent, fullComponentPath, depth + 1);
  });
}

function runBuild() {
  const files = fs.readdirSync(SRC_DIR).filter(file => {
    const fullPath = path.join(SRC_DIR, file);
    return fs.statSync(fullPath).isFile() && file.endsWith('.html');
  });

  files.forEach(file => {
    const sourceFile = path.join(SRC_DIR, file);
    const destFile = path.join(OUTPUT_DIR, file);

    const sourceHtml = fs.readFileSync(sourceFile, 'utf8');
    const compiledHtml = inlineComponents(sourceHtml, sourceFile);

    fs.writeFileSync(destFile, compiledHtml, 'utf8');
    console.log(`✓ Compiled: templates/${file} -> ${file}`);
  });

  console.log('\nBuild complete! Root HTML files are updated.');
}

runBuild();