console.log("Hewwo from the sample plugin!~ \n\nto remove me delete /plugins/add-log.js \n\nUwU~");
document.addEventListener("DOMContentLoaded", function() {

/* === lib: lib\aea.js === */
// Ash Element API
function AEA({ type, id, position = { x: 0, y: 0 }, size = { width: 100, height: 40 }, border = { width: 0, color: "transparent", radius: 0 }, colors = { bg: "transparent", text: "#000" }, text = { content: "", align: "left", size: 14, font: "sans-serif" }, readOnly = false, imageUrl = null, classNames = "", css = {} }) {
  let element;

  //
  // --- ELEMENT CREATION ---
  //
  if (type === "Button") {
    element = document.createElement("button");
  } else if (type === "Image") {
    element = document.createElement("img");
  } else if (type === "Input") {
    element = document.createElement("input");
    element.type = "text";
  } else if (type === "TextArea") {
    element = document.createElement("textarea");
  } else {
    element = document.createElement(type);
  }

  element.id = id;

  //1
  // --- POSITION & SIZE ---
  //
  element.style.position = "absolute";
  element.style.left = `${position.x}px`;
  element.style.top = `${position.y}px`;
  element.style.width = `${size.width}px`;
  element.style.height = `${size.height}px`;

  //
  // --- BORDER ---
  //
  element.style.borderStyle = "solid";
  element.style.borderWidth = `${border.width}px`;
  element.style.borderColor = border.color;
  element.style.borderRadius = `${border.radius}px`;

  //
  // --- COLORS ---
  //
  element.style.backgroundColor = colors.bg;
  element.style.color = colors.text;

  //
  // --- TEXT STYLE ---
  //
  element.style.textAlign = text.align;
  element.style.fontSize = `${text.size}px`;
  element.style.fontFamily = text.font;

  //
  // --- CUSTOM CLASSES ---
  //
  if (classNames) {
    const classes = classNames.split(" ").filter(Boolean);
    element.classList.add(...classes);
  }

  //
  // --- CUSTOM CSS ---
  //
  Object.assign(element.style, css);

  //
  // --- READ ONLY ---
  //
  if (readOnly) {
    element.style.userSelect = "none";
    element.style.pointerEvents = "none";
    element.style.setProperty("cursor", "default", "important");
    element.style.overflow = "hidden"; // Prevent scrolling
  }

  // All elements clickable unless overridden
  element.style.pointerEvents = "auto";

  //
  // --- TYPE-SPECIFIC BEHAVIOR ---
  //

  // BUTTON
  if (type === "Button") {
    element.style.cursor = "pointer";

    const img = document.createElement("img");
    img.id = `${id}-img`;

    img.src = imageUrl ? imageUrl : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

    // Filter img-classes
    const filtered = classNames.split(" ").filter((c) => c.startsWith("img-"));
    if (filtered.length) img.classList.add(...filtered);

    img.style.width = "100%";
    img.style.height = "100%";
    img.style.borderRadius = `${border.radius}px`;

    element.appendChild(img);

    if (text.content) {
      element.textContent = text.content;
    }
  }

  // IMAGE
  else if (type === "Image") {
    if (imageUrl) {
      element.src = imageUrl;
      element.style.width = "100%";
      element.style.height = "100%";
      element.style.objectFit = "fill";
    }
  }

  // TEXTAREA
  else if (type === "TextArea") {
    element.value = text.content;

    element.style.outline = "none";
    element.style.display = "flex";
    element.style.alignItems = "center";
    element.style.justifyContent = "center";

    if (readOnly) {
      element.style.userSelect = "none";
      element.style.pointerEvents = "none";
      element.style.setProperty("cursor", "default", "important");
      element.style.overflow = "hidden"; // Prevent scrolling
    } else {
      element.style.cursor = "text";
    }
  }

  // INPUT
  else if (type === "Input") {
    element.placeholder = text.content;
    element.style.cursor = readOnly ? "default" : "text";
  }

  // OTHER TYPES
  else {
    element.style.cursor = "default";
  }

  //
  // --- MOUNT ---
  //
  const container = document.getElementById("bema-container");
  if (container) {
    container.appendChild(element);
  } else {
    console.error("bema-container not found");
  }
}

/**
 * Attaches an event listener to an element.
 *
 * @param {string} id - The ID of the element to attach the event to, or `"document"` for the full screen.
 * @param {string} event - The event type to listen for (e.g. `"click"`, `"keydown"`, `"input"`).
 * @param {(e: Event) => void} callback - The function to call when the event is triggered.
 *
 * @example
 * onEvent('myButton', 'click', (e) => {
 *   console.log('Button clicked!', e);
 * });
 *
 * @example
 * onEvent('document', 'keydown', (e) => {
 *   console.log('Key pressed:', e.key);
 * });
 */
function onEvent(id, event, callback) {
  let target = id === "document" ? document : document.getElementById(id);

  if (target) {
    target.addEventListener(event, (e) => callback(e));
  } else {
    console.warn(`Element with id '${id}' not found. Event '${event}' not attached.`);
  }
}

/**
 * Simulates a user click on an element by dispatching a `MouseEvent`.
 *
 * @param {string} elementId - The ID of the target element to simulate a click on.
 *
 * @example
 * // Simulates a click on a button with ID "myButton"
 * simulateClick('myButton');
 *
 * @example
 * // Logs an error if the element doesn't exist
 * simulateClick('nonexistentId');
 */
function simulateClick(elementId) {
  const event = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  const element = document.getElementById(elementId);
  if (element) {
    element.dispatchEvent(event);
  } else {
    console.error(`Element with ID "${elementId}" not found.`);
  }
}

/**
 * Sets the text content or value of an element by its ID.
 *
 * @param {string} elementId - The ID of the target element.
 * @param {string} text - The text to set inside the element.
 *
 * @example
 * setText('username', 'Guest');
 */
function setText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    if (element.tagName === "TEXTAREA" || element.tagName === "INPUT") {
      element.value = text;
    } else {
      element.innerText = text;
    }
  } else {
    console.log(`Element not found: ${elementId}`);
  }
}

/**
 * Gets the text content or value of an element by its ID.
 *
 * @param {string} elementId - The ID of the element to read text from.
 * @returns {string} The current text or value of the element, or an empty string if not found.
 *
 * @example
 * const username = getText('username');
 */
function getText(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      return element.value;
    } else {
      return element.innerText || element.textContent;
    }
  }
  return "";
}

/**
 * Deletes an element by its ID.
 *
 * @param {string} elementId - The ID of the element to remove.
 *
 * @example
 * deleteElement('myUglyButton');
 */
function deleteElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.remove();
  }
}

/**
 * Sets a CSS property or an image source on an element.
 *
 * @param {string} elementId - The ID of the target element.
 * @param {string} property - The property to set. Use `"image"` to set an image src.
 * @param {string} value - The value to assign to the property or image.
 *
 * @example
 * // Set background color
 * setProperty('myButton', 'background-color', 'red');
 *
 * @example
 * // Set button image
 * setProperty('myButton', 'image', 'image.png');
 */
function setProperty(elementId, property, value) {
  const element = document.getElementById(elementId);
  if (element) {
    if (property === "image") {
      const imgElement = element.tagName === "BUTTON" ? element.querySelector("img") : element;
      if (imgElement) {
        imgElement.src = value;
      }
    } else {
      element.style.setProperty(property, value);
    }
  }
}

/**
 * Gets a CSS property or image source from a element.
 *
 * @param {string} elementId - The ID of the element to query.
 * @param {string} property - The property to get. Use `"image"` to get an image src.
 * @returns {string|undefined} The current value of the property, or `undefined` if not found.
 *
 * @example
 * const bgColor = getProperty('myButton', 'background-color');
 *
 * @example
 * const imgSrc = getProperty('myButton', 'image');
 */
function getProperty(elementId, property) {
  const element = document.getElementById(elementId);
  if (element) {
    if (property === "image") {
      return element.tagName === "BUTTON" ? element.src + "-img" : element.src;
    } else {
      return element.style.getPropertyValue(property);
    }
  }
}

/**
 * Shows an element.
 * @param {string} elementId - The ID of the element to show.
 */
function showElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = "block";
  }
}

/**
 * Hides an element.
 * @param {string} elementId - The ID of the element to hide.
 */
function hideElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = "none";
  }
}

/**
 * Sets the position of an element.
 *
 * @param {string} elementId - The ID of the element to position.
 * @param {number} x - The horizontal position in pixels.
 * @param {number} y - The vertical position in pixels.
 *
 * @example
 * setPosition('myButton', 100, 200);
 */
