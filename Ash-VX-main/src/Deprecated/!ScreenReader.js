/*(function() {
    const STORAGE_KEY = "AshScreenReaderSettings";

    window.ScreenReaderLangs = window.ScreenReaderLangs || [];
    const defaultLang = {
        code: 'en',
        name: 'English',
        voice: 'en-US',
        strings: {
            on: 'Screen reader mode enabled.',
            off: 'Screen reader mode disabled.',
            language: 'Language set to {name}.',
            hover: '{target}',
            noTarget: 'Nothing under the pointer.',
            cycle: 'Switched language to {name}.',
        },
    };

    function loadSettings() {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return { enabled: false, language: 'en' };
            return JSON.parse(raw);
        } catch (error) {
            return { enabled: false, language: 'en' };
        }
    }

    function saveSettings(state) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
                enabled: state.enabled,
                language: state.language,
            }));
        } catch (error) {
            // ignore storage failures
        }
    }

    function getLangPack(code) {
        const pack = window.ScreenReaderLangs.find(lang => lang.code === code);
        if (pack) return pack;
        return defaultLang;
    }

    function formatString(template, values) {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return values && values[key] != null ? values[key] : match;
        });
    }

    function findDeepestVisibleElement(event) {
        if (typeof document.elementFromPoint !== 'function') return event.target;
        const x = event.clientX;
        const y = event.clientY;
        const original = event.target;
        if (!original || original === document.body || original === document.documentElement) {
            return original;
        }

        const computedStyle = window.getComputedStyle(original);
        if (computedStyle && computedStyle.pointerEvents !== 'none') {
            try {
                const oldPointer = original.style.pointerEvents;
                original.style.pointerEvents = 'none';
                const fromPoint = document.elementFromPoint(x, y);
                original.style.pointerEvents = oldPointer;
                if (fromPoint && fromPoint !== original) {
                    return fromPoint;
                }
            } catch (error) {
                // ignore DOM access issues
            }
        }
        return original;
    }

    function getTextForElement(element) {
        if (!element || element === document.body || element === document.documentElement) {
            return null;
        }

        const ariaLabel = element.getAttribute && element.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel.trim();

        const ariaLabelledBy = element.getAttribute && element.getAttribute('aria-labelledby');
        if (ariaLabelledBy) {
            const labelElement = document.getElementById(ariaLabelledBy);
            if (labelElement && labelElement.textContent) {
                return labelElement.textContent.trim();
            }
        }

        if (element.title) return element.title.trim();
        if (element.alt) return element.alt.trim();
        if (element.placeholder) return element.placeholder.trim();
        if (element.value) return element.value.toString().trim();

        const visibleText = element.innerText || element.textContent;
        if (visibleText) {
            const trimmed = visibleText.toString().trim();
            if (trimmed) {
                const short = trimmed.replace(/\s+/g, ' ').slice(0, 120);
                return short;
            }
        }

        const tag = element.tagName ? element.tagName.toLowerCase() : 'element';
        return tag;
    }

    function speak(text) {
        if (!text) return;
        const pack = getLangPack(state.language);
        if (window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function') {
            try {
                const utterance = new window.SpeechSynthesisUtterance(text);
                utterance.lang = pack.voice || pack.code || 'en-US';
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
                return;
            } catch (error) {
                // fallback to console
            }
        }
        console.log('[ScreenReader]', text);
    }

    function announce(message) {
        console.log('[ScreenReader]', message);
        if (!state.enabled) return;
        if (!message) return;
        const pack = getLangPack(state.language);
        speak(message);
    }

    function updateGlobalState() {
        window.ScreenReaderEnabled = state.enabled;
        window.ScreenReaderLanguage = state.language;
        window.ScreenReaderAvailableLanguages = window.ScreenReaderLangs.map(lang => lang.code);
    }

    function getCurrentStrings() {
        const pack = getLangPack(state.language);
        return (pack && pack.strings) ? pack.strings : defaultLang.strings;
    }

    function toggleScreenReaderMode() {
        state.enabled = !state.enabled;
        state.lastHoverTarget = null;
        saveSettings(state);
        updateGlobalState();
        refreshOverlay();
        const message = state.enabled ? getCurrentStrings().on : getCurrentStrings().off;
        announce(message);
    }

    function cycleLanguage() {
        const codes = window.ScreenReaderLangs.map(lang => lang.code);
        if (codes.length === 0) {
            announce(defaultLang.strings.language.replace('{name}', defaultLang.name));
            return;
        }

        const currentIndex = codes.indexOf(state.language);
        const nextIndex = (currentIndex + 1) % codes.length;
        state.language = codes[nextIndex] || defaultLang.code;
        saveSettings(state);
        updateGlobalState();
        refreshOverlay();
        const pack = getLangPack(state.language);
        announce(formatString(getCurrentStrings().cycle || getCurrentStrings().language, { name: pack.name }));
    }

    function onPointerMove(event) {
        if (!state.enabled) return;
        const target = findDeepestVisibleElement(event) || event.target;
        if (!target || target === state.lastHoverTarget) return;
        state.lastHoverTarget = target;

        const name = getTextForElement(target);
        if (!name) {
            announce(getCurrentStrings().noTarget);
            return;
        }

        const message = formatString(getCurrentStrings().hover, { target: name });
        announce(message);
    }

    function onKeyDown(event) {
        if (!event.ctrlKey || !event.shiftKey || event.altKey) return;

        if (event.code === 'Digit8' || event.code === 'Numpad8') {
            event.preventDefault();
            toggleScreenReaderMode();
            return;
        }

        if (event.code === 'Digit7' || event.code === 'Numpad7') {
            event.preventDefault();
            cycleLanguage();
            return;
        }
    }

    function createStatusOverlay() {
        const overlayId = 'ash-screenreader-status';
        if (document.getElementById(overlayId)) return;

        const overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.position = 'fixed';
        overlay.style.left = '16px';
        overlay.style.bottom = '16px';
        overlay.style.padding = '8px 12px';
        overlay.style.background = 'rgba(0, 0, 0, 0.7)';
        overlay.style.color = '#fff';
        overlay.style.fontSize = '13px';
        overlay.style.borderRadius = '8px';
        overlay.style.zIndex = 999999;
        overlay.style.pointerEvents = 'none';
        overlay.style.fontFamily = 'Arial, sans-serif';
        overlay.style.maxWidth = '320px';
        overlay.style.whiteSpace = 'pre-wrap';
        overlay.style.lineHeight = '1.3';
        document.body.appendChild(overlay);
    }

    function refreshOverlay() {
        let overlay = document.getElementById('ash-screenreader-status');
        if (!overlay) {
            createStatusOverlay();
            overlay = document.getElementById('ash-screenreader-status');
        }
        const pack = getLangPack(state.language);
        overlay.textContent = `Screen reader: ${state.enabled ? 'ON' : 'OFF'}\nLanguage: ${pack.name}\nHotkeys: Ctrl+Shift+8 toggle, Ctrl+Shift+7 cycle`;
    }

    function initialize() {
        const loadedState = loadSettings();
        state.enabled = loadedState.enabled || false;
        state.language = loadedState.language || 'en';
        updateGlobalState();
        refreshOverlay();

        document.addEventListener('keydown', onKeyDown, true);
        document.addEventListener('pointermove', onPointerMove, true);
        document.addEventListener('mouseover', onPointerMove, true);

        window.addEventListener('beforeunload', () => saveSettings(state));
    }

    const state = {
        enabled: false,
        language: 'en',
        lastHoverTarget: null,
    };

    window.ScreenReader = {
        get enabled() { return state.enabled; },
        get language() { return state.language; },
        toggle: toggleScreenReaderMode,
        cycleLanguage,
        get availableLanguages() { return window.ScreenReaderLangs.map(lang => lang.code); },
        announce,
    };

    initialize();
})();
*/