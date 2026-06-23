/* DO NOT MODIFY, USE BUILD PLUGINS!!!!! */

const fs = require("fs").promises;
const path = require("path");

async function getAllJsFiles(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return []; // directory doesn't exist — skip silently
  }
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return getAllJsFiles(fullPath);
      } else if (entry.isFile() && fullPath.endsWith(".js")) {
        return fullPath;
      }
      return [];
    }),
  );
  return files.flat();
}

async function combineScripts() {
  try {
    const baseDir = __dirname;
    const srcDir = path.join(baseDir, "src");
    const libDir = path.join(baseDir, "lib");
    const combinedPath = path.join(baseDir, "combined.js");

    const srcFiles = (await getAllJsFiles(srcDir)).sort();
    const libFiles = (await getAllJsFiles(libDir)).sort();

    if (libFiles.length === 0 && srcFiles.length === 0) {
      console.warn("[combine-scripts] Warning: no JS files found in lib/ or src/");
    }

    const srcContents = await Promise.all(
      srcFiles.map(async (f) => {
        const rel = path.relative(baseDir, f);
        const code = await fs.readFile(f, "utf8");
        return `/* === src: ${rel} === */\n${code}`;
      }),
    );

    const libContents = await Promise.all(
      libFiles.map(async (f) => {
        const rel = path.relative(baseDir, f);
        const code = await fs.readFile(f, "utf8");
        return `/* === lib: ${rel} === */\n${code}`;
      }),
    );

    const combinedContent = [
      `document.addEventListener("DOMContentLoaded", function() {`,
      ...libContents,
      ...srcContents,
      `});`,
    ].join("\n\n");

    await fs.writeFile(combinedPath, combinedContent, "utf8");
    console.log(`Scripts combined successfully. (${libFiles.length} lib + ${srcFiles.length} src)`);
  } catch (error) {
    console.error("Error combining scripts:", error);
    process.exit(1);
  }
}

combineScripts();