function setPosition(elementId, x, y) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id '${elementId}' not found in setPosition.`);
    return;
  }
  x = isNaN(x) ? 0 : x;
  y = isNaN(y) ? 0 : y;
  element.style.position = "absolute";
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
}

/**
 * Gets the X (horizontal) position of an element.
 *
 * @param {string} elementId - The ID of the element.
 * @returns {number} The X position in pixels, or 0 if the element is not found.
 *
 * @example
 * const x = getXPosition('myButton');
 */
function getXPosition(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id '${elementId}' not found in getXPosition.`);
    return 0;
  }
  const rect = element.getBoundingClientRect();
  return rect.left;
}

/**
 * Gets the Y (vertical) position of an element.
 *
 * @param {string} elementId - The ID of the element.
 * @returns {number} The Y position in pixels, or 0 if the element is not found.
 *
 * @example
 * const y = getYPosition('myButton');
 */
function getYPosition(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id '${elementId}' not found in getYPosition.`);
    return 0;
  }
  const rect = element.getBoundingClientRect();
  return rect.top;
}

/**
 * Sets the width and height of an element.
 *
 * @param {string} elementId - The ID of the element to resize.
 * @param {number} width - The width in pixels.
 * @param {number} height - The height in pixels.
 *
 * @example
 * setSize('myButton', 200, 150);
 */
function setSize(elementId, width, height) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
  } else {
    console.warn(`Element with id '${elementId}' not found.`);
  }
}


/* === lib: lib\aes256.js === */
// AES-256 Encryption Implementation
// Note: AES-256 encryption is the government standard
// for TOP SECRET data.
//
// Modified from http://www.movable-type.co.uk/scripts/aes.html

/**
 * AES Cipher
 *
 * For a description of the AES algorithm, see:
 * https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 *
 * @param input - 16 byte input array
 * @param keySchedule - Two dimensional byte array
 */
function cipher(input, keySchedule) {
  var blocksize = 4;
  var numberOfRounds = keySchedule.length / blocksize - 1;

  // Initialize state array
  var state = [[], [], [], []];
  for (var i = 0; i < 4 * blocksize; i++) {
    state[i % 4][Math.floor(i / 4)] = input[i];
  }

  // Perform encryption rounds
  state = addRoundKey(state, keySchedule, 0, blocksize);
  for (var round = 1; round < numberOfRounds; round++) {
    state = subBytes(state, blocksize);
    state = shiftRows(state, blocksize);
    state = mixColumns(state);
    state = addRoundKey(state, keySchedule, round, blocksize);
  }
  state = subBytes(state, blocksize);
  state = shiftRows(state, blocksize);
  state = addRoundKey(state, keySchedule, numberOfRounds, blocksize);

  // Convert state, which is a 2-d array, into a 1-d array
  // and return it.
  var output = new Array(4 * blocksize);
  for (var i = 0; i < 4 * blocksize; i++) {
    output[i] = state[i % 4][Math.floor(i / 4)];
  }
  return output;
}

/**
 * Generates a key schedule from a cipher key.
 *
 * For a description of the key schedule, see:
 * https://en.wikipedia.org/wiki/Rijndael_key_schedule
 */
function keyExpansion(key) {
  var blocksize = 4;
  var keyLength = key.length / 4; // Convert bytes to words
  var numberOfRounds = keyLength + 6;

  // Initialize empty key schedule
  var keySchedule = new Array(blocksize * (numberOfRounds + 1));

  // Initialize first `keyLength` words with cipher key
  for (var i = 0; i < keyLength; i++) {
    var r = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
    keySchedule[i] = r;
  }

  // Expand the key into the remainder of the schedule
  var substitutionCount = blocksize * (numberOfRounds + 1);
  for (var i = keyLength; i < substitutionCount; i++) {
    // Fill in temp array
    var temp = new Array(4);
    for (var t = 0; t < 4; t++) {
      temp[t] = keySchedule[i - 1][t];
    }

    if (i % keyLength == 0) {
      temp = subWord(rotWord(temp));
      for (var t = 0; t < 4; t++) {
        temp[t] ^= rCon[i / keyLength][t];
      }
    } else if (keyLength > 6 && i % keyLength == 4) {
      temp = subWord(temp);
    }

    // Mix temp array into key schedule
    keySchedule[i] = new Array(4);
    for (var t = 0; t < 4; t++) {
      keySchedule[i][t] = keySchedule[i - keyLength][t] ^ temp[t];
    }
  }

  return keySchedule;
}

/**
 * Apply SBox to state.
 *
 * See: https://en.wikipedia.org/wiki/Advanced_Encryption_Standard#The_SubBytes_step
 */
function subBytes(state, blocksize) {
  for (var row = 0; row < 4; row++) {
    for (var column = 0; column < blocksize; column++) {
      state[row][column] = sBox[state[row][column]];
    }
  }
  return state;
}

/**
 * Shift each i'th row by i bytes to the left.
 *
 * See: https://en.wikipedia.org/wiki/Advanced_Encryption_Standard#The_ShiftRows_step
 */
function shiftRows(state, blocksize) {
  for (var row = 1; row < 4; row++) {
    var temp = new Array(4);
    for (var column = 0; column < 4; column++) {
      temp[column] = state[row][(column + row) % blocksize];
    }
    for (var column = 0; column < 4; column++) {
      state[row][column] = temp[column];
    }
  }
  return state;
}

/**
 * Combine bytes of each column.
 *
 * See: https://en.wikipedia.org/wiki/Advanced_Encryption_Standard#The_MixColumns_step
 */
function mixColumns(state) {
  for (var column = 0; column < 4; column++) {
    var a = new Array(4);
    var b = new Array(4);
    for (var i = 0; i < 4; i++) {
      a[i] = state[i][column];
      b[i] = state[i][column] & 0x80 ? (state[i][column] << 1) ^ 0x011b : state[i][column] << 1;
    }
    state[0][column] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3];
    state[1][column] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3];
    state[2][column] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3];
    state[3][column] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3];
  }
  return state;
}

/**
 * Xor Round Key into state.
 *
 * See: https://en.wikipedia.org/wiki/Advanced_Encryption_Standard#The_AddRoundKey_step
 */
function addRoundKey(state, keySchedule, round, blocksize) {
  for (var row = 0; row < 4; row++) {
    for (var column = 0; column < blocksize; column++) {
      state[row][column] ^= keySchedule[round * 4 + column][row];
    }
  }
  return state;
}

/**
 * Apply sBox to 4-byte word.
 */
function subWord(word) {
  for (var i = 0; i < 4; i++) {
    word[i] = sBox[word[i]];
  }
  return word;
}

/**
 * Rotate 4-byte word left by one byte.
 */
function rotWord(word) {
  var temp = word[0];
  for (var i = 0; i < 3; i++) {
    word[i] = word[i + 1];
  }
  word[3] = temp;
  return word;
}

// For an explanation of S-Box, see: https://en.wikipedia.org/wiki/Rijndael_S-box
var sBox = [
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15, 0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf, 0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73, 0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06,
  0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08, 0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a, 0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf, 0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
];

// A round constant used for key expansion
var rCon = [
  [0x00, 0x00, 0x00, 0x00],
  [0x01, 0x00, 0x00, 0x00],
  [0x02, 0x00, 0x00, 0x00],
  [0x04, 0x00, 0x00, 0x00],
  [0x08, 0x00, 0x00, 0x00],
  [0x10, 0x00, 0x00, 0x00],
  [0x20, 0x00, 0x00, 0x00],
  [0x40, 0x00, 0x00, 0x00],
  [0x80, 0x00, 0x00, 0x00],
  [0x1b, 0x00, 0x00, 0x00],
  [0x36, 0x00, 0x00, 0x00],
];

/**
 * Converts a password into an encrypted key.
 * A Hashed (sha-256) key would be preferred but encrypting
 * the password using itself as the key is sufficient.
 */
function keyFromPassword(passwordarst) {
  if (!passwordarst || passwordarst.length === 0) {
    throw new Error("password is undefined or empty");
  }

  var bits = 256;
  var bytes = bits / 8;
  var passwordBytes = new Array(bytes);

  for (var i = 0; i < bytes; i++) {
    passwordBytes[i] = isNaN(passwordarst[i]) ? 0 : getCharCode(passwordarst[i]);
  }

  var key = cipher(passwordBytes, keyExpansion(passwordBytes));
  return key.concat(key.slice(0, bytes - 16));
}
function kkeyFromPassword() {
  return [220, 149, 192, 120, 162, 64, 137, 137, 173, 72, 162, 20, 146, 132, 32, 135, 220, 149, 192, 120, 162, 64, 137, 137, 173, 72, 162, 20, 146, 132, 32, 135];
}

// Helper function to get character code without using charCodeAt
function getCharCode(char) {
  return char.charCodeAt(0);
}

/**
 * Given a message and a password, returns an encrypted version
 * of the message using AES-256.
 */
function encrypt(plaintext, password) {
  var blockSize = 16;
  var key = keyFromPassword(password);

  // Initialize the first 8 bytes of the counter with a nonce.
  var counterBlock = new Array(blockSize);
  var nonce = new Date().getTime();
  var nonceMilliseconds = nonce % 1000;
  var nonceSeconds = Math.floor(nonce / 1000);
  var nonceRandom = Math.floor(Math.random() * 0xffff);

  for (var i = 0; i < 2; i++) {
    counterBlock[i] = (nonceMilliseconds >>> (i * 8)) & 0xff;
  }
  for (var i = 0; i < 2; i++) {
    counterBlock[i + 2] = (nonceRandom >>> (i * 8)) & 0xff;
  }
  for (var i = 0; i < 4; i++) {
    counterBlock[i + 4] = (nonceSeconds >>> (i * 8)) & 0xff;
  }

  // Convert the counter to a string to be prepended on the
  // ciphertext.
  var counter = "";
  for (var i = 0; i < 8; i++) {
    counter += String.fromCharCode(counterBlock[i]);
  }

  var keySchedule = keyExpansion(key);
  var blockCount = Math.ceil(plaintext.length / blockSize);
  var ciphertext = new Array(blockCount);
  for (var block = 0; block < blockCount; block++) {
    for (var c = 0; c < 4; c++) {
      counterBlock[15 - c] = (block >>> (c * 8)) & 0xff;
    }
    for (var c = 0; c < 4; c++) {
      counterBlock[15 - c - 4] = (block / 0x100000000) >>> (c * 8);
    }
    var cipherCntr = cipher(counterBlock, keySchedule);
    var blockLength = block < blockCount - 1 ? blockSize : ((plaintext.length - 1) % blockSize) + 1;
    var cipherChar = new Array(blockLength);
    for (var i = 0; i < blockLength; i++) {
      cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(block * blockSize + i);
      cipherChar[i] = String.fromCharCode(cipherChar[i]);
    }
    ciphertext[block] = cipherChar.join("");
  }
  var ciphertext = counter + ciphertext.join("");
  return encode(ciphertext);
}

/**
 * Given an encrypted message and a password, returns a decrypted version
 * using AES-256.
 */
function decrypt(ciphertext, password) {
  var blockSize = 16;
  var key = keyFromPassword(password);

  var counterBlock = new Array(8);
  ciphertext = decode(String(ciphertext));

  var ctrTxt = ciphertext.slice(0, 8);
  for (var i = 0; i < 8; i++) {
    counterBlock[i] = ctrTxt.charCodeAt(i);
  }

  var keySchedule = keyExpansion(key);
  var blockCount = Math.ceil((ciphertext.length - 8) / blockSize);
  var ct = new Array(blockCount);
  for (var block = 0; block < blockCount; block++) {
    ct[block] = ciphertext.slice(8 + block * blockSize, 8 + block * blockSize + blockSize);
  }
  ciphertext = ct;

  var plaintext = new Array(ciphertext.length);
  for (var block = 0; block < blockCount; block++) {
    for (var c = 0; c < 4; c++) {
      counterBlock[15 - c] = (block >>> (c * 8)) & 0xff;
    }
    for (var c = 0; c < 4; c++) {
      counterBlock[15 - c - 4] = (((block + 1) / 0x100000000 - 1) >>> (c * 8)) & 0xff;
    }
    var cipherCntr = cipher(counterBlock, keySchedule);
    var plaintxtByte = new Array(ciphertext[block].length);
    for (var i = 0; i < ciphertext[block].length; i++) {
      plaintxtByte[i] = cipherCntr[i] ^ ciphertext[block].charCodeAt(i);
      plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
    }
    plaintext[block] = plaintxtByte.join("");
  }
  return plaintext.join("");
}

// Given a non-negative integer, converts it to hex.
// Note: The resultant string will always be prefixed with a '0'
function toHex(number) {
  var alphabet = "0123456789abcdef";
  var size = alphabet.length;
  if (number == 0) {
    return alphabet[0];
  }
  return toHex(Math.floor(number / size)) + alphabet[number % size];
}

// Given a string of hex characters, converts it to an integer.
function fromHex(string) {
  var alphabet = "0123456789abcdef";
  var size = alphabet.length;

  var sum = 0;
  for (var i = 0; i < string.length; i++) {
    var val = alphabet.indexOf(string[i]);
    var pow = Math.pow(size, string.length - i - 1);
    sum += val * pow;
  }

  return sum;
}

// Encodes a string of bytes into a '-' delimited string
// of hex numbers.
function encode(string) {
  var vals = [];
  for (var i = 0; i < string.length; i++) {
    vals.push(toHex(string.charCodeAt(i)));
  }
  return vals.join("-");
}

// Decodes a '-' delimited string of hex numbers into a
// unicode string.
function decode(string) {
  var tokens = string.split("-");
  var chars = [];
  for (var i = 0; i < tokens.length; i++) {
    chars.push(String.fromCharCode(fromHex(tokens[i])));
  }
  return chars.join("");
}


/* === lib: lib\bema.js === */
/**
 * Creates and configures a UI element on the screen.
 *
 * @param {string} type - The HTML element type to create (e.g. `"div"`, `"button"`, `"input"`).
 * @param {string} id - The unique ID to assign to the element.
 * @param {number} x - The horizontal position (in pixels) on the screen.
 * @param {number} y - The vertical position (in pixels) on the screen.
 * @param {number|string} width - The element width (in pixels or CSS units).
 * @param {number|string} height - The element height (in pixels or CSS units).
 * @param {boolean} [autohide=false] - Whether the element should automatically be hidden.
 * @param {number} [rounded=15] - Rounded corners in px.
 * @param {number|string} [borderWidth=0] - The width of the border.
 * @param {string} [borderColor="#000"] - The border color.
 * @param {string} [bgColor="transparent"] - The background color.
 * @param {string} [textColor="#000"] - The text color.
 * @param {string} [text=""] - The text content of the element.
 * @param {"left"|"center"|"right"} [textAlign="left"] - Text alignment within the element.
 * @param {number|string} [fontSize="1em"] - Font size for the text in px.
 * @param {string} [fontFamily="sans-serif"] - Font family for the text.
 * @param {boolean} [readOnly=false] - If true, makes inputs non-editable.
 * @param {string} [icon] - Optional image URL, only applies to `image` and `button` types.
 * @param {string} [iconColor="#000"] - Unused variable, will have future purpose.
 * @param {string} [customClass] - Additional CSS class to apply to the element.
 * @param {Object} [customCSS] - Inline CSS (key–value object) to apply directly.
 *
 * @example
 * BEMA('button', 'confirmBtn', 100, 200, 120, 40, false, 15, 2, '#333', '#222', '#fff', 'Confirm', 'center', '16px', 'Arial', false, 'check', '#0f0', 'btn-confirm', {boxShadow: '0 2px 6px rgba(0,0,0,0.3)'});
 */
function BEMA(type, id, x, y, width, height, autohide, rounded, borderWidth, borderColor, bgColor, textColor, text, textAlign, fontSize, fontFamily, readOnly, icon, iconColor, customClass, customCSS) {
  let element;

  if (type === "Button") {
    element = document.createElement("button");
  } else if (type === "Image") {
    element = document.createElement("img");
    if (icon) {
      element.src = icon;
      element.style.width = "100%";
      element.style.height = "100%";
      element.style.objectFit = "fill";
    }
  } else if (type === "Input") {
    element = document.createElement("input");
    element.type = "text"; // Set the input type to 'text'
  } else {
    element = document.createElement(type);
  }

  element.id = id;
  element.style.position = "absolute";
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  element.style.borderStyle = "solid";
  element.style.borderWidth = `${borderWidth}px`;
  element.style.borderColor = borderColor;
  element.style.backgroundColor = bgColor;
  element.style.color = textColor;
  element.style.textAlign = textAlign;
  element.style.fontSize = `${fontSize}px`;
  element.style.fontFamily = fontFamily;
  element.style.borderRadius = `${rounded}px`;

  // Apply custom class(es) if provided
  if (customClass) {
    const classes = customClass.split(" ");
    element.classList.add(...classes);
  }

  // Apply custom CSS if provided
  if (customCSS) {
    Object.assign(element.style, customCSS);
  }

  if (readOnly) {
    element.readOnly = true;
    element.style.userSelect = "none";
    element.style.pointerEvents = "none";
  }

  // Make all elements clickable
  element.style.pointerEvents = "auto";

  if (type === "Button") {
    element.style.cursor = "pointer";
    const img = document.createElement("img");
    img.id = id + "-img"; // Assign an ID to the img element
    if (!icon) {
      // Only set image if icon exists, otherwise use 1x1 transparent placeholder
      img.src = icon
        ? icon // your actual icon path
        : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    } else {
      img.src = icon; // Set the src to icon if it's not falsy
    }
    // Apply custom class to image if provided
    if (customClass) {
      const filteredClasses = customClass.split(" ").filter((c) => c.startsWith("img-"));
      if (filteredClasses.length) {
        img.classList.add(...filteredClasses);
      }
    }
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.borderRadius = `${rounded}px`;
    element.appendChild(img);
    if (text) {
      element.textContent = text;
    }
  } else if (type === "TextArea") {
    element.value = text;
    element.style.outline = "none";
    element.style.display = "flex";
    element.style.alignItems = "center"; // Vertically center the text
    element.style.justifyContent = "center"; // Horizontally center the text
    element.style.height = `${height}px`; // Ensure height is set for centering
    if (readOnly) {
      element.style.userSelect = "none";
      element.style.pointerEvents = "none";
      element.style.setProperty("cursor", "default", "important");
      element.style.overflow = "hidden"; // Prevent scrolling
    } else {
      element.style.cursor = "text";
    }
  } else if (type === "Input") {
    element.placeholder = text; // Set placeholder instead of value for Input
  } else if (type === "Image" && icon) {
    element.src = icon;
  } else {
    element.style.cursor = "default"; // Ensure non-button elements have the default cursor
  }

  if (autohide) {
    element.style.display = "none";
  }

  const container = document.getElementById("bema-container");
  if (container) {
    container.appendChild(element);
  } else {
    console.error("bema-container not found");
  }
}

/**
 * Attaches an event listener to an element.
 *
 * @param {string} id - The ID of the element to attach the event to, or `"document"` for the full screen.
 * @param {string} event - The event type to listen for (e.g. `"click"`, `"keydown"`, `"input"`).
 * @param {(e: Event) => void} callback - The function to call when the event is triggered.
 *
 * @example
 * onEvent('myButton', 'click', (e) => {
 *   console.log('Button clicked!', e);
 * });
 *
 * @example
 * onEvent('document', 'keydown', (e) => {
 *   console.log('Key pressed:', e.key);
 * });
 */
function onEvent(id, event, callback) {
  let target = id === "document" ? document : document.getElementById(id);

  if (target) {
    target.addEventListener(event, (e) => callback(e));
  } else {
    console.warn(`Element with id '${id}' not found. Event '${event}' not attached.`);
  }
}

/**
 * Simulates a user click on an element by dispatching a `MouseEvent`.
 *
 * @param {string} elementId - The ID of the target element to simulate a click on.
 *
 * @example
 * // Simulates a click on a button with ID "myButton"
 * simulateClick('myButton');
 *
 * @example
 * // Logs an error if the element doesn't exist
 * simulateClick('nonexistentId');
 */
function simulateClick(elementId) {
  const event = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  const element = document.getElementById(elementId);
  if (element) {
    element.dispatchEvent(event);
  } else {
    console.error(`Element with ID "${elementId}" not found.`);
  }
}

/**
 * Sets the text content or value of an element by its ID.
 *
 * @param {string} elementId - The ID of the target element.
 * @param {string} text - The text to set inside the element.
 *
 * @example
 * setText('username', 'Guest');
 */
function setText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    if (element.tagName === "TEXTAREA" || element.tagName === "INPUT") {
      element.value = text;
    } else {
      element.innerText = text;
    }
  } else {
    console.log(`Element not found: ${elementId}`);
  }
}

/**
 * Gets the text content or value of an element by its ID.
 *
 * @param {string} elementId - The ID of the element to read text from.
 * @returns {string} The current text or value of the element, or an empty string if not found.
 *
 * @example
 * const username = getText('username');
 */
function getText(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      return element.value;
    } else {
      return element.innerText || element.textContent;
    }
  }
  return "";
}

/**
 * Deletes an element by its ID.
 *
 * @param {string} elementId - The ID of the element to remove.
 *
 * @example
 * deleteElement('myUglyButton');
 */
function deleteElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.remove();
  }
}

/**
 * Sets a CSS property or an image source on an element.
 *
 * @param {string} elementId - The ID of the target element.
 * @param {string} property - The property to set. Use `"image"` to set an image src.
 * @param {string} value - The value to assign to the property or image.
 *
 * @example
 * // Set background color
 * setProperty('myButton', 'background-color', 'red');
 *
 * @example
 * // Set button image
 * setProperty('myButton', 'image', 'icon.png');
 */
function setProperty(elementId, property, value) {
  const element = document.getElementById(elementId);
  if (element) {
    if (property === "image") {
      const imgElement = element.tagName === "BUTTON" ? element.querySelector("img") : element;
      if (imgElement) {
        imgElement.src = value;
      }
    } else {
      element.style.setProperty(property, value);
    }
  }
}

/**
 * Gets a CSS property or image source from a element.
 *
 * @param {string} elementId - The ID of the element to query.
 * @param {string} property - The property to get. Use `"image"` to get an image src.
 * @returns {string|undefined} The current value of the property, or `undefined` if not found.
 *
 * @example
 * const bgColor = getProperty('myButton', 'background-color');
 *
 * @example
 * const imgSrc = getProperty('myButton', 'image');
 */
function getProperty(elementId, property) {
  const element = document.getElementById(elementId);
  if (element) {
    if (property === "image") {
      return element.tagName === "BUTTON" ? element.src + "-img" : element.src;
    } else {
      return element.style.getPropertyValue(property);
    }
  }
}

/**
 * Shows an element.
 * @param {string} elementId - The ID of the element to show.
 */
function showElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = "block";
  }
}

/**
 * Hides an element.
 * @param {string} elementId - The ID of the element to hide.
 */
function hideElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = "none";
  }
}

/**
 * Sets the position of an element.
 *
 * @param {string} elementId - The ID of the element to position.
 * @param {number} x - The horizontal position in pixels.
 * @param {number} y - The vertical position in pixels.
 *
 * @example
 * setPosition('myButton', 100, 200);
 */
function setPosition(elementId, x, y) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id '${elementId}' not found in setPosition.`);
    return;
  }
  x = isNaN(x) ? 0 : x;
  y = isNaN(y) ? 0 : y;
  element.style.position = "absolute";
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
}

