// build.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = __dirname;
const SRC_DIR = path.join(PROJECT_ROOT, "templates");
const SUBPAGES_DIR = path.join(SRC_DIR, "sub-pages");

// Output everything cleanly into dist/
const OUTPUT_DIR = path.join(PROJECT_ROOT, "dist");
const OUTPUT_SUBPAGES_DIR = path.join(OUTPUT_DIR, "sub-pages");

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
      console.error(`[Error] File not found: ${fullComponentPath}`);
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

function compileDirectory(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(srcDir).filter((file) => {
    const fullPath = path.join(srcDir, file);
    return fs.statSync(fullPath).isFile() && file.endsWith(".html");
  });

  files.forEach((file) => {
    const sourceFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);

    const sourceHtml = fs.readFileSync(sourceFile, "utf8");
    const compiledHtml = inlineComponents(sourceHtml, sourceFile);

    fs.writeFileSync(destFile, compiledHtml, "utf8");
    console.log(`✓ Compiled: ${file} -> dist/${path.relative(OUTPUT_DIR, destFile)}`);
  });
}

function runBuild() {
  console.log("Cleaning and building dist folder...");
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 1. Compile root templates to dist/
  compileDirectory(SRC_DIR, OUTPUT_DIR);

  // 2. Compile sub-pages to dist/sub-pages/
  compileDirectory(SUBPAGES_DIR, OUTPUT_SUBPAGES_DIR);

  // 3. Copy index.html, assets, css, js into dist/
  if (fs.existsSync(path.join(PROJECT_ROOT, "index.html"))) {
    const indexSource = fs.readFileSync(path.join(PROJECT_ROOT, "index.html"), "utf8");
    const indexCompiled = inlineComponents(indexSource, path.join(PROJECT_ROOT, "index.html"));
    fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), indexCompiled, "utf8");
  }

  ["assets", "css", "js"].forEach((folder) => {
    const folderPath = path.join(PROJECT_ROOT, folder);
    if (fs.existsSync(folderPath)) {
      copyDirRecursive(folderPath, path.join(OUTPUT_DIR, folder));
      console.log(`✓ Copied static folder: ${folder}`);
    }
  });

  console.log("Build complete! Static output in /dist\n");
}

runBuild();