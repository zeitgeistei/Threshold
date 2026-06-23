# Ash VX

Welcome to the clearly choice (no shame on m0cha but I added some comfort features long overdue).

## Getting Started

1. Clone the repo and `cd` into the project folder.
2. Install dependencies:

```bash
npm i
```

## .ashproject

```json
{
    "name": "MyCoolAshProject",
    "platform": "phone",
    "version": "1.0.0",
    "author": "you",
    "description": "What your project does"
}
```

* **name** — the project name. Becomes the `<title>` and `window.projectName`.
* **platform** — `"phone"`, `"desktop"`, or `"corg"`. Controls screen aspect ratio. Readable as `window.currentPlatform`.
* **version** *(optional)* — semver string, exposed as `window.projectVersion`.
* **author** *(optional)* — your name, exposed as `window.projectAuthor`.
* **description** *(optional)* — free-text description shown nowhere yet, but good for docs.

> **Backwards compatible:** old projects that used a `"desktop": true/false` boolean will be auto-migrated to the new `"platform"` string on the next build. No manual edits needed.

## Building

| Command | What it does |
|---|---|
| `node build` | Fast build — re-compiles only `src/` into `dist/`, copies to `index/dist/`. |
| `node build all` | Full build — rebuilds everything and writes the complete `index/` output. |
| `node build clean` | Deletes `dist/`, `index/`, and `combined.js`. |
| `node build help` | Prints command reference. |
| `node build --watch` | Re-runs combine + webpack automatically whenever a `src/` file changes. |
| `node build all --watch` | Same, but triggers a full build on every change. |

Output is always written to `./index/`.

## Project Structure

```txt
Ash/
├── .ashproject            # Project config (name, platform, version, author…)
├── .ashproject.example    # Template for first-time setup
├── assets/                # Static files copied into index/assets/ on full build
├── src/                   # Your source files (compiled alphabetically, recursively)
├── lib/                   # Framework libraries (bema.js, commands.js, aea.js, …)
│   └── commands.js        # Core helpers: onEvent, playSound, timedLoop, …
├── plugins/               # Build-level plugins (JS files run at specific hooks)
│   └── add-log.js         # Sample plugin
├── combine-scripts.js     # Merges lib/ and src/ into combined.js
├── build.js               # Main build script
├── index.html             # HTML entry point (do not modify directly)
├── styles.css             # Global styles (do not modify directly — use a plugin)
├── package.json           # Dependencies
└── webpack.config.js      # Webpack config
```

## Build Plugins

Plugins live in `plugins/` and are plain Node.js modules that export named hook functions. Available hooks (in order of execution):

```
beforeCombineScripts  afterCombineScripts
beforeWebpack         afterWebpack
beforeOutputFolder    afterOutputFolder   (full build only)
beforeDistCopy        afterDistCopy
beforeCoreFiles       afterCoreFiles      (full build only)
beforeAssets          afterAssets         (full build only)
```

Each hook receives a context object: `{ projectName, outputDir, webpackDist }`.

Example plugin (`plugins/my-plugin.js`):

```js
module.exports = {
  name: "my-plugin",
  afterCombineScripts({ projectName }) {
    const fs = require("fs");
    let code = fs.readFileSync("./combined.js", "utf-8");
    code = `/* built for ${projectName} */\n` + code;
    fs.writeFileSync("./combined.js", code, "utf-8");
  },
};
```

## Compatibility Notes

* **Old `"desktop": true/false`** in `.ashproject` is auto-migrated to `"platform": "desktop"/"phone"` on next build.
* All existing `lib/` libraries (`bema.js`, `aea.js`, `commands.js`, `openbundles.js`, `aes256.js`) are unchanged — any project already using them will work as-is.
* The `src/` compile order (lib first, then src, both alphabetical) is identical to before.