/**
 * Gets the X (horizontal) position of an element.
 *
 * @param {string} elementId - The ID of the element.
 * @returns {number} The X position in pixels, or 0 if the element is not found.
 *
 * @example
 * const x = getXPosition('myButton');
 */
function getXPosition(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id '${elementId}' not found in getXPosition.`);
    return 0;
  }
  const rect = element.getBoundingClientRect();
  return rect.left;
}

/**
 * Gets the Y (vertical) position of an element.
 *
 * @param {string} elementId - The ID of the element.
 * @returns {number} The Y position in pixels, or 0 if the element is not found.
 *
 * @example
 * const y = getYPosition('myButton');
 */
function getYPosition(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id '${elementId}' not found in getYPosition.`);
    return 0;
  }
  const rect = element.getBoundingClientRect();
  return rect.top;
}

/**
 * Sets the width and height of an element.
 *
 * @param {string} elementId - The ID of the element to resize.
 * @param {number} width - The width in pixels.
 * @param {number} height - The height in pixels.
 *
 * @example
 * setSize('myButton', 200, 150);
 */
function setSize(elementId, width, height) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
  } else {
    console.warn(`Element with id '${elementId}' not found.`);
  }
}


/* === lib: lib\commands.js === */
/**
 * Preloads an image into the browser cache to reduce load delay later.
 *
 * @param {string} url - The URL of the image to preload.
 *
 * @example
 * preloadImage('assets/splash.png');
 */
