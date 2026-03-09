const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const version = {
  buildId: crypto.randomUUID(),
  buildTime: new Date().toISOString(),
};

fs.writeFileSync(
  path.join(__dirname, "..", "public", "version.json"),
  JSON.stringify(version, null, 2)
);

console.log(`[build-version] Generated build ID: ${version.buildId}`);
