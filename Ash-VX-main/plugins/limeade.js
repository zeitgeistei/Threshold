const fs = require("fs");
const path = require("path");
const JavaScriptObfuscator = require("javascript-obfuscator");

const META_PATH = path.join(process.cwd(), ".build-meta.json");
const BOOT_FILE = path.join(process.cwd(), "src", "!FemBoyBoot.js");
const OUTPUT_BUNDLE = path.join(process.cwd(), "dist", "combined.bundle.js");

function prompt(question, defaultValue) {
  const promptText = defaultValue !== undefined ? `${question} (${defaultValue}): ` : `${question}: `;
  if (!process.stdin.isTTY) {
    return defaultValue;
  }
  process.stdout.write(promptText);
  const buffer = Buffer.alloc(1024);
  let bytes = 0;
  try {
    bytes = fs.readSync(0, buffer, 0, 1024, null);
  } catch (err) {
    return defaultValue;
  }
  const answer = buffer.slice(0, bytes).toString("utf8").replace(/\r?\n$/, "").trim();
  if (answer === "") {
    return defaultValue;
  }
  return answer;
}

function parseVersion(versionString) {
  const segments = String(versionString || "").trim().split(".").map((value) => parseInt(value, 10));
  const major = Number.isFinite(segments[0]) ? segments[0] : 1;
  const minor = Number.isFinite(segments[1]) ? segments[1] : 0;
  const patch = Number.isFinite(segments[2]) ? segments[2] : 0;
  return { major, minor, patch, raw: `${major}.${minor}.${patch}` };
}

function makeSystemVersion(version, isDeveloper) {
  let index = ((version.major & 0xffff) << 16) | (version.minor & 0xffff);
  if (isDeveloper) {
    index = index | 0x80000000;
  }
  return index >>> 0;
}

function readMeta() {
  try {
    const data = fs.readFileSync(META_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return { buildNumber: 0, lastVersion: "0.0.0", lastDeveloper: false, lastExpirationDays: 0 };
  }
}

function writeMeta(meta) {
  try {
    fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2), "utf8");
  } catch (error) {
    console.error("[build-expiration-obfuscator] Failed to save build metadata:", error.message);
  }
}

function makeExpirationBlock(meta) {
  const wrappedExpiry = `var BuildVersion = "${meta.version}";
var BuildNumber = ${meta.buildNumber};
var BuildTimestamp = ${meta.buildTimestamp};
var BuildExpiration = ${meta.expirationTimestamp};
var BuildExpirationDays = ${meta.expirationDays};

function __AshBuildExpirationCheck() {
  if (Date.now() > BuildExpiration) {
    throw new Error("Build expired.");
  }
}
__AshBuildExpirationCheck();\n`;
  return wrappedExpiry;
}

function updateBootFile(buildMeta) {
  if (!fs.existsSync(BOOT_FILE)) {
    throw new Error(`Boot file not found: ${BOOT_FILE}`);
  }

  let code = fs.readFileSync(BOOT_FILE, "utf8");

  const versionLine = `var SystemVersion = 0x${buildMeta.systemVersion.toString(16).toUpperCase()};`;
  const subverLine = `var SystemSubver = 0x${buildMeta.systemSubver.toString(16).padStart(4, "0").toUpperCase()};`;

  code = code.replace(/var\s+SystemVersion\s*=\s*0x[0-9A-Fa-f]+\s*;\s*/, versionLine + "\n");
  code = code.replace(/var\s+SystemSubver\s*=\s*0x[0-9A-Fa-f]+\s*;\s*/, subverLine + "\n");

  // Remove any existing build expiration block inserted by this plugin.
  code = code.replace(/\n*var BuildVersion = [\s\S]*?__AshBuildExpirationCheck\(\);\s*/g, "\n");

  const insertionPoint = code.indexOf(subverLine);
  if (insertionPoint === -1) {
    throw new Error("Failed to locate SystemSubver declaration in !FemBoyBoot.js");
  }

  const insertAfter = code.indexOf(";", insertionPoint) + 1;
  const before = code.slice(0, insertAfter);
  const after = code.slice(insertAfter);
  code = `${before}\n${makeExpirationBlock(buildMeta)}${after}`;

  fs.writeFileSync(BOOT_FILE, code, "utf8");
}

function obfuscateBundle() {
  if (!fs.existsSync(OUTPUT_BUNDLE)) {
    console.warn("[build-expiration-obfuscator] Output bundle not found, skipping obfuscation.");
    return;
  }

  try {
    const sourceCode = fs.readFileSync(OUTPUT_BUNDLE, "utf8");
    const obfuscated = JavaScriptObfuscator.obfuscate(sourceCode, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.9,
      debugProtection: true,
      debugProtectionInterval: true,
      disableConsoleOutput: true,
      stringArray: true,
      stringArrayEncoding: ["rc4"],
      stringArrayThreshold: 1,
      transformObjectKeys: true,
      rotateStringArray: true,
      unicodeEscapeSequence: true,
      simplify: true,
      splitStrings: true,
      splitStringsChunkLength: 10,
      numbersToExpressions: true,
      shuffleStringArray: true,
      renameGlobals: false,
      selfDefending: true,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersCount: 2,
      stringArrayWrappersType: "function",
      stringArrayThreshold: 1,
    });

    fs.writeFileSync(OUTPUT_BUNDLE, obfuscated.getObfuscatedCode(), "utf8");
    console.log("[build-expiration-obfuscator] Obfuscation complete.");
  } catch (error) {
    console.error("[build-expiration-obfuscator] Obfuscation failed:", error.message);
  }
}

function stepBeforeCombine() {
  const lastMeta = readMeta();
  const versionAnswer = prompt("Enter build version", lastMeta.lastVersion || "1.0.0");
  const developedAnswer = prompt("Developer build? (yes/no)", lastMeta.lastDeveloper ? "yes" : "no");
  const expirationDaysAnswer = prompt("Build expiration days", lastMeta.lastExpirationDays);

  const versionInfo = parseVersion(versionAnswer || lastMeta.lastVersion || "1.0.0");
  const isDeveloper = String(developedAnswer || "no").trim().toLowerCase().startsWith("y");
  const expirationDays = Math.max(1, Math.min(365, parseInt(expirationDaysAnswer, 10) || 0));

  const buildMeta = {
    buildNumber: (lastMeta.buildNumber || 0) + 1,
    version: versionInfo.raw,
    developer: isDeveloper,
    expirationDays,
    systemVersion: makeSystemVersion(versionInfo, isDeveloper),
    systemSubver: 0x0000,
    buildTimestamp: Date.now(),
    expirationTimestamp: Date.now() + expirationDays * 24 * 60 * 60 * 1000,
    lastVersion: versionInfo.raw,
    lastDeveloper: isDeveloper,
    lastExpirationDays: expirationDays,
  };

  updateBootFile(buildMeta);
  writeMeta(buildMeta);
  console.log(`[build-expiration-obfuscator] Updated !FemBoyBoot.js for version ${buildMeta.version} (${isDeveloper ? "developer" : "retail"}) and build #${buildMeta.buildNumber}.`);
}

function stepAfterWebpack() {
  obfuscateBundle();
}

module.exports = {
  name: "build-expiration-obfuscator",
  beforeCombineScripts() {
    stepBeforeCombine();
  },
  afterWebpack() {
    stepAfterWebpack();
  },
};