function preloadImage(url) {
  const img = new Image();
  img.src = url;
}

let audioInstances = {};

/**
 * Stops playback of one or all active audio instances.
 *
 * @param {string} [url] - The URL of the specific audio to stop.
 * If omitted, all currently playing audio instances are stopped.
 *
 * @example
 * // Stop a specific sound
 * stopSound('assets/click.mp3');
 *
 * @example
 * // Stop all sounds
 * stopSound();
 */
function stopSound(url) {
  if (url) {
    if (audioInstances[url]) {
      audioInstances[url].pause();
      audioInstances[url].currentTime = 0;
    } else {
      console.warn(`No audio instance found for URL: ${url}`);
    }
  } else {
    for (let key in audioInstances) {
      if (audioInstances[key]) {
        audioInstances[key].pause();
        audioInstances[key].currentTime = 0;
      }
    }
  }
}

/**
 * Plays a sound from the given URL.
 * If the sound hasn’t been played before, it is created and stored for reuse.
 *
 * @param {string} url - The URL of the sound file to play.
 * @returns {Promise<void>} Resolves when playback begins or fails with an error.
 *
 * @example
 * playSound('assets/notification.mp3');
 */
function playSound(url) {
  if (!audioInstances[url]) {
    audioInstances[url] = new Audio(url);
  }

  audioInstances[url].play().catch((error) => {
    console.error(`Error playing sound: ${error}`);
  });
}

