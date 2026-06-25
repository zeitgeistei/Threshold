var SystemVersion = 0x80000001;
var SystemSubver = 0x0000;
var BuildVersion = "0.1.0";
var BuildNumber = 77;
var BuildTimestamp = 1782270079238;
var BuildExpiration = 1798513279238;
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
