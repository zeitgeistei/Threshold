var SystemVersion = 0x80000001; 
var SystemSubver = 0x0000;

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

function StartProcess(Name) {
    appendItem(Processes, [
        Name,
        1,
    ]);
}

StartProcess("FemboyBoot");

console.log(Processes)