// function setupEventListeners(id) {
//   const element = document.getElementById(id);
//   if (element) {
//     element.classList.add("listening");
//     //console.log(`Setup event listeners for ID: ${id}`, element);
//     element.addEventListener("click", () => {
//       console.log(`Click event fired for ${id}`);
//     });
//   } else {
//     console.error(
//       `Element with ID: ${id} not found for setting up event listeners.`,
//     );
//   }
// }

/**
 * Appends an item to an array.
 *
 * @template T
 * @param {T[]} array - The array to append the item to.
 * @param {T} item - The item to append.
 *
 * @example
 * const list = [1, 2, 3];
 * appendItem(list, 4); // list becomes [1, 2, 3, 4]
 */
function appendItem(array, item) {
  array.push(item);
}

/**
 * Generates a random alphanumeric string of a specified length.
 *
 * @param {number} length - The length of the string to generate.
 * @returns {string} A randomly generated string containing uppercase, lowercase letters, and digits.
 *
 * @example
 * const id = generateRandomString(10); // e.g. "aZ3dE7kL9P"
 */
function generateRandomString(length) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset[randomIndex];
  }
  return randomString;
}

// Module-level initialization
let intervalIds = [];

/**
 * Creates a timed loop that repeatedly calls a callback at a specified interval.
 * Automatically stops if the callback throws an error.
 *
 * @param {number} interval - Time in milliseconds between each callback execution.
 * @param {() => void} callback - Function to execute each interval.
 * @returns {number|null} The interval ID, or `null` if creation failed.
 *
 * @example
 * // Run a callback every second
 * const id = timedLoop(1000, () => console.log('Tick'));
 */
function timedLoop(interval, callback) {
  try {
    const intervalId = setInterval(() => {
      try {
        callback();
      } catch (e) {
        console.error("Callback error:", e);
        clearInterval(intervalId);
      }
    }, interval);

    intervalIds.push(String(intervalId));
    return intervalId;
  } catch (error) {
    console.error("Interval creation failed:", error);
    return null;
  }
}

/**
 * Stops a timed loop created with `timedLoop`.
 * If no intervalId is provided, all active loops are stopped.
 *
 * @param {number} [intervalId] - The ID of the interval to stop.
 *
 * @example
 * // Stop a specific interval
 * stopTimedLoop(id);
 *
 * @example
 * // Stop all intervals
 * stopTimedLoop();
 */
function stopTimedLoop(intervalId) {
  try {
    if (intervalId) {
      const targetId = String(intervalId);
      const index = intervalIds.indexOf(targetId);
      if (index > -1) {
        clearInterval(intervalId);
        intervalIds.splice(index, 1);
      }
    } else {
      intervalIds.forEach((id) => {
        try {
          clearInterval(Number(id));
        } catch (e) {
          console.warn("Cleanup error:", e);
        }
      });
      intervalIds = [];
    }
  } catch (error) {
    console.error("Interval termination error:", error);
  }
}

/**
 * Returns the current time formatted according to a format string.
 *
 * Supported tokens:
 * - HH / hh : hours (24-hour / 12-hour)
 * - mm      : minutes
 * - ss      : seconds
 * - a       : AM/PM (only for 12-hour formats)
 *
 * @param {string} format - The desired time format (e.g. "HH:mm:ss", "hh:mm a").
 * @returns {string} The formatted current time.
 *
 * @example
 * const time24 = getTime("HH:mm:ss"); // "14:05:09"
 * const time12 = getTime("hh:mm a");  // "02:05 PM"
 */
function getTime(format) {
  var dateCheck = new Date();
  var hours = dateCheck.getHours();
  var minutes = dateCheck.getMinutes();
  var seconds = dateCheck.getSeconds();
  let period = "";

  // Check for 12-hour format
  if (format.includes("hh") || format.includes("hh:mm a") || format.includes("hh:mm:ss a")) {
    period = hours >= 12 ? "PM" : "AM";
    // Convert to 12-hour format
    hours = hours % 12 || 12;
  }
  // Add leading zeroes if needed
  var hoursStr = hours < 10 ? "0" + hours : hours;
  var minutesStr = minutes < 10 ? "0" + minutes : minutes;
  var secondsStr = seconds < 10 ? "0" + seconds : seconds;
  // Replace format tokens wiþ actual time values
  var formattedTime = format.replace("hh", hoursStr).replace("HH", hoursStr).replace("mm", minutesStr).replace("ss", secondsStr).replace("a", period);
  return formattedTime;
}

/**
 * Returns the current date formatted according to a format string.
 *
 * Supported tokens:
 * - mm   : month (01-12)
 * - dd   : day of the month (01-31)
 * - yyyy : full year (e.g. 2025)
 * - yy   : last two digits of the year (e.g. 25)
 *
 * @param {string} format - The desired date format (e.g. "mm/dd/yyyy", "dd-mm-yy").
 * @returns {string} The formatted current date.
 *
 * @example
 * const date = getDate("mm/dd/yyyy"); // "11/03/2025"
 */
function getDate(format) {
  var dateCheck = new Date();
  var month = dateCheck.getMonth() + 1;
  var day = dateCheck.getDate();
  var year = dateCheck.getFullYear();
  // Get last two digits of þe year
  var yy = year.toString().slice(-2);
  // Add leading zeroes if needed
  var monthStr = month < 10 ? "0" + month : month.toString();
  var dayStr = day < 10 ? "0" + day : day.toString();
  // Replace format tokens wiþ actual date values
  var formattedDate = format.replace("mm", monthStr).replace("dd", dayStr).replace("yyyy", year.toString()).replace("yy", yy);
  return formattedDate;
}

/**
 * Encodes a string by shifting each character's Unicode value by a numeric key.
 *
 * @param {string} inputText - The string to encode.
 * @param {number} key - The numeric shift to apply to each character.
 * @returns {string} The encoded string.
 *
 * @example
 * const encoded = shiftString("Hello", 3); // "Khoor"
 */
function shiftString(inputText, key) {
  var encodedString = "";
  for (var i = 0; i < inputText.length; i++) {
    var charCode = inputText.charCodeAt(i);
    var shiftedCharCode = charCode + key;
    var encodedCharacter = String.fromCharCode(shiftedCharCode);
    encodedString += encodedCharacter;
  }
  return encodedString;
}

/**
 * Decodes a string that was encoded with `shiftString`.
 *
 * @param {string} encodedString - The string to decode.
 * @param {number} key - The numeric shift that was originally applied.
 * @returns {string} The decoded string.
 *
 * @example
 * const decoded = unshiftString("Khoor", 3); // "Hello"
 */
function unshiftString(encodedString, key) {
  var decodedString = "";
  for (var i = 0; i < encodedString.length; i++) {
    var encodedCharCode = encodedString.charCodeAt(i);
    var originalCharCode = encodedCharCode - key;
    var decodedCharacter = String.fromCharCode(originalCharCode);
    decodedString += decodedCharacter;
  }
  return decodedString;
}

/**
 * Checks if a given message matches an expected SHA-256 hash.
 *
 * @param {string} message - The input string to hash.
 * @param {string} expectedHash - The SHA-256 hash to compare against.
 * @returns {boolean} True if the computed hash matches the expected hash, false otherwise.
 *
 * @example
 * const valid = checkSha256("hello", "2cf24dba..."); // true or false
 */
function checkSha256(message, expectedHash) {
  var computedHash = sha256(message);
  return computedHash === expectedHash;
}

/**
 * Computes the SHA-256 hash of a given string.
 *
 * @param {string} message - The input string to hash.
 * @returns {string} The SHA-256 hash of the input.
 *
 * @note This implementation is **not compatible** with official SHA-256 and may produce different results.
 *
 * @example
 * const hash = sha256("hello");
 */
function sha256(message) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  function utf8Encode(str) {
    return unescape(encodeURIComponent(str));
  }

  var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];

  var initialHashValues = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

  message = utf8Encode(message);
  var lengthInBits = message.length * 8;

  // Pre-processing
  message += String.fromCharCode(0x80); // Append '1' bit
  while (message.length % 64 !== 56) {
    message += String.fromCharCode(0x00); // Append '0' bits
  }
  message += String.fromCharCode((lengthInBits >>> 56) & 0xff);
  message += String.fromCharCode((lengthInBits >>> 48) & 0xff);
  message += String.fromCharCode((lengthInBits >>> 40) & 0xff);
  message += String.fromCharCode((lengthInBits >>> 32) & 0xff);
  message += String.fromCharCode((lengthInBits >>> 24) & 0xff);
  message += String.fromCharCode((lengthInBits >>> 16) & 0xff);
  message += String.fromCharCode((lengthInBits >>> 8) & 0xff);
  message += String.fromCharCode(lengthInBits & 0xff);

  var chunks = [];
  for (var i = 0; i < message.length; i += 64) {
    chunks.push(message.slice(i, i + 64));
  }

  var hash = initialHashValues.slice();
  chunks.forEach(function (chunk) {
    var words = new Array(64);
    for (var i = 0; i < 16; i++) {
      words[i] = (chunk.charCodeAt(i * 4) << 24) | (chunk.charCodeAt(i * 4 + 1) << 16) | (chunk.charCodeAt(i * 4 + 2) << 8) | chunk.charCodeAt(i * 4 + 3);
    }

    for (var i = 16; i < 64; i++) {
      var s0 = rightRotate(words[i - 15], 7) ^ rightRotate(words[i - 15], 18) ^ (words[i - 15] >>> 3);
      var s1 = rightRotate(words[i - 2], 17) ^ rightRotate(words[i - 2], 19) ^ (words[i - 2] >>> 10);
      words[i] = (words[i - 16] + s0 + words[i - 7] + s1) & 0xffffffff;
    }

    var a = hash[0],
      b = hash[1],
      c = hash[2],
      d = hash[3],
      e = hash[4],
      f = hash[5],
      g = hash[6],
      h = hash[7];

    for (var i = 0; i < 64; i++) {
      var s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      var ch = (e & f) ^ (~e & g);
      var temp1 = (h + s1 + ch + K[i] + words[i]) & 0xffffffff;
      var s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      var maj = (a & b) ^ (a & c) ^ (b & c);
      var temp2 = (s0 + maj) & 0xffffffff;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) & 0xffffffff;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) & 0xffffffff;
    }

    hash[0] = (hash[0] + a) & 0xffffffff;
    hash[1] = (hash[1] + b) & 0xffffffff;
    hash[2] = (hash[2] + c) & 0xffffffff;
    hash[3] = (hash[3] + d) & 0xffffffff;
    hash[4] = (hash[4] + e) & 0xffffffff;
    hash[5] = (hash[5] + f) & 0xffffffff;
    hash[6] = (hash[6] + g) & 0xffffffff;
    hash[7] = (hash[7] + h) & 0xffffffff;
  });

  var result = "";
  for (var b = 0; b < 8; b++) {
    result += ("00000000" + hash[b].toString(16)).slice(-8);
  }
  return result;
}

/**
 * Returns a new array with the elements shuffled.
 *
 * @template T
 * @param {T[]} arr - The array to shuffle.
 * @returns {T[]} A new array with the elements in random order.
 *
 * @example
 * const numbers = [1, 2, 3, 4, 5];
 * const shuffled = shuffle(numbers);
 */
