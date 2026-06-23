// Virtual file system for Threshold
// Simulates mounted drives, folders, files, extensions, and junctions.

(function () {
  const PATH_SEPARATOR = /[\\/]+/g;

  function now() {
    return Date.now();
  }

  function normalizePath(input) {
    let path = String(input || "").trim();
    path = path.replace(PATH_SEPARATOR, "/");

    if (/^[A-Za-z]:/.test(path)) {
      path = "/" + path[0].toUpperCase() + path.slice(2);
    }

    if (!path.startsWith("/")) {
      path = "/" + path;
    }

    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }

    return path === "" ? "/" : path;
  }

  function splitPath(path) {
    const normalized = normalizePath(path);
    return normalized
      .split("/")
      .filter((segment) => segment.length > 0);
  }

  function getExtensionFromName(name) {
    const dotIndex = name.lastIndexOf(".");
    if (dotIndex <= 0) return "";
    return name.slice(dotIndex + 1).toLowerCase();
  }

  function createFolderNode(name, metadata = {}) {
    return {
      name,
      type: "folder",
      children: {},
      created: now(),
      modified: now(),
      metadata: Object.assign({ hidden: false, system: false }, metadata),
    };
  }

  function createFileNode(name, content, metadata = {}) {
    return {
      name,
      type: "file",
      content: typeof content === "string" ? content : "",
      size: typeof content === "string" ? content.length : 0,
      extension: getExtensionFromName(name),
      created: now(),
      modified: now(),
      metadata: Object.assign({ hidden: false, readonly: false }, metadata),
    };
  }

  function createJunctionNode(name, targetPath, metadata = {}) {
    return {
      name,
      type: "junction",
      target: normalizePath(targetPath),
      created: now(),
      modified: now(),
      metadata: Object.assign({ hidden: false, system: false }, metadata),
    };
  }

  const root = createFolderNode("");
  root.metadata.root = true;

  const drives = {};

  function pathSegments(path) {
    const segments = splitPath(path);
    return segments.length === 0 ? [""] : segments;
  }

  function getNode(path, options = {}) {
    const followJunctions = options.followJunctions !== false;
    const normalized = normalizePath(path);
    const segments = splitPath(normalized);
    let current = root;
    let remaining = segments.slice();
    const visited = new Set();

    while (remaining.length > 0) {
      if (!current.children) return null;
      const segment = remaining.shift();
      const nextNode = current.children[segment];
      if (!nextNode) return null;

      if (nextNode.type === "junction" && followJunctions) {
        const junctionPath = nextNode.target;
        if (visited.has(junctionPath)) {
          throw new Error("Cyclic junction detected: " + junctionPath);
        }
        visited.add(junctionPath);
        const remainder = remaining.length > 0 ? "/" + remaining.join("/") : "";
        return getNode(junctionPath + remainder, { followJunctions: true });
      }

      current = nextNode;
    }

    return current;
  }

  function resolveParent(path) {
    const normalized = normalizePath(path);
    const segments = splitPath(normalized);
    if (segments.length === 0) {
      return { parent: root, name: "" };
    }

    const name = segments.pop();
    const parentPath = "/" + segments.join("/");
    const parent = segments.length === 0 ? root : getNode(parentPath, { followJunctions: false });
    return { parent, name };
  }

  function ensureFolder(path) {
    const normalized = normalizePath(path);
    const segments = splitPath(normalized);
    let current = root;

    while (segments.length > 0) {
      const segment = segments.shift();
      if (!current.children[segment]) {
        current.children[segment] = createFolderNode(segment);
      }
      const next = current.children[segment];
      if (next.type !== "folder" && next.type !== "drive") {
        throw new Error("Path component is not a folder: " + segment);
      }
      current = next;
    }

    return current;
  }

  function makeMetadata(node) {
    return {
      path: getPathForNode(node),
      name: node.name,
      type: node.type,
      extension: node.type === "file" ? node.extension : "",
      size: node.type === "file" ? node.size : 0,
      target: node.type === "junction" ? node.target : undefined,
      created: node.created,
      modified: node.modified,
      metadata: Object.assign({}, node.metadata),
    };
  }

  function getPathForNode(node) {
    if (node === root) return "/";
    const segments = [];
    let current = node;
    while (current && current !== root) {
      segments.unshift(current.name);
      current = current.parent;
    }
    return "/" + segments.join("/");
  }

  function attachParentLinks(node) {
    if (node && node.children) {
      for (const key in node.children) {
        const child = node.children[key];
        child.parent = node;
        if (child.children) {
          attachParentLinks(child);
        }
      }
    }
  }

  attachParentLinks(root);

  function updateModified(node) {
    if (!node) return;
    node.modified = now();
    if (node.parent) updateModified(node.parent);
  }

  const VirtualFileSystem = {
    root,
    drives,

    normalizePath,

    mountDrive(letter, displayName, options = {}) {
      if (!letter || typeof letter !== "string") {
        throw new Error("Drive letter is required.");
      }
      const driveLetter = letter[0].toUpperCase();
      const path = "/" + driveLetter;
      let driveNode = getNode(path, { followJunctions: false });

      if (driveNode && driveNode.type !== "drive") {
        throw new Error(`Path ${path} already exists and is not a drive.`);
      }

      if (!driveNode) {
        driveNode = createFolderNode(driveLetter, {
          driveLabel: displayName || driveLetter,
          removable: options.removable === true,
          type: options.type || "drive",
          driveLetter,
        });
        driveNode.type = "drive";
        root.children[driveLetter] = driveNode;
        driveNode.parent = root;
      }

      drives[driveLetter] = driveNode;

      if (Array.isArray(options.contents)) {
        options.contents.forEach((entry) => {
          if (entry.type === "folder") {
            VirtualFileSystem.createFolder(path + "/" + entry.path);
          } else if (entry.type === "file") {
            VirtualFileSystem.createFile(path + "/" + entry.path, entry.content || "", entry.metadata || {});
          } else if (entry.type === "junction") {
            VirtualFileSystem.createJunction(path + "/" + entry.path, entry.target, entry.metadata || {});
          }
        });
      }

      return driveNode;
    },

    unmountDrive(letter) {
      const driveLetter = String(letter || "").toUpperCase();
      if (!drives[driveLetter]) return false;
      delete root.children[driveLetter];
      delete drives[driveLetter];
      return true;
    },

    listDrives() {
      return Object.keys(drives).map((key) => ({
        driveLetter: key,
        label: drives[key].metadata.driveLabel,
        removable: !!drives[key].metadata.removable,
        path: "/" + key,
      }));
    },

    createFolder(path) {
      const normalized = normalizePath(path);
      const segments = splitPath(normalized);
      let current = root;

      while (segments.length > 0) {
        const segment = segments.shift();
        if (!current.children[segment]) {
          current.children[segment] = createFolderNode(segment);
          current.children[segment].parent = current;
          updateModified(current);
        }
        current = current.children[segment];
        if (current.type !== "folder" && current.type !== "drive") {
          throw new Error("Cannot create folder because a non-folder exists at " + segment);
        }
      }

      return current;
    },

    createFile(path, content = "", metadata = {}) {
      const normalized = normalizePath(path);
      const segments = splitPath(normalized);
      const name = segments.pop();
      const parentPath = "/" + segments.join("/");
      const parent = segments.length === 0 ? root : ensureFolder(parentPath);

      if (!parent.children) {
        parent.children = {};
      }

      if (parent.children[name] && parent.children[name].type !== "file") {
        throw new Error("A non-file entry already exists at " + normalized);
      }

      const fileNode = createFileNode(name, content, metadata);
      fileNode.parent = parent;
      parent.children[name] = fileNode;
      updateModified(parent);
      return fileNode;
    },

    createJunction(path, targetPath, metadata = {}) {
      const normalized = normalizePath(path);
      const segments = splitPath(normalized);
      const name = segments.pop();
      const parentPath = "/" + segments.join("/");
      const parent = segments.length === 0 ? root : ensureFolder(parentPath);

      if (!parent.children) {
        parent.children = {};
      }

      if (parent.children[name] && parent.children[name].type === "folder") {
        throw new Error("A folder already exists at junction location " + normalized);
      }

      const junctionNode = createJunctionNode(name, targetPath, metadata);
      junctionNode.parent = parent;
      parent.children[name] = junctionNode;
      updateModified(parent);
      return junctionNode;
    },

    list(path = "/") {
      const node = getNode(path, { followJunctions: false });
      if (!node) return null;
      if (node.type === "file") {
        return [makeMetadata(node)];
      }
      if (!node.children) return [];

      return Object.keys(node.children)
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
        .map((key) => makeMetadata(node.children[key]));
    },

    readFile(path) {
      const node = getNode(path, { followJunctions: true });
      if (!node || node.type !== "file") {
        throw new Error("File not found: " + path);
      }
      return node.content;
    },

    writeFile(path, content, options = {}) {
      const normalized = normalizePath(path);
      let node = getNode(normalized, { followJunctions: false });
      if (node && node.type !== "file") {
        throw new Error("Cannot write to non-file path: " + path);
      }

      if (!node) {
        node = VirtualFileSystem.createFile(normalized, content, options.metadata || {});
      } else {
        if (options.append) {
          node.content += String(content);
        } else {
          node.content = String(content);
        }
        node.size = node.content.length;
        node.modified = now();
        updateModified(node.parent);
      }

      return node;
    },

    exists(path) {
      return !!getNode(path, { followJunctions: false });
    },

    isFile(path) {
      const node = getNode(path, { followJunctions: true });
      return !!node && node.type === "file";
    },

    isFolder(path) {
      const node = getNode(path, { followJunctions: true });
      return !!node && (node.type === "folder" || node.type === "drive");
    },

    isJunction(path) {
      const node = getNode(path, { followJunctions: false });
      return !!node && node.type === "junction";
    },

    getStats(path) {
      const node = getNode(path, { followJunctions: false });
      if (!node) return null;
      return makeMetadata(node);
    },

    getExtension(path) {
      const node = getNode(path, { followJunctions: false });
      if (!node) return "";
      if (node.type === "file") return node.extension;
      return getExtensionFromName(node.name || "");
    },

    resolvePath(path) {
      const node = getNode(path, { followJunctions: true });
      return node ? getPathForNode(node) : null;
    },

    plugFlashDrive(letter, displayName, initialEntries = []) {
      return VirtualFileSystem.mountDrive(letter, displayName, {
        removable: true,
        type: "flash",
        contents: initialEntries,
      });
    },

    unplugFlashDrive(letter) {
      return VirtualFileSystem.unmountDrive(letter);
    },
  };

  VirtualFileSystem.mountDrive("C", "System", { removable: false, type: "system" });
  VirtualFileSystem.mountDrive("F", "FLASH", {
    removable: true,
    type: "flash",
    contents: [
      { type: "folder", path: "Documents" },
      { type: "file", path: "Documents/README.txt", content: "Welcome to the virtual flash drive!\n" },
      { type: "file", path: "Notes/note.txt", content: "This file system supports folders, files, and junctions.\n" },
      { type: "junction", path: "MyDocs", target: "F:/Documents" },
    ],
  });

  Object.defineProperty(window, "VirtualFileSystem", {
    value: VirtualFileSystem,
    writable: false,
    configurable: false,
  });
})();
