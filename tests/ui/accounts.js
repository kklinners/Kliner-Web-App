// Reads test logins from TEST_ACCOUNTS.local.md (git-ignored) so no passwords live in code.
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "..", "TEST_ACCOUNTS.local.md");
if (!fs.existsSync(file)) {
  throw new Error(
    "TEST_ACCOUNTS.local.md not found. Create it with:\n  cd ../kklinners-backend && node scripts/seed-test-accounts.js --out ../Kliner-Web-App/TEST_ACCOUNTS.local.md"
  );
}
const rows = {};
for (const m of fs.readFileSync(file, "utf8").matchAll(/^\| (admin|vendor|customer) \| `([^`]+)` \| `([^`]+)` \|/gm)) {
  rows[m[1]] = { email: m[2], password: m[3] };
}
module.exports = rows;