function shuffle(arr) {
  var copy = arr.slice(); // Don't modify original
  for (var i = copy.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}
/**
 * Picks a random element from an array.
 * @template T
 * @param {T[]} arr - The array to choose from.
 * @returns {T} A single randomly selected item.
 */
function randompick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Determines if a value is an array.
 * @param {*} x - The value to test.
 * @returns {boolean} True if the value is an array, false otherwise.
 */
function isArray(x) {
  return x instanceof Array;
}

/**
 * Determines if a value is a string.
 * @param {*} x - The value to test.
 * @returns {boolean} True if the value is a string, false otherwise.
 */
function isString(x) {
  return typeof x === "string" || x instanceof String;
}

/**
 * Determines if a value is a function.
 * @param {*} x - The value to test.
 * @returns {boolean} True if the value is a function, false otherwise.
 */
function isFunction(x) {
  return typeof x === "function";
}

/**
 * Determines if a value is a number and not NaN.
 * @param {*} x - The value to test.
 * @returns {boolean} True if the value is a valid number, false otherwise.
 */
function isNumber(x) {
  return typeof x === "number" && !isNaN(x);
}

/**
 * Determines if a value is a plain object (not an array or null).
 * @param {*} x - The value to test.
 * @returns {boolean} True if the value is a plain object, false otherwise.
 */
function isObject(x) {
  return x !== null && typeof x === "object" && !isArray(x);
}

/**
 * Checks whether a value is empty.
 * Returns true for "", [], {}, null, or undefined.
 * @param {*} x - The value to check.
 * @returns {boolean} True if the value is empty, false otherwise.
 */
function isEmpty(x) {
  if (x == null) return true;
  if (isArray(x) || isString(x)) return x.length === 0;
  if (isObject(x)) return Object.keys(x).length === 0;
  return false;
}

/**
 * Returns a string describing the type of a value.
 * Can return: "null", "undefined", "array", "string", "function", "number", or "object".
 * @param {*} x - The value to check.
 * @returns {string} The type of the value.
 */
function type(x) {
  if (x === null) return "null";
  if (x === undefined) return "undefined";
  if (isArray(x)) return "array";
  if (isString(x)) return "string";
  if (isFunction(x)) return "function";
  if (isNumber(x)) return "number";
  if (isObject(x)) return "object";
  return typeof x;
}


/* === lib: lib\openbundles.js === */
// javascript-obfuscator:disable
var IDstarter = "Helion";
var HomescreenWindow = "";
var BarIconID = ".Home.DockApp.";

//Configure OpenBundles, all are REQUIRED
//IDstarter is like "Solstice"
//HomescreenWindow is like ".Homescreen.Window"
//BarIconID is like ".Homescreen.icon."
function openBundles$Config(IDstarterr, HomescreenWindoww, BarIconIDd) {
  IDstarter = IDstarterr;
  HomescreenWindow = HomescreenWindoww;
  BarIconID = BarIconIDd;
}

//Returns IDstarter
function openBundles$getIDstarter() {
  return IDstarter;
}

//Install a Shortcut
function openBundles$InstallShortcut(appname, iconn) {
  var icon;
  icon = iconn;
  if (barIcons.indexOf("") !== -1) {
    barIcons[barIcons.indexOf("")] = appname;
    setProperty(IDstarter + BarIconID + (barIcons.indexOf("") + 0) + "-img", "image", icon);
    showElement(IDstarter + BarIconID + (barIcons.indexOf("") + 0));
    return barIcons.indexOf(appname);
  }
  return false;
}

//Uninstall a Shortcut
function openBundles$UninstallShortcut(appname) {
  for (var i = 0; i < barIcons.length; i++) {
    if (barIcons[i] === appname) {
      barIcons[i] = "";
      setProperty(IDstarter + BarIconID + (i + 1), "image", "assets/question.png");
      hideElement(IDstarter + BarIconID + (i + 1));
      return;
    }
  }
}

// Function to return all AppBundleIDs
function openBundles$displayLinks() {
  for (var key in Apps) {
    if (Apps.hasOwnProperty(key)) {
      console.log(key + " : " + Apps[key]);
    }
  }
}

// Function to register a AppBundle
function openBundles$RegisterAppBundle(BundleID, Screens) {
  //Apps[BundleID] = Screens;
}

// Hide all icons, use when opening an app bundle
function openBundles$hideIcons() {
  showElement(IDstarter + HomescreenWindow);
}

// Show all icons, use when closing an app bundle
function openBundles$showIcons() {
  hideElement(IDstarter + HomescreenWindow);
}

var apps = [];
// Function to add an app to the end of the list
function openBundles$addApp(name, version, author, mainscreen, icon, isbundle, showinappstore) {
  apps.push({
    name: name,
    version: version,
    author: author,
    mainscreen: mainscreen,
    icon: icon,
    isbundle: isbundle,
    showinappstore: showinappstore,
  });
}

function openBundles$removeApp(name) {
  const index = apps.findIndex((app) => app.name === name);
  if (index !== -1) {
    apps.splice(index, 1);
    return true; // removed successfully
  }
  return false; // app not found
}

// Function to return apps
function openBundles$getApps() {
  return apps;
}

Object.defineProperty(window, "OpenBundles$RegisterAppBundle", {
  value: function (BundleID, Screens) {
    Apps[BundleID] = Screens;
  },
  writable: false,
  configurable: false,
});

Object.defineProperty(window, "OpenBundles$hideIcons", {
  value: function () {
    HomeScreen(false);
    //showElement(IDstarter + HomescreenWindow);
  },
  writable: false,
  configurable: false,
});

Object.defineProperty(window, "OpenBundles$showIcons", {
  value: function () {
    HomeScreen(true);
    Heilos$ReSetIconImages();
    //hideElement(IDstarter + HomescreenWindow);
  },
  writable: false,
  configurable: false,
});

Object.defineProperty(window, "OpenBundles$getApps", {
  value: function () {
    return apps;
  },
  writable: false,
  configurable: false,
});

Object.defineProperty(window, "OpenBundles$openApp", {
  value: function (appName) {
    var TempApps = OpenBundles$getApps();
    for (var i = 0; i < TempApps.length; i++) {
      var app = TempApps[i];
      if (app.name === appName) {
        if (app.isbundle === true) {
          if (app.mainscreen.indexOf("Bundle$") !== -1) {
            eval(app.mainscreen);
          } else {
            console.log("[OpenBundles]: The app might not be a bundle!");
          }
        } else {
          console.error("[OpenBundles]: App is for applab only!");
        }
        return;
      }
    }
    console.error("App with name " + appName + " not found.");
  },
  writable: false,
  configurable: false,
});

var activeBundles = {};

// javascript-obfuscator:enable


/* === src: src\!FemBoyBoot.js === */
var SystemVersion = 0x80000001;
var SystemSubver = 0x0000;
var BuildVersion = "0.1.0";
var BuildNumber = 52;
var BuildTimestamp = 1782242794122;
var BuildExpiration = 1798485994122;
var BuildExpirationDays = 188;

function __AshBuildExpirationCheck() {
  if (Date.now() > BuildExpiration) {
    throw new Error("Build expired.");
  }
}
__AshBuildExpirationCheck();

if (SystemVersion > 2147483647) {
    var VersionClass = "Developer";
    var SystemVersionIndex = SystemVersion - 2147483648;
} else {
    var VersionClass = "Retail";
    var SystemVersionIndex = SystemVersion;
}

if (VersionClass === "Developer") {
    console.log("Developer fuse");
    console.log("System Version Index: " + SystemVersionIndex);
} else {
    console.log("Retail fuse");
    console.log("System Version Index: " + SystemVersionIndex);
}

function VersionCheck(Index) {
    // Interpret the 32-bit value as major.minor where
    // major = high 16 bits, minor = low 16 bits.
    const major = (Index >>> 16) & 0xFFFF;
    const minor = Index & 0xFFFF;
    return `${major}.${minor}.${SystemSubver}`;
}

// show the version for the current SystemVersionIndex
console.log(VersionCheck(typeof SystemVersionIndex !== 'undefined' ? SystemVersionIndex : SystemVersion));

function Codenames() {
    const codenames = {
        0x00000001: "Ark",
        0x80000001: "Ark",
    };

    const codename = codenames[SystemVersion] || "Unknown";
    return `${codename}`;
}

console.log(Codenames());

const Codename = Codenames();

const Version = VersionCheck(typeof SystemVersionIndex !== 'undefined' ? SystemVersionIndex : SystemVersion);

VersionCheck = null;
Codenames = null;

var Processes = [];

// Starts a process by name.
//
// Example use: StartProcess("Notepad");
//
function StartProcess(Name) {
    appendItem(Processes, [
        Name,
        1,
    ]);
}


console.log(Processes);

// Stops a process by name. If the process is not found, nothing happens.
//
// Example use: StopProcess("Notepad");
//
function StopProcess(Name) {
    for (var i = 0; i < Processes.length; i++) {
        if (Processes[i][0] === Name) {
            Processes.splice(i, 1);
            break;
        }
    }
}



StopProcess("FemboyBoot");


/* === src: src\!WindowMan.js === */
function createArkWindow(Name, Process, Info) {
    if (typeof Info !== 'object' || Info === null) {
        throw new Error("Info must be a valid object with window properties.");
    }

    const requiredFields = ['width', 'height', 'x', 'y', 'title'];
    for (const field of requiredFields) {
        if (!(field in Info)) {
            throw new Error(`Missing required field in Info: ${field}`);
        }
    }

    const randomString = typeof generateRandomString === 'function'
        ? generateRandomString(8)
        : Math.random().toString(36).slice(2, 10);

    const windowId = `${randomString}-${Name}`;
    const frameId = `${windowId}-frame`;
    const titleId = `${windowId}-title`;
    const contentId = `${windowId}-content`;
    const closeId = `${windowId}-close`;
    const maxId = `${windowId}-max`;
    const resizeId = `${windowId}-resize`;

    const minWidth = 200;
    const minHeight = 240;    const titleHeight = 32;
    const state = {
        id: windowId,
        x: Info.x,
        y: Info.y,
        width: Math.max(Info.width, minWidth),
        height: Math.max(Info.height, minHeight),
        title: Info.title,
        process: Process,
        buttons: [],
        dragging: false,
        resizing: false,
        dragStart: { x: 0, y: 0, windowX: 0, windowY: 0, windowW: 0, windowH: 0 },
    };

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function getContainerScale() {
        const container = document.getElementById('bema-container');
        if (!container) return { scaleX: 1, scaleY: 1 };
        const rect = container.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(container);
        const transform = computedStyle.transform;
        let scale = 1;
        if (transform && transform !== 'none') {
            const match = transform.match(/scale\(([^,)]+)/);
            if (match) scale = parseFloat(match[1]);
        }
        return { scaleX: scale, scaleY: scale };
    }

    function px(value) {
        return typeof value === 'number' ? `${value}px` : value;
    }

    function layoutWindow() {
        state.width = Math.max(state.width, minWidth);
        state.height = Math.max(state.height, minHeight);

        const contentHeight = state.height - titleHeight;

        setProperty(frameId, 'left', px(state.x));
        setProperty(frameId, 'top', px(state.y));
        setProperty(frameId, 'width', px(state.width));
        setProperty(frameId, 'height', px(state.height));

        setProperty(titleId, 'left', px(state.x));
        setProperty(titleId, 'top', px(state.y));
        setProperty(titleId, 'width', px(state.width));
        setProperty(titleId, 'height', px(titleHeight));
        setProperty(titleId, 'font-size', px(Math.max(12, Math.round(state.width * 0.035))));

        setProperty(contentId, 'left', px(state.x));
        setProperty(contentId, 'top', px(state.y + titleHeight));
        setProperty(contentId, 'width', px(state.width));
        setProperty(contentId, 'height', px(contentHeight));
        setProperty(contentId, 'font-size', px(Math.max(12, Math.round(state.width * 0.03))));

        setProperty(closeId, 'left', px(state.x + state.width - 52));
        setProperty(closeId, 'top', px(state.y));
        setProperty(closeId, 'width', px(52));
        setProperty(closeId, 'height', px(titleHeight));
        setProperty(closeId, 'font-size', px(Math.max(14, Math.round(state.width * 0.035))));

        setProperty(maxId, 'left', px(state.x + state.width - 104));
        setProperty(maxId, 'top', px(state.y));
        setProperty(maxId, 'width', px(52));
        setProperty(maxId, 'height', px(titleHeight));
        setProperty(maxId, 'font-size', px(Math.max(14, Math.round(state.width * 0.035))));

        setProperty(resizeId, 'left', px(state.x + state.width - 28));
        setProperty(resizeId, 'top', px(state.y + state.height - 28));
        setProperty(resizeId, 'width', px(24));
        setProperty(resizeId, 'height', px(24));

        state.buttons.forEach(button => {
            const x = state.x + Math.round(state.width * clamp(button.x, 0, 1));
            const y = state.y + Math.round(state.height * clamp(button.y, 0, 1));
            const width = Math.round(state.width * clamp(button.width, 0, 1));
            const height = Math.round(state.height * clamp(button.height, 0, 1));
            const fontSize = Math.max(10, Math.round(state.width * (button.fontSize || 0.04)));

            setProperty(button.id, 'left', px(x));
            setProperty(button.id, 'top', px(y));
            setProperty(button.id, 'width', px(width));
            setProperty(button.id, 'height', px(height));
            setProperty(button.id, 'font-size', px(fontSize));
        });
    }

    function createWindowChildButton(config) {
        const id = `${windowId}-child-${config.name || Math.random().toString(36).slice(2, 8)}`;
        AEA({
            type: 'Button',
            id,
            position: { x: state.x + Math.round(state.width * (config.x || 0)), y: state.y + Math.round(state.height * (config.y || 0)) },
            size: { width: Math.round(state.width * (config.width || 0.2)), height: Math.round(state.height * (config.height || 0.08)) },
            border: { width: 1, color: config.borderColor || '#888', radius: config.borderRadius || 8 },
            colors: { bg: config.bg || '#333', text: config.textColor || '#fff' },
            text: { content: config.label || '', align: 'center', size: Math.max(12, Math.round(state.width * (config.fontSize || 0.04))), font: config.font || 'sans-serif' },
            css: { position: 'absolute', cursor: 'pointer' },
        });

        state.buttons.push({
            id,
            x: config.x || 0,
            y: config.y || 0,
            width: config.width || 0.2,
            height: config.height || 0.08,
            fontSize: config.fontSize || 0.04,
        });

        if (typeof config.onClick === 'function') {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', config.onClick);
            }
        }

        return id;
    }

    AEA({
        type: 'div',
        id: frameId,
        position: { x: state.x, y: state.y },
        size: { width: state.width, height: state.height },
        border: { width: 2, color: '#fff', radius: 12 },
        colors: { bg: '#111', text: '#fff' },
        text: { content: '', align: 'left', size: 14, font: 'sans-serif' },
        css: { position: 'absolute', overflow: 'hidden' },
    });

    AEA({
        type: 'TextArea',
        id: titleId,
        position: { x: state.x, y: state.y },
        size: { width: state.width, height: titleHeight },
        border: { width: 0, color: 'transparent', radius: 0 },
        colors: { bg: '#222', text: '#fff' },
        text: { content: state.title, align: 'left', size: Math.max(14, Math.round(state.width * 0.04)), font: 'Arial' },
        readOnly: true,
        css: { position: 'absolute', padding: '10px', boxSizing: 'border-box' },
    });

    AEA({
        type: 'TextArea',
        id: contentId,
        position: { x: state.x, y: state.y + titleHeight },
        size: { width: state.width, height: state.height - titleHeight },
        border: { width: 0, color: 'transparent', radius: 0 },
        colors: { bg: '#000', text: '#fff' },
        text: { content: 'This is the content area.', align: 'left', size: Math.max(12, Math.round(state.width * 0.03)), font: 'Arial' },
        readOnly: true,
        css: { position: 'absolute', padding: '12px', boxSizing: 'border-box', overflow: 'auto' },
    });

    AEA({
        type: 'Button',
        id: closeId,
        position: { x: state.x + state.width - 52, y: state.y },
        size: { width: 52, height: titleHeight },
        border: { width: 0, color: 'transparent', radius: 0 },
        colors: { bg: '#c0392b', text: '#fff' },
        text: { content: 'X', align: 'center', size: Math.max(16, Math.round(state.width * 0.035)), font: 'Arial' },
        readOnly: true,
        css: { position: 'absolute', cursor: 'pointer' },
    });

    AEA({
        type: 'Button',
        id: maxId,
        position: { x: state.x + state.width - 104, y: state.y },
        size: { width: 52, height: titleHeight },
        border: { width: 0, color: 'transparent', radius: 0 },
        colors: { bg: '#27ae60', text: '#fff' },
        text: { content: '▢', align: 'center', size: Math.max(16, Math.round(state.width * 0.035)), font: 'Arial' },
        readOnly: true,
        css: { position: 'absolute', cursor: 'pointer' },
    });

    AEA({
        type: 'Button',
        id: resizeId,
        position: { x: state.x + state.width - 28, y: state.y + state.height - 28 },
        size: { width: 24, height: 24 },
        border: { width: 1, color: '#999', radius: 4 },
        colors: { bg: '#555', text: '#fff' },
        text: { content: '', align: 'center', size: 12, font: 'Arial' },
        readOnly: true,
        css: { position: 'absolute', cursor: 'nwse-resize' },
    });

    function startDrag(event) {
        const scale = getContainerScale();
        state.dragging = true;
        state.dragStart.windowX = state.x;
        state.dragStart.windowY = state.y;
        state.dragStart.x = event.clientX;
        state.dragStart.y = event.clientY;
        state.dragStart.scaleX = scale.scaleX;
        state.dragStart.scaleY = scale.scaleY;
        event.preventDefault();
    }

    function startResize(event) {
        const scale = getContainerScale();
        state.resizing = true;
        state.dragStart.windowW = state.width;
        state.dragStart.windowH = state.height;
        state.dragStart.x = event.clientX;
        state.dragStart.y = event.clientY;
        state.dragStart.scaleX = scale.scaleX;
        state.dragStart.scaleY = scale.scaleY;
        event.preventDefault();
    }

    function onMove(event) {
        if (state.dragging) {
            const deltaX = (event.clientX - state.dragStart.x) / state.dragStart.scaleX;
            const deltaY = (event.clientY - state.dragStart.y) / state.dragStart.scaleY;
            state.x = state.dragStart.windowX + deltaX;
            state.y = state.dragStart.windowY + deltaY;
            layoutWindow();
        }
        if (state.resizing) {
            const deltaX = (event.clientX - state.dragStart.x) / state.dragStart.scaleX;
            const deltaY = (event.clientY - state.dragStart.y) / state.dragStart.scaleY;
            state.width = Math.max(minWidth, state.dragStart.windowW + deltaX);
            state.height = Math.max(minHeight, state.dragStart.windowH + deltaY);
            layoutWindow();
        }
    }

    function onUp() {
        state.dragging = false;
        state.resizing = false;
    }

    const titleElement = document.getElementById(titleId);
    const frameElement = document.getElementById(frameId);
    const resizeElement = document.getElementById(resizeId);
    const closeElement = document.getElementById(closeId);
    const maxElement = document.getElementById(maxId);

    function isInTitleBar(event) {
        if (!frameElement) return false;
        const rect = frameElement.getBoundingClientRect();
        return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.top + titleHeight;
    }

    function isControlElement(event) {
        return event.target && [closeId, maxId, resizeId].includes(event.target.id);
    }

    function tryStartDrag(event) {
        if (event.button !== 0) return;
        if (!isInTitleBar(event) || isControlElement(event)) return;
        startDrag(event);
    }

    if (frameElement) {
        frameElement.addEventListener('mousedown', tryStartDrag);
    }
    if (resizeElement) {
        resizeElement.addEventListener('mousedown', startResize);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    if (closeElement) {
        closeElement.addEventListener('click', () => {
            [frameId, titleId, contentId, closeId, maxId, resizeId].forEach(id => {
                const element = document.getElementById(id);
                if (element) element.remove();
            });
        });
    }

    if (maxElement) {   
        maxElement.addEventListener('click', () => {
            const container = document.getElementById('bema-container');
            if (container) {
                state.width = container.clientWidth;
                state.height = container.clientHeight;
            }
            state.x = 0;
            state.y = 0;
            layoutWindow();
        });
    }

    layoutWindow();

    state.createChildButton = createWindowChildButton;
    return state;
}

const myWindow = createArkWindow("MyWindow", "MyProcess", { width: 250, height: 250, x: 50, y: 50, title: "My Window" });

const childButton = myWindow.createChildButton({
    name: 'test',
    label: 'Press',
    x: 0.1,
    y: 0.15,
    width: 0.25,
    height: 0.12,
    fontSize: 0.045,
    onClick: () => {
        console.log('child button pressed');
    },
});


/* === src: src\virtualfs.js === */
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


});