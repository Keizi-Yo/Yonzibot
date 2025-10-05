const fs = require("fs");
const path = require("path");

const warningFile = path.join(__dirname, "warnings.json");

// Baca file warning
function loadWarnings() {
    if (!fs.existsSync(warningFile)) return {};
    return JSON.parse(fs.readFileSync(warningFile));
}

// Simpan file warning
function saveWarnings(data) {
    fs.writeFileSync(warningFile, JSON.stringify(data, null, 2));
}

// Tambah warning
function addWarning(userId) {
    let warnings = loadWarnings();
    if (!warnings[userId]) warnings[userId] = 0;
    warnings[userId]++;
    saveWarnings(warnings);
    return warnings[userId];
}

// Reset warning (misal admin mau reset)
function resetWarning(userId) {
    let warnings = loadWarnings();
    warnings[userId] = 0;
    saveWarnings(warnings);
}

module.exports = { addWarning, resetWarning, loadWarnings };
