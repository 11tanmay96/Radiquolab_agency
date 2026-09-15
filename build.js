// build.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = __dirname;
const TEMPLATES_DIR = path.join(PROJECT_ROOT, "templates");
const SUBPAGES_DIR = path.join(TEMPLATES_DIR, "sub-pages");
const DIST_DIR = path.join(PROJECT_ROOT, "dist");
const DIST_SUBPAGES = path.join(DIST_DIR, "sub-pages");

const INCLUDE_REGEX = /<([a-zA-Z0-9]+)[^>]*\bdata-include=["']([^"']+)["'][^>]*>([\s\S]*?)<\/\1>/gi;

function resolvePath(includePath, sourceFilePath) {
  const cleanPath = includePath.split("?")[0].trim();
  if (cleanPath.startsWith("/")) {
    return path.join(PROJECT_ROOT, cleanPath);
  }
  return path.resolve(path.dirname(sourceFilePath), cleanPath);
}

function inlineComponents(content, filePath, depth = 0) {
  if (depth > 10) return content;

  return content.replace(INCLUDE_REGEX, (match, tag, includePath) => {
    const fullComponentPath = resolvePath(includePath, filePath);
    if (!fs.existsSync(fullComponentPath)) {
      console.warn(`⚠️ Component missing: ${includePath}`);
      return `<!-- Missing component: ${includePath} -->`;
    }
    const componentContent = fs.readFileSync(fullComponentPath, "utf8");
    return inlineComponents(componentContent, fullComponentPath, depth + 1);
  });
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function buildFile(sourcePath, destPath) {
  const content = fs.readFileSync(sourcePath, "utf8");
  const inlined = inlineComponents(content, sourcePath);
  fs.writeFileSync(destPath, inlined, "utf8");
  console.log(`✓ Built: ${path.basename(sourcePath)} -> ${path.relative(PROJECT_ROOT, destPath)}`);
}

function runBuild() {
  console.log("--- Starting Build ---");

  // 1. Reset dist
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.mkdirSync(DIST_SUBPAGES, { recursive: true });

  // 2. Build root index.html
  const rootIndex = path.join(PROJECT_ROOT, "index.html");
  if (fs.existsSync(rootIndex)) {
    buildFile(rootIndex, path.join(DIST_DIR, "index.html"));
  }

  // 3. Build main templates (about-page, contact-us-page, services-page, portfolio-page)
  if (fs.existsSync(TEMPLATES_DIR)) {
    const templateFiles = fs.readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith(".html"));
    templateFiles.forEach((file) => {
      buildFile(path.join(TEMPLATES_DIR, file), path.join(DIST_DIR, file));
    });
  }

  // 4. Build sub-pages
  if (fs.existsSync(SUBPAGES_DIR)) {
    const subFiles = fs.readdirSync(SUBPAGES_DIR).filter((f) => f.endsWith(".html"));
    subFiles.forEach((file) => {
      buildFile(path.join(SUBPAGES_DIR, file), path.join(DIST_SUBPAGES, file));
    });
  }

  // 5. Copy static assets
  ["assets", "css", "js"].forEach((folder) => {
    const folderPath = path.join(PROJECT_ROOT, folder);
    if (fs.existsSync(folderPath)) {
      copyDirRecursive(folderPath, path.join(DIST_DIR, folder));
      console.log(`✓ Copied folder: ${folder}`);
    }
  });

  console.log("--- Build Complete ---");
}

runBuild();