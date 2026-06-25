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
    const overlayId = `${windowId}-overlay`;

    const minWidth = 200;
    const minHeight = 240;    const titleHeight = 32;
    var state = {
        id: windowId,
        x: Info.x,
        y: Info.y,
        contentId: contentId,
        titleId: titleId,
        frameId: frameId,
        closeId: closeId,
        maxId: maxId,
        overlayId: overlayId,
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

        // overlay covers the whole window (including title) and stays readOnly
        setProperty(overlayId, 'left', px(state.x));
        setProperty(overlayId, 'top', px(state.y));
        setProperty(overlayId, 'width', px(state.width));
        setProperty(overlayId, 'height', px(state.height));
        setProperty(overlayId, 'font-size', px(capFontSize(Math.round(state.width * 0.03), state.width, 12)));
        const overlayEl = document.getElementById(overlayId);
        if (overlayEl) overlayEl.readOnly = true;

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
        text: { content: '', align: 'left', size: Math.max(12, Math.round(state.width * 0.03)), font: 'Arial' },
        readOnly: true,
        css: { position: 'absolute', padding: '12px', boxSizing: 'border-box', overflow: 'auto' },
    });

    // transparent overlay that covers the full window with white text
    AEA({
        type: 'TextArea',
        id: overlayId,
        position: { x: state.x, y: state.y },
        size: { width: state.width, height: state.height },
        border: { width: 0, color: 'transparent', radius: 0 },
        colors: { bg: 'transparent', text: '#fff' },
        text: { content: '', align: 'left', size: Math.max(12, Math.round(state.width * 0.03)), font: 'Arial' },
        readOnly: true,
        css: { position: 'absolute', padding: '12px', boxSizing: 'border-box', overflow: 'auto', background: 'transparent', color: '#fff', zIndex: 9999 },
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

notepad();