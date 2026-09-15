// build.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = __dirname;
const SRC_DIR = path.join(PROJECT_ROOT, "templates");
const SUBPAGES_DIR = path.join(SRC_DIR, "sub-pages");
const OUTPUT_DIR = PROJECT_ROOT;
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
    console.log(`✓ Compiled: ${path.relative(PROJECT_ROOT, sourceFile)} -> ${path.relative(PROJECT_ROOT, destFile)}`);
  });
}

function runBuild() {
  console.log("Running HTML build compiler...");
  compileDirectory(SRC_DIR, OUTPUT_DIR);
  compileDirectory(SUBPAGES_DIR, OUTPUT_SUBPAGES_DIR);
  console.log("Build complete! All files generated successfully.\n");
}

runBuild();