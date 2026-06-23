#!/usr/bin/env node

/* DO NOT MODIFY, USE BUILD PLUGINS!!!!! */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// -------------------------
// --- Config / Project ---
// -------------------------
const ashProjectPath = ".ashproject";
const examplePath = ".ashproject.example";

if (!fs.existsSync(ashProjectPath)) {
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, ashProjectPath);
    console.log("\x1b[33mNo .ashproject found.\x1b[0m");
    console.log("\x1b[32mCreated one from .ashproject.example.\x1b[0m");
    console.log("\x1b[36mYou should customize project settings in .ashproject!\x1b[0m");
  } else {
    console.error("\x1b[31mError: .ashproject not found and no .ashproject.example to copy from. Exiting.\x1b[0m");
    process.exit(1);
  }
}

let projectName, projectPlatform, projectVersion, projectAuthor, projectDescription;
try {
  const data = fs.readFileSync(ashProjectPath, "utf-8");
  const json = JSON.parse(data);

  projectName = json.name || "MyCoolAshProject";
  projectVersion = json.version || "1.0.0";
  projectAuthor = json.author || "";
  projectDescription = json.description || "";

  // Backwards compat: map old isDesktop boolean to platform string
  if (typeof json.desktop === "boolean") {
    projectPlatform = json.desktop ? "desktop" : "phone";
    json.platform = projectPlatform;
    delete json.desktop;
    fs.writeFileSync(ashProjectPath, JSON.stringify(json, null, 2), "utf-8");
    console.log("\x1b[33m  Migrated legacy 'desktop' boolean to 'platform' string in .ashproject\x1b[0m");
  } else {
    projectPlatform = json.platform || "phone";
  }
} catch (e) {
  console.error("\x1b[31mError reading .ashproject:\x1b[0m", e.message);
  process.exit(1);
}

console.log(`\x1b[36mBuilding project: ${projectName}\x1b[0m`);
if (projectVersion) console.log(`\x1b[90m  Version: ${projectVersion}${projectAuthor ? "  |  Author: " + projectAuthor : ""}\x1b[0m`);

const webpackDist = "./dist";
const outputDir = "./index";

// Parse args: "node build [all|dist|clean|help] [--watch]"
const args = process.argv.slice(2);
const mode = args.find(a => !a.startsWith("--")) || "dist"; // "dist", "all", "clean", "help"
const watchMode = args.includes("--watch");

// -------------------------
// --- Help ---
// -------------------------
if (mode === "help") {
  console.log(`
\x1b[1mAsh Build System\x1b[0m

  \x1b[36mnode build\x1b[0m             Fast build — only recompiles src/ into dist/
  \x1b[36mnode build all\x1b[0m         Full build — rebuilds everything into index/
  \x1b[36mnode build clean\x1b[0m       Removes dist/, index/, and combined.js
  \x1b[36mnode build help\x1b[0m        Shows this help message

  \x1b[36m--watch\x1b[0m                Rebuild automatically when src/ files change (combine + webpack)

\x1b[1m.ashproject fields:\x1b[0m
  name           Project display name
  platform       "phone" | "desktop" | "corg"
  version        Semver string (optional, shown in build output)
  author         Your name (optional)
  description    Short description (optional)
`);
  process.exit(0);
}

// -------------------------
// --- Clean ---
// -------------------------
if (mode === "clean") {
  console.log("\x1b[33mCleaning build artifacts...\x1b[0m");
  [outputDir, webpackDist, "./combined.js"].forEach(p => {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
      console.log(`\x1b[32m  ✓ Removed ${p}\x1b[0m`);
    } else {
      console.log(`\x1b[90m  - ${p} not found, skipped\x1b[0m`);
    }
  });
  console.log("\x1b[32mClean complete.\x1b[0m");
  process.exit(0);
}

// -------------------------
// --- Logging Helpers ---
// -------------------------
function section(title) {
  console.log(`\n\x1b[1m=== ${title} ===\x1b[0m`);
}
function logStep(title) {
  console.log(`\x1b[36m> ${title}\x1b[0m`);
}
function logSuccess(msg) {
  console.log(`\x1b[32m  ✓ ${msg}\x1b[0m`);
}
function logInfo(msg) {
  console.log(`\x1b[33m  - ${msg}\x1b[0m`);
}
function logError(msg) {
  console.error(`\x1b[31m  ✗ ${msg}\x1b[0m`);
}

// -------------------------
// --- File Helpers ---
// -------------------------
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// -------------------------
// --- Plugin System ---
// -------------------------
const pluginsDir = path.join(__dirname, "plugins");
let plugins = [];
if (fs.existsSync(pluginsDir)) {
  plugins = fs
    .readdirSync(pluginsDir)
    .filter((f) => f.endsWith(".js"))
    .map((f) => {
      try {
        return require(path.join(pluginsDir, f));
      } catch (e) {
        logError(`Failed to load plugin ${f}: ${e.message}`);
        return null;
      }
    })
    .filter(Boolean);
}

function hasPluginsFor(hookName) {
  return plugins.some((p) => typeof p[hookName] === "function");
}

function runPlugins(hookName, context) {
  plugins.forEach((plugin) => {
    if (typeof plugin[hookName] === "function") {
      try {
        plugin[hookName](context);
        logSuccess(`Plugin "${plugin.name || path.basename(plugin.__filename || "unnamed")}" ran on ${hookName}`);
      } catch (e) {
        logInfo(`Plugin "${plugin.name || "unnamed"}" failed on ${hookName}: ${e.message}`);
      }
    }
  });
}

function runPluginsWithLog(hookName, context) {
  if (hasPluginsFor(hookName)) logStep(`Running ${hookName} plugins...`);
  runPlugins(hookName, context);
}

// -------------------------
// --- Core Build Steps ---
// -------------------------
function runCombine() {
  runPluginsWithLog("beforeCombineScripts", { projectName, outputDir, webpackDist });
  execSync("node combine-scripts.js", { stdio: "inherit" });
  runPluginsWithLog("afterCombineScripts", { projectName, outputDir, webpackDist });
  logSuccess("Scripts combined");
}

function runWebpack() {
  runPluginsWithLog("beforeWebpack", { projectName, outputDir, webpackDist });
  execSync("npx webpack", { stdio: "inherit" });
  runPluginsWithLog("afterWebpack", { projectName, outputDir, webpackDist });
  logSuccess("Webpack build complete");
}

// -------------------------
// --- Watch Mode ---
// -------------------------
if (watchMode) {
  console.log("\n\x1b[35m👁  Watch mode active — watching src/ for changes...\x1b[0m");
  console.log("\x1b[90m  Press Ctrl+C to stop.\x1b[0m\n");

  let debounceTimer = null;
  const srcDir = path.join(__dirname, "src");

  function rebuild() {
    console.log(`\n\x1b[33m[watch] Change detected — rebuilding...\x1b[0m`);
    try {
      runCombine();
      runWebpack();
      console.log(`\x1b[32m[watch] ✓ Rebuild complete at ${new Date().toLocaleTimeString()}\x1b[0m`);
    } catch (e) {
      logError(`Rebuild failed: ${e.message}`);
    }
  }

  // Initial build
  rebuild();

  fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith(".js")) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`\x1b[90m[watch] ${eventType}: ${filename}\x1b[0m`);
      rebuild();
    }, 150);
  });

  // Keep process alive
  process.stdin.resume();
  return;
}

// -------------------------
// --- Build Process ---
// -------------------------
section(projectName + " BUILD SCRIPT");
console.log(`Mode: ${mode === "all" ? "FULL BUILD" : "DIST ONLY"}`);
console.time("Total Build");

// Step 1: Combine Scripts
console.time("Step 1");
runCombine();
console.timeEnd("Step 1");

// Step 2: Webpack
console.time("Step 2");
runWebpack();
console.timeEnd("Step 2");

// --- DIST ONLY ---
if (mode !== "all") {
  console.time("Step 3");
  runPluginsWithLog("beforeDistCopy", { projectName, outputDir, webpackDist });

  const distTarget = path.join(outputDir, "dist");
  if (fs.existsSync(distTarget)) fs.rmSync(distTarget, { recursive: true, force: true });
  fs.mkdirSync(distTarget, { recursive: true });
  copyRecursive(webpackDist, distTarget);

  runPluginsWithLog("afterDistCopy", { projectName, outputDir, webpackDist });
  console.timeEnd("Step 3");
  logSuccess("Dist replaced");

  console.timeEnd("Total Build");
  section("BUILD COMPLETE");
  console.log("Output: ./index/");
  process.exit(0);
}

// --- FULL BUILD ---
console.time("Step 3");
runPluginsWithLog("beforeOutputFolder", { projectName, outputDir, webpackDist });
if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
runPluginsWithLog("afterOutputFolder", { projectName, outputDir, webpackDist });
console.timeEnd("Step 3");
logSuccess("Output folder ready");

// Step 4: Copy dist
console.time("Step 4");
runPluginsWithLog("beforeDistCopy", { projectName, outputDir, webpackDist });
copyRecursive(webpackDist, path.join(outputDir, "dist"));
runPluginsWithLog("afterDistCopy", { projectName, outputDir, webpackDist });
console.timeEnd("Step 4");
logSuccess("Dist copied");

// Step 5: Core files
console.time("Step 5");
runPluginsWithLog("beforeCoreFiles", { projectName, outputDir, webpackDist });

["./index.html", "./styles.css"].forEach((file) => {
  const destPath = path.join(outputDir, path.basename(file));
  if (!fs.existsSync(file)) {
    logInfo(`${file} not found, skipped`);
    return;
  }
  if (file === "./index.html") {
    let html = fs.readFileSync(file, "utf-8");
    html = html.replace(/<div id="bema-container"[^>]*style="[^"]*"([^>]*)>/i, '<div id="bema-container"$1>');
    html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${projectName}</title>`);
    html = html.replace(
      /<body([^>]*)>/i,
      `<body$1>\n<script>\n  window.currentPlatform = "${projectPlatform}";\n  window.projectName = "${projectName}";\n  window.projectVersion = "${projectVersion}";\n  window.projectAuthor = "${projectAuthor}";\n</script>`,
    );
    fs.writeFileSync(destPath, html, "utf-8");
    logSuccess("index.html modified with project name and platform");
  } else {
    fs.copyFileSync(file, destPath);
    logSuccess(`${file} copied`);
  }
});

runPluginsWithLog("afterCoreFiles", { projectName, outputDir, webpackDist });
console.timeEnd("Step 5");
logSuccess("Core files copied");

// Step 6: Assets
console.time("Step 6");
runPluginsWithLog("beforeAssets", { projectName, outputDir, webpackDist });
copyRecursive("./assets", path.join(outputDir, "assets"));
runPluginsWithLog("afterAssets", { projectName, outputDir, webpackDist });
console.timeEnd("Step 6");
logSuccess("Assets copied");

console.timeEnd("Total Build");
section("BUILD COMPLETE");
console.log("Output: ./index/");
