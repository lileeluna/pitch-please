const fs = require("fs");
const path = require("path");

const files = [
  "pitch-please/package.json",
  "pitch-please/package-lock.json",
  "backend/package.json",
  "backend/package-lock.json",
];

for (const file of files) {
  try {
    const content = fs.readFileSync(file, "utf8");
    JSON.parse(content);
    console.log(`${file}: OK`);
  } catch (e) {
    console.log(`${file}: ERROR - ${e.message}`);
  }
}
