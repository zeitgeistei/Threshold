function createAshWindowManager() {
    if (typeof window !== 'undefined' && window.__ashWindowManager) {
        return window.__ashWindowManager;
    }

    const defaultStartApps = [
        {
            id: 'notepad',
            label: 'Notepad',
            icon: '📝',
            onLaunch: () => {
                if (typeof StartProcess === 'function') StartProcess('Notepad');
                if (typeof createArkWindow === 'function') {
                    const win = createArkWindow('Notepad', 'Notepad', {
                        width: 320,
                        height: 260,
                        x: 80,
                        y: 60,
                        title: 'Notepad',
                        themeColor: '#4f8cc9',
                    });
                    const content = document.getElementById(win.contentId);
                    if (content) {
                        content.value = 'Welcome to Ash';
                    }
                }
            },
        },
        {
            id: 'explorer',
            label: 'Explorer',
            icon: '📁',
            onLaunch: () => {
                if (typeof StartProcess === 'function') StartProcess('Explorer');
                if (typeof createArkWindow === 'function') {
                    createArkWindow('Explorer', 'Explorer', {
                        width: 420,
                        height: 320,
                        x: 140,
                        y: 90,
                        title: 'Explorer',
                        themeColor: '#5f8f4f',
                    });
                }
            },
        },
    ];

    const defaultShortcuts = [
        { id: 'documents', label: 'Documents', icon: '📄' },
        { id: 'pictures', label: 'Pictures', icon: '🖼️' },
    ];

    const manager = {
        windows: [],
        taskbar: null,
        startButton: null,
        startMenu: null,
        taskbarButtons: [],
        shellTheme: '#5b9bd5',
        username: 'Ash',
        startApps: defaultStartApps.slice(),
        startShortcuts: defaultShortcuts.slice(),
        startMenuOpen: false,
        register(windowState) {
            if (!this.windows.some((entry) => entry.id === windowState.id)) {
                this.windows.push(windowState);
            }
            this.ensureShellUI();
            this.refreshTaskbar();
        },
        unregister(windowState) {
            this.windows = this.windows.filter((entry) => entry.id !== windowState.id);
            this.refreshTaskbar();
        },
        setShellTheme(themeColor) {
            this.shellTheme = themeColor || '#5b9bd5';
            this.refreshTaskbar();
            this.refreshStartMenu();
        },
        setUsername(name) {
            this.username = name || 'Ash';
            this.refreshStartMenu();
        },
        setStartMenuItems(apps, shortcuts) {
            this.startApps = (apps && apps.length ? apps : defaultStartApps).slice();
            this.startShortcuts = (shortcuts && shortcuts.length ? shortcuts : defaultShortcuts).slice();
            this.refreshStartMenu();
        },
        ensureShellUI() {
            if (this.taskbar && this.startButton && this.startMenu) return;
            const container = document.getElementById('bema-container');
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const taskbarHeight = 54;
            const taskbarY = Math.max(0, rect.height - taskbarHeight);

            // Create taskbar using AEA
            AEA({
                type: 'div',
                id: 'ash-taskbar',
                position: { x: 0, y: taskbarY },
                size: { width: rect.width, height: taskbarHeight },
                border: { width: 1, color: 'rgba(0,0,0,0.45)', radius: 0 },
                colors: { bg: 'rgba(240,248,255,0.02)', text: '#fff' },
                classNames: 'aero-glass-surface ash-taskbar ash-taskbar-enter',
                css: {
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.65), 0 -10px 30px rgba(0, 0, 0, 0.16)',
                    borderRadius: '0',
                    borderTop: '1px solid rgba(0,0,0,0.45)',
                    borderBottom: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    zIndex: '9998',
                    overflow: 'visible',
                }
            });
            this.taskbar = document.getElementById('ash-taskbar');

            // Create start button using AEA
            AEA({
                type: 'Button',
                id: 'ash-start-button',
                position: { x: 8, y: 8 },
                size: { width: 92, height: 36 },
                border: { width: 1, color: 'rgba(0,0,0,0.55)', radius: 10 },
                colors: { bg: 'rgba(0,0,0,0.45)', text: '#0f2f56' },
                text: { content: 'Start', align: 'center', size: 13, font: 'Segoe UI' },
                classNames: 'ash-start-button',
                css: {
                    position: 'absolute',
                    cursor: 'pointer',
                    fontWeight: '700',
                    boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.6)',
                    transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                }
            });
            this.startButton = document.getElementById('ash-start-button');
            this.startButton.addEventListener('click', () => this.toggleStartMenu());

            // Create start menu using AEA
            AEA({
                type: 'div',
                id: 'ash-start-menu',
                position: { x: 10, y: Math.max(10, rect.height - 420 - 64) },
                size: { width: 360, height: 420 },
                border: { width: 1, color: 'rgba(0,0,0,0.45)', radius: 18 },
                colors: { bg: 'rgba(240,248,255,0.02)', text: '#fff' },
                classNames: 'aero-glass-surface ash-start-menu',
                css: {
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    padding: '12px',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.7), 0 18px 42px rgba(0, 0, 0, 0.24)',
                    zIndex: '9999',
                    opacity: '0',
                    pointerEvents: 'none',
                    transform: 'perspective(1000px) scale(0.88) rotateY(-8deg)',
                    transition: 'all 0.24s cubic-bezier(0.22, 1, 0.36, 1)',
                    overflow: 'hidden',
                }
            });
            this.startMenu = document.getElementById('ash-start-menu');

            document.addEventListener('mousedown', (event) => {
                const clickedInsideMenu = this.startMenu && this.startMenu.contains(event.target);
                const clickedStartButton = this.startButton && this.startButton.contains(event.target);
                if (this.startMenuOpen && !clickedInsideMenu && !clickedStartButton) {
                    this.hideStartMenu();
                }
            });

            this.renderTaskbar();
            this.renderStartMenu();
        },
        refreshTaskbar() {
            if (!this.taskbar) {
                this.ensureShellUI();
                return;
            }
            this.renderTaskbar();
        },
        refreshStartMenu() {
            if (!this.startMenu) {
                this.ensureShellUI();
                return;
            }
            this.renderStartMenu();
        },
        renderTaskbar() {
            if (!this.taskbar || !this.startButton) return;
            const container = document.getElementById('bema-container');
            if (!container) return;
            const rect = container.getBoundingClientRect();

            // Remove old window buttons
            this.taskbarButtons.forEach((id) => {
                const oldButton = document.getElementById(id);
                if (oldButton) oldButton.remove();
            });
            this.taskbarButtons = [];

            // Create window buttons using AEA
            const visibleWindows = this.windows.filter((entry) => entry && !entry.closed);
            visibleWindows.forEach((windowState, index) => {
                const buttonId = `${windowState.id}-taskbar`;
                const leftOffset = 112 + index * 168;
                AEA({
                    type: 'Button',
                    id: buttonId,
                    position: { x: leftOffset, y: 8 },
                    size: { width: 156, height: 36 },
                    border: { width: 1, color: 'rgba(0,0,0,0.55)', radius: 10 },
                    colors: { bg: 'rgba(0,0,0,0.45)', text: '#183b63' },
                    text: { content: windowState.title || windowState.process || `Window ${index + 1}`, align: 'left', size: 12, font: 'Segoe UI' },
                    classNames: 'ash-taskbar-window-button ash-taskbar-button-enter',
                    css: {
                        position: 'absolute',
                        cursor: 'pointer',
                        boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.6)',
                        transition: 'all 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
                        paddingLeft: '12px',
                        paddingRight: '12px',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                    }
                });
                const button = document.getElementById(buttonId);
                if (button) {
                    button.style.setProperty('--taskbar-accent', windowState.themeColor || this.shellTheme);
                    button.addEventListener('click', () => {
                        if (windowState.minimized) {
                            windowState.restoreWindow();
                        } else {
                            windowState.minimizeWindow();
                        }
                    });
                }
                this.taskbarButtons.push(buttonId);
            });
        },
        renderStartMenu() {
            if (!this.startMenu) return;
            this.startMenu.innerHTML = '';

            // Create header section
            const headerDiv = document.createElement('div');
            headerDiv.className = 'ash-start-menu-header';
            headerDiv.style.display = 'flex';
            headerDiv.style.alignItems = 'center';
            headerDiv.style.gap = '10px';
            headerDiv.style.padding = '10px 8px 12px';
            headerDiv.style.borderBottom = '1px solid rgba(24, 59, 99, 0.12)';
            headerDiv.style.animation = 'ash-menu-item-slide 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards';
            
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'ash-start-menu-avatar';
            avatarDiv.textContent = 'A';
            avatarDiv.style.width = '42px';
            avatarDiv.style.height = '42px';
            avatarDiv.style.display = 'grid';
            avatarDiv.style.placeItems = 'center';
            avatarDiv.style.borderRadius = '50%';
            avatarDiv.style.background = `linear-gradient(135deg, ${this.shellTheme}, #ffffff)`;
            avatarDiv.style.color = '#fff';
            avatarDiv.style.fontWeight = '700';
            avatarDiv.style.boxShadow = '0 4px 12px rgba(91, 155, 213, 0.3)';
            avatarDiv.style.transition = 'all 0.28s cubic-bezier(0.22, 1, 0.36, 1)';
            
            const infoDiv = document.createElement('div');
            infoDiv.style.display = 'flex';
            infoDiv.style.flexDirection = 'column';
            
            const userDiv = document.createElement('div');
            userDiv.className = 'ash-start-menu-user';
            userDiv.textContent = this.username;
            userDiv.style.fontSize = '15px';
            userDiv.style.fontWeight = '700';
            userDiv.style.color = '#103458';
            
            const subtitleDiv = document.createElement('div');
            subtitleDiv.className = 'ash-start-menu-subtitle';
            subtitleDiv.textContent = '';
            subtitleDiv.style.fontSize = '11px';
            subtitleDiv.style.color = '#486a8b';
            
            infoDiv.appendChild(userDiv);
            infoDiv.appendChild(subtitleDiv);
            headerDiv.appendChild(avatarDiv);
            headerDiv.appendChild(infoDiv);
            this.startMenu.appendChild(headerDiv);

            // Create content section
            const contentDiv = document.createElement('div');
            contentDiv.className = 'ash-start-menu-content';
            contentDiv.style.display = 'grid';
            contentDiv.style.gap = '10px';
            contentDiv.style.overflow = 'auto';
            contentDiv.style.maxHeight = '320px';
            this.startMenu.appendChild(contentDiv);

            // Programs section
            const appSection = document.createElement('div');
            appSection.className = 'ash-start-menu-section';
            appSection.style.display = 'flex';
            appSection.style.flexDirection = 'column';
            appSection.style.gap = '6px';
            
            const appTitle = document.createElement('div');
            appTitle.className = 'ash-start-menu-section-title';
            appTitle.textContent = 'Programs';
            appTitle.style.fontSize = '11px';
            appTitle.style.fontWeight = '700';
            appTitle.style.textTransform = 'uppercase';
            appTitle.style.letterSpacing = '0.08em';
            appTitle.style.color = '#486a8b';
            appTitle.style.padding = '2px 4px';
            appSection.appendChild(appTitle);
            contentDiv.appendChild(appSection);

            this.startApps.forEach((app, idx) => {
                const buttonId = `ash-start-app-${app.id}`;
                AEA({
                    type: 'Button',
                    id: buttonId,
                    position: { x: 0, y: 0 },
                    size: { width: 320, height: 36 },
                    border: { width: 1, color: 'rgba(0,0,0,0.55)', radius: 10 },
                    colors: { bg: 'rgba(0,0,0,0.45)', text: '#183b63' },
                    text: { content: `${app.icon || '▥'} ${app.label || app.id}`, align: 'left', size: 13, font: 'Segoe UI' },
                    classNames: 'ash-start-menu-item ash-start-menu-item-enter',
                    css: {
                        position: 'static',
                        cursor: 'pointer',
                        boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.6)',
                        transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                        paddingLeft: '10px',
                        paddingRight: '10px',
                        marginBottom: '6px',
                        textAlign: 'left',
                        animationDelay: `${0.08 + idx * 0.08}s`,
                    }
                });
                const button = document.getElementById(buttonId);
                if (button) {
                    button.style.setProperty('--start-accent', this.shellTheme);
                    button.addEventListener('click', () => {
                        if (typeof app.onLaunch === 'function') app.onLaunch();
                        this.hideStartMenu();
                    });
                    appSection.appendChild(button);
                }
            });

            // Shortcuts section
            const shortcutSection = document.createElement('div');
            shortcutSection.className = 'ash-start-menu-section';
            shortcutSection.style.display = 'flex';
            shortcutSection.style.flexDirection = 'column';
            shortcutSection.style.gap = '6px';
            
            const shortcutTitle = document.createElement('div');
            shortcutTitle.className = 'ash-start-menu-section-title';
            shortcutTitle.textContent = 'Shortcuts';
            shortcutTitle.style.fontSize = '11px';
            shortcutTitle.style.fontWeight = '700';
            shortcutTitle.style.textTransform = 'uppercase';
            shortcutTitle.style.letterSpacing = '0.08em';
            shortcutTitle.style.color = '#486a8b';
            shortcutTitle.style.padding = '2px 4px';
            shortcutSection.appendChild(shortcutTitle);
            contentDiv.appendChild(shortcutSection);

            this.startShortcuts.forEach((shortcut, idx) => {
                const buttonId = `ash-start-shortcut-${shortcut.id}`;
                AEA({
                    type: 'Button',
                    id: buttonId,
                    position: { x: 0, y: 0 },
                    size: { width: 320, height: 32 },
                    border: { width: 1, color: 'rgba(0,0,0,0.55)', radius: 10 },
                    colors: { bg: 'rgba(0,0,0,0.45)', text: '#183b63' },
                    text: { content: `${shortcut.icon || '▥'} ${shortcut.label || shortcut.id}`, align: 'left', size: 12, font: 'Segoe UI' },
                    classNames: 'ash-start-menu-item compact ash-start-menu-item-enter',
                    css: {
                        position: 'static',
                        cursor: 'pointer',
                        boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.6)',
                        transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                        paddingLeft: '10px',
                        paddingRight: '10px',
                        marginBottom: '6px',
                        textAlign: 'left',
                        animationDelay: `${0.16 + idx * 0.08}s`,
                    }
                });
                const button = document.getElementById(buttonId);
                if (button) {
                    button.style.setProperty('--start-accent', this.shellTheme);
                    button.addEventListener('click', () => {
                        if (typeof shortcut.onLaunch === 'function') shortcut.onLaunch();
                        this.hideStartMenu();
                    });
                    shortcutSection.appendChild(button);
                }
            });
        },
        toggleStartMenu() {
            if (this.startMenuOpen) {
                this.hideStartMenu();
            } else {
                this.showStartMenu();
            }
        },
        showStartMenu() {
            this.startMenuOpen = true;
            if (this.startMenu) {
                this.startMenu.style.opacity = '1';
                this.startMenu.style.pointerEvents = 'auto';
                this.startMenu.style.transform = 'perspective(1000px) scale(1) rotateY(0)';
                this.startMenu.classList.add('ash-start-menu-open');
            }
            this.renderStartMenu();
        },
        hideStartMenu() {
            this.startMenuOpen = false;
            if (this.startMenu) {
                this.startMenu.style.opacity = '0';
                this.startMenu.style.pointerEvents = 'none';
                this.startMenu.style.transform = 'perspective(1000px) scale(0.88) rotateY(-8deg)';
                this.startMenu.classList.remove('ash-start-menu-open');
            }
        },
    };

    if (typeof window !== 'undefined') {
        window.__ashWindowManager = manager;
    }
    return manager;
}

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
    const minId = `${windowId}-min`;
    const resizeId = `${windowId}-resize`;
    const overlayId = `${windowId}-overlay`;

    const minWidth = 200;
    const minHeight = 240;
    const titleHeight = 32;
    //const manager = createAshWindowManager();
    var state = {
        id: windowId,
        x: Info.x,
        y: Info.y,
        contentId: contentId,
        titleId: titleId,
        frameId: frameId,
        closeId: closeId,
        maxId: maxId,
        minId: minId,
        overlayId: overlayId,
        width: Math.max(Info.width, minWidth),
        height: Math.max(Info.height, minHeight),
        title: Info.title,
        process: Process,
        themeColor: Info.themeColor || Info.theme || '#5b9bd5',
        buttons: [],
        dragging: false,
        resizing: false,
        minimized: false,
        maximized: false,
        restoreBounds: null,
        minimizeRestoreBounds: null,
        closed: false,
        dragStart: { x: 0, y: 0, windowX: 0, windowY: 0, windowW: 0, windowH: 0 },
    };

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function clampAspect(width, height) {
        const minRatio = 0.1; // 1:10
        const maxRatio = 10;  // 10:1
        const ratio = width / height;
        if (ratio > maxRatio) {
            width = height * maxRatio;
        } else if (ratio < minRatio) {
            height = width / minRatio;
        }
        return { width, height };
    }

    function capFontSize(size, elementWidth, minSize = 10) {
        const maxSize = Math.round(elementWidth * 0.8);
        return Math.max(minSize, Math.min(size, maxSize));
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
        ({ width: state.width, height: state.height } = clampAspect(state.width, state.height));

        const contentHeight = state.height - titleHeight;

        setProperty(frameId, 'left', px(state.x));
        setProperty(frameId, 'top', px(state.y));
        setProperty(frameId, 'width', px(state.width));
        setProperty(frameId, 'height', px(state.height));

        setProperty(titleId, 'left', px(state.x));
        setProperty(titleId, 'top', px(state.y));
        setProperty(titleId, 'width', px(state.width));
        //setProperty(titleId, 'height', px(titleHeight));
        //setProperty(titleId, 'font-size', px(capFontSize(Math.round(state.width * 0.04), state.width, 14)));

        setProperty(contentId, 'left', px(state.x));
        setProperty(contentId, 'top', px(state.y + titleHeight));
        setProperty(contentId, 'width', px(state.width));
        setProperty(contentId, 'height', px(contentHeight));
        setProperty(contentId, 'font-size', px(capFontSize(Math.round(state.width * 0.03), state.width, 12)));

        setProperty(closeId, 'left', px(state.x + state.width - 52));
        setProperty(closeId, 'top', px(state.y));
        setProperty(closeId, 'width', px(52));
        setProperty(closeId, 'height', px(titleHeight));
        //setProperty(closeId, 'font-size', px(capFontSize(Math.round(state.width * 0.035), 52, 14)));

        setProperty(maxId, 'left', px(state.x + state.width - 104));
        setProperty(maxId, 'top', px(state.y));
        setProperty(maxId, 'width', px(52));
        setProperty(maxId, 'height', px(titleHeight));
        //setProperty(maxId, 'font-size', px(capFontSize(Math.round(state.width * 0.035), 52, 14)));

        setProperty(resizeId, 'left', px(state.x + state.width - 28));
        setProperty(resizeId, 'top', px(state.y + state.height - 28));
        setProperty(resizeId, 'width', px(24));
        setProperty(resizeId, 'height', px(24));

  /*
        setProperty(overlayId, 'left', px(state.x));
        setProperty(overlayId, 'top', px(state.y));
        setProperty(overlayId, 'width', px(state.width));
        setProperty(overlayId, 'height', px(state.height));
        setProperty(overlayId, 'font-size', px(capFontSize(Math.round(state.width * 0.03), state.width, 12)));
        const overlayEl = document.getElementById(overlayId);
        if (overlayEl) overlayEl.readOnly = true;*/

        state.buttons.forEach(button => {
            const x = state.x + Math.round(state.width * clamp(button.x, 0, 1));
            const y = state.y + Math.round(state.height * clamp(button.y, 0, 1));
            let width = Math.round(state.width * clamp(button.width, 0, 1));
            let height = Math.round(state.height * clamp(button.height, 0, 1));
            ({ width, height } = clampAspect(width, height));
            const fontSize = capFontSize(Math.round(width * (button.fontSize || 0.04)), width, 10);

            setProperty(button.id, 'left', px(x));
            setProperty(button.id, 'top', px(y));
            setProperty(button.id, 'width', px(width));
            setProperty(button.id, 'height', px(height));
            setProperty(button.id, 'font-size', px(fontSize));
        });
    }

    function createWindowChildButton(config) {
        const id = `${windowId}-child-${config.name || Math.random().toString(36).slice(2, 8)}`;
        const initialWidth = Math.round(state.width * (config.width || 0.2));
        const initialHeight = Math.round(state.height * (config.height || 0.08));
        const sized = clampAspect(initialWidth, initialHeight);
        AEA({
            type: 'Button',
            id,
            position: { x: state.x + Math.round(state.width * (config.x || 0)), y: state.y + Math.round(state.height * (config.y || 0)) },
            size: { width: sized.width, height: sized.height },
            border: { width: 1, color: config.borderColor || '#888', radius: config.borderRadius || 8 },
            colors: { bg: config.bg || '#333', text: config.textColor || '#fff' },
            text: { content: config.label || '', align: 'center', size: capFontSize(Math.max(12, Math.round(state.width * (config.fontSize || 0.04))), sized.width, 12), font: config.font || 'sans-serif' },
            css: { position: 'absolute', cursor: 'pointer' },
            theme: config.theme || null,
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
        border: { width: 1, color: 'rgba(0,0,0,0.4)', radius: 12 },
        colors: { bg: 'transparent', text: '#fff' },
        text: { content: '', align: 'left', size: 14, font: 'sans-serif' },
        css: { position: 'absolute', overflow: 'hidden', background: 'rgba(0,0,0,0.06)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.3), 0 10px 24px rgba(0, 0, 0, 0.2)', animation: 'ash-window-enter 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards' },
    });

    AEA({
        type: 'TextArea',
        id: titleId,
        position: { x: state.x, y: state.y },
        size: { width: state.width, height: titleHeight },
        border: { width: 0, color: 'transparent', radius: 0 },
        colors: { bg: 'transparent', text: '#fff' },
        text: { content: state.title, align: 'left', size: Math.max(14, Math.round(state.width * 0.04)), font: 'Arial' },
        readOnly: true,
        css: { position: 'absolute', padding: '10px', boxSizing: 'border-box', background: 'rgba(0,0,0,0.08)', borderRadius: '12px 12px 0 0', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' },
    });

    AEA({
        type: 'TextArea',
        id: contentId,
        position: { x: state.x, y: state.y + titleHeight },
        size: { width: state.width, height: state.height - titleHeight },
        border: { width: 0, color: 'transparent', radius: 0 },
        colors: { bg: 'transparent', text: '#fff' },
        text: { content: '', align: 'left', size: Math.max(12, Math.round(state.width * 0.03)), font: 'Arial' },
        readOnly: true,
        css: { position: 'absolute', padding: '12px', boxSizing: 'border-box', overflow: 'auto', background: 'rgba(0,0,0,0.05)', borderRadius: '0 0 12px 12px', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' },
    });

    // transparent overlay that covers the full window with white text
    /*AEA({
        type: 'TextArea',
        id: overlayId,
        position: { x: state.x, y: state.y },
        size: { width: state.width, height: state.height },
        border: { width: 0, color: 'transparent', radius: 0 },
        colors: { bg: 'transparent', text: '#fff' },
        text: { content: '', align: 'left', size: Math.max(12, Math.round(state.width * 0.03)), font: 'Arial' },
        readOnly: true,
        css: { position: 'absolute', padding: '12px', boxSizing: 'border-box', overflow: 'auto', background: 'transparent', color: '#fff', zIndex: 9999 },
    });*/

    AEA({
        type: 'Button',
        id: closeId,
        position: { x: state.x + state.width - 52, y: state.y },
        size: { width: 52, height: titleHeight },
        border: { width: 0, color: 'transparent', radius: 0 },
        colors: { bg: '#c0392b', text: '#fff' },
        text: { content: 'X', align: 'center', size: Math.max(16, Math.round(state.width * 0.035)), font: 'Arial' },
        readOnly: true,
        css: { position: 'absolute', cursor: 'pointer', borderRadius: '0 12px 0 0' },
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
        theme: 'solid',
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
            const frameEl = document.getElementById(frameId);
            if (frameEl) {
                frameEl.classList.add('ash-window-exit');
                window.setTimeout(() => {
                    state.closed = true;
                    ////////////////////////////////////manager.unregister(state);
                    [frameId, titleId, contentId, closeId, maxId, minId, resizeId, overlayId].forEach(id => {
                        const element = document.getElementById(id);
                        if (element) element.remove();
                    });
                    state.buttons.forEach((button) => {
                        const element = document.getElementById(button.id);
                        if (element) element.remove();
                    });
                }, 180);
            }
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

    if (document.getElementById(minId)) {
        const minElement = document.getElementById(minId);
        minElement.addEventListener('click', () => {
            if (state.minimized) {
                state.restoreWindow();
            } else {
                state.minimizeWindow();
            }
        });
    }

    state.restoreWindow = function() {
        if (!state.minimized) return;
        const restoreBounds = state.minimizeRestoreBounds || { x: state.x, y: state.y, width: state.width, height: state.height };
        state.minimized = false;
        state.x = restoreBounds.x;
        state.y = restoreBounds.y;
        state.width = restoreBounds.width;
        state.height = restoreBounds.height;
        [frameId, titleId, contentId, closeId, maxId, minId, resizeId].forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = element.tagName === 'TEXTAREA' ? 'flex' : (element.tagName === 'BUTTON' ? 'inline-block' : 'block');
                element.classList.remove('ash-window-minimized');
                element.classList.add('ash-window-enter');
            }
        });
        layoutWindow();
        //////////////////////////////////manager.refreshTaskbar();
    };

    state.minimizeWindow = function() {
        if (state.minimized) return;
        state.minimizeRestoreBounds = { x: state.x, y: state.y, width: state.width, height: state.height };
        state.minimized = true;
        [frameId, titleId, contentId, closeId, maxId, minId, resizeId].forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('ash-window-minimized');
            }
        });
        //////////////////////////////////manager.refreshTaskbar();
    };

    //////////////////////////////////manager.register(state);


    layoutWindow();
    state.contentId = contentId;
    state.titleId = titleId;
    state.frameId = frameId;
    state.closeId = closeId;
    state.maxId = maxId;
    state.createChildButton = createWindowChildButton;
    return state;
}
function notepad() {
    StartProcess("Notepad");
const myWindow = createArkWindow("Notepad", "Notepad", { width: 250, height: 250, x: 50, y: 50, title: "My Window" });
const contentElement = document.getElementById(myWindow.contentId);
if (contentElement) {
    contentElement.removeAttribute("readonly")
    contentElement.readOnly = false;  // or false
    contentElement.value = "Hello, World!";  // or false
}
}   
function notepad2() {
    StartProcess("Notepad2");
const myWindow = createArkWindow("Notepad2", "Notepad2", { width: 250, height: 250, x: 50, y: 50, title: "My Window" });
const contentElement = document.getElementById(myWindow.contentId);
if (contentElement) {
    contentElement.removeAttribute("readonly")
    contentElement.readOnly = false;  // or false
    contentElement.value = "Hello, World!";
}   

}

notepad();
notepad2();