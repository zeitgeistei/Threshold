// LoggingFramework.js
// Provides static console logging and animated loading spinners in both ASCII and braille styles.

const ASCII_FRAMES = ["-", "/", "|", "\\"];
const BRAILLE_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const ICONS = {
  info: "-",
  event: "•",
  success: "✓",
  error: "✗",
};

function isNodeTTY() {
  return (
    typeof process !== "undefined" &&
    process.stdout &&
    typeof process.stdout.write === "function" &&
    process.stdout.isTTY
  );
}

function isBrowserConsole() {
  return (
    typeof window !== "undefined" &&
    typeof console !== "undefined" &&
    typeof console.clear === "function"
  );
}

function formatLog(type, message) {
  const icon = ICONS[type] || ICONS.info;
  return `${icon} ${message}`;
}

function logStatic(message, type = "info") {
  const output = formatLog(type, message);
  if (type === "error") {
    console.error(output);
  } else {
    console.log(output);
  }
}

function clearCurrentLine() {
  if (isNodeTTY()) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  } else if (isBrowserConsole()) {
    console.clear();
  }
}

function writeLine(text) {
  if (isNodeTTY()) {
    process.stdout.write(text);
  } else {
    console.log(text);
  }
}

function startLoading(message, options = {}) {
  const style = options.style === "braille" ? "braille" : "ascii";
  const frames = style === "braille" ? BRAILLE_FRAMES : ASCII_FRAMES;
  const intervalMs = typeof options.interval === "number" ? options.interval : 100;
  let frameIndex = 0;
  let active = true;
  let currentMessage = message || "Loading";

  function render() {
    if (!active) return;
    const frame = frames[frameIndex];
    frameIndex = (frameIndex + 1) % frames.length;
    const line = `${currentMessage} ${frame}`;
    if (isNodeTTY()) {
      clearCurrentLine();
      writeLine(line);
    } else if (isBrowserConsole()) {
      clearCurrentLine();
      console.log(line);
    } else {
      console.log(line);
    }
  }

  const timer = setInterval(render, intervalMs);
  render();

  function stop(finalText, type = "event") {
    if (!active) return;
    active = false;
    clearInterval(timer);
    clearCurrentLine();
    if (finalText !== false) {
      const output = typeof finalText === "string" ? finalText : currentMessage;
      logStatic(output, type);
    }
  }

  return {
    update(messageText) {
      if (typeof messageText === "string") {
        currentMessage = messageText;
      }
    },
    succeed(finalText) {
      stop(finalText || `${currentMessage} complete`, "success");
    },
    fail(finalText) {
      stop(finalText || `${currentMessage} failed`, "error");
    },
    stop,
  };
}

const LoggingFramework = {
  log: (message) => logStatic(message, "event"),
  info: (message) => logStatic(message, "info"),
  success: (message) => logStatic(message, "success"),
  error: (message) => logStatic(message, "error"),
  startLoading,
  startAsciiLoading: (message, options = {}) => startLoading(message, { ...options, style: "ascii" }),
  startBrailleLoading: (message, options = {}) => startLoading(message, { ...options, style: "braille" }),
};

module.exports = LoggingFramework;
