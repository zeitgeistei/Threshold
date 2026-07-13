const kernelLoader = LoggingFramework.startBrailleLoading("Kernel Loading.. ");

var kernelComponents = [];

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function interpretComponentArgs(rawArgs) {
    const normalized = rawArgs === undefined || rawArgs === null
        ? []
        : Array.isArray(rawArgs)
            ? rawArgs
            : [rawArgs];

    const namedArgs = {};
    const positionalArgs = [];

    normalized.forEach((entry) => {
        if (isPlainObject(entry)) {
            Object.assign(namedArgs, entry);
        } else {
            positionalArgs.push(entry);
        }
    });

    return {
        raw: rawArgs,
        values: normalized,
        positional: positionalArgs,
        named: namedArgs,
        get: (name) => namedArgs[name],
        has: (name) => Object.prototype.hasOwnProperty.call(namedArgs, name)
    };
}

function serializeDebugValue(value) {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean" || value === null || value === undefined) return String(value);

    try {
        return JSON.stringify(value, null, 2);
    } catch (error) {
        return String(value);
    }
}

function emitDebugEvent(componentName, level, message, details) {
    const renderedMessage = [message, details]
        .filter((entry) => entry !== undefined && entry !== null && entry !== "")
        .map((entry) => typeof entry === "string" ? entry : serializeDebugValue(entry))
        .join(" ");

    if (!renderedMessage) return;

    const output = `[${componentName}] ${renderedMessage}`;

    if (level === "error") {
        LoggingFramework.error(output);
    } else if (level === "warn") {
        LoggingFramework.log(output);
        console.warn(output);
    } else {
        LoggingFramework.info(output);
    }
}

function ComponentRegister(Name, version, uniqueId, componentFunction, exposedFunctions = {}) {
    // Register the component with the kernel
    LoggingFramework.log("Component Registered: " + Name + " Version: " + version + " Unique ID: " + uniqueId);

    // Store the component function and any helpers that should be accessible when it runs
    kernelComponents.push({
        Name: Name,
        Version: version,
        UniqueId: uniqueId,
        ComponentFunction: componentFunction,
        ExposedFunctions: exposedFunctions,
        RegisteredAt: Date.now()
    });
    return kernelComponents.length;
}

ComponentRegister("SysMain", "1.0.0", "kernel-001", function(context, args) {
    context.debug("Kernel component executed", { args, namedArgs: context.namedArgs });

    if (context.interpretedArgs.has("kernelf")) {
        context.debugInfo("Kernel flag detected", context.interpretedArgs.get("kernelf"));
    }

    (Array.isArray(args) ? args : [args]).forEach((arg, index) => {
        context.debug(`Arg[${index}]`, arg);
    });

    console.log("Kernel component executed with context:", context);
    
});

function runComponent(kl, runtimeContext = {}, rawArgs = []) {
    LoggingFramework.log("Running Kernel Components...");

    const interpretedArgs = interpretComponentArgs(rawArgs);
    const componentContext = {
        ...runtimeContext,
        ...kl.ExposedFunctions,
        componentName: kl.Name,
        componentVersion: kl.Version,
        componentId: kl.UniqueId,
        runtimeContext,
        rawArgs,
        args: interpretedArgs.positional,
        namedArgs: interpretedArgs.named,
        interpretedArgs,
        registerComponent: ComponentRegister,
        runComponent: (target, extraContext, extraArgs) => runComponent(target, extraContext || runtimeContext, extraArgs ?? []),
        getComponent: (name) => kernelComponents.find((entry) => entry.Name === name),
        listComponents: () => kernelComponents.map((entry) => ({
            Name: entry.Name,
            Version: entry.Version,
            UniqueId: entry.UniqueId,
            RegisteredAt: entry.RegisteredAt
        })),
        debug: (message, details) => emitDebugEvent(kl.Name, "info", message, details),
        debugInfo: (message, details) => emitDebugEvent(kl.Name, "info", message, details),
        debugWarn: (message, details) => emitDebugEvent(kl.Name, "warn", message, details),
        debugError: (message, details) => emitDebugEvent(kl.Name, "error", message, details),
        inspect: (value, label) => emitDebugEvent(kl.Name, "info", label || "Inspect", value),
        trace: (message, details) => emitDebugEvent(kl.Name, "info", message, details),
        parseArgs: (input) => interpretComponentArgs(input)
    };

    return kl.ComponentFunction.call(componentContext, componentContext, interpretedArgs.positional);
}

/*function ComponentRegister_K(Name,version,uniqueId,componentFunction){
    // Register the component with the kernel
    LoggingFramework.log("Component Registered: " + Name + " Version: " + version + " Unique ID: " + uniqueId);

    // Store the component function
    kernelComponents.push({Name: Name, Version: version, UniqueId: uniqueId, ComponentFunction: componentFunction});
}*/

kernelLoader.succeed("Kernel Loaded Successfully");
runComponent(kernelComponents[0], { LoggingFramework: LoggingFramework }, [{"kernelf":"Development"}]);