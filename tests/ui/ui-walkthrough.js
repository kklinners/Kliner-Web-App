// Drives the admin + vendor dashboards through the real UI and screenshots each step.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const path = require("path");

const OUT = path.join(__dirname, "screenshots");
const BASE = process.env.BASE || "http://localhost:3001";
const { admin: ADMIN, vendor: VENDOR } = require("./accounts");

const errors = [];
let step = 0;
const shot = async (page, name) => {
  step++;
  const file = path.join(OUT, `${String(step).padStart(2, "0")}-${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log("📸", path.basename(file));
};

const login = async (browser, creds, viewport) => {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`[${creds.email}] pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`[${creds.email}] console: ${m.text().slice(0, 200)}`));
  await page.goto(`${BASE}/auth/signin`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.includes("/auth/signin"), { timeout: 30000 });
  return { ctx, page };
};

(async () => {
  require("fs").mkdirSync(OUT, { recursive: true });
  
  const browser = await chromium.launch();
  const desktop = { width: 1440, height: 900 };
  const mobile = { width: 390, height: 844 };

  /* ---------------- admin: overview, partners, assign ---------------- */
  const admin = await login(browser, ADMIN, desktop);
  let p = admin.page;
  await p.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await p.getByText("Booking value").waitFor();
  await shot(p, "admin-overview");

  await p.getByRole("button", { name: /^Partners/ }).first().click();
  await p.getByText("Sparkle Hands Cleaning").first().waitFor();
  await shot(p, "admin-partners");
  await p.getByText("Sparkle Hands Cleaning").first().click();
  await p.getByRole("dialog").waitFor();
  await shot(p, "admin-partner-drawer");
  await p.keyboard.press("Escape");

  await p.getByRole("button", { name: /^Jobs/ }).first().click();
  await p.getByText("Needs partner").first().waitFor();
  await shot(p, "admin-jobs-needs-partner");
  await p.locator("table tbody tr").first().click();
  await p.getByRole("dialog").waitFor();
  await p.getByRole("dialog").getByRole("button", { name: /Sparkle Hands Cleaning/ }).click();
  await shot(p, "admin-job-drawer-assign");
  await p.getByRole("button", { name: /Assign job/ }).click();
  await p.getByRole("dialog").getByText("Offered", { exact: true }).first().waitFor();
  await shot(p, "admin-job-assigned");
  await p.keyboard.press("Escape");

  /* ---------------- vendor: accept, start, complete ---------------- */
  const vendor = await login(browser, VENDOR, desktop);
  let v = vendor.page;
  await v.goto(`${BASE}/partner`, { waitUntil: "networkidle" });
  await v.getByText("Job requests").first().waitFor();
  await shot(v, "vendor-requests");
  await v.getByRole("button", { name: "Accept job" }).first().click();
  await v.getByText("Job accepted").waitFor();
  await shot(v, "vendor-schedule-after-accept");
  await v.getByRole("button", { name: /Team has arrived/ }).first().click();
  await v.getByRole("button", { name: "Mark as completed" }).first().waitFor();
  await v.getByRole("button", { name: "Mark as completed" }).first().click();
  await shot(v, "vendor-confirm-complete");
  await v.getByRole("button", { name: "Yes, job is complete" }).click();
  await v.getByText("Great work").waitFor();
  await v.getByRole("button", { name: /^Earnings/ }).first().click();
  await v.getByText("You earn").first().waitFor();
  await shot(v, "vendor-earnings");
  await v.getByRole("button", { name: /^Business/ }).first().click();
  await shot(v, "vendor-business");

  /* ---------------- admin: payout ---------------- */
  await p.reload({ waitUntil: "networkidle" });
  await p.getByRole("button", { name: /^Payouts/ }).first().click();
  await p.getByText("To pay now").waitFor();
  await shot(p, "admin-payouts");
  await p.locator("table tbody tr").first().click();
  await p.getByPlaceholder("Bank transfer reference").fill("UI-TRF-0002");
  await shot(p, "admin-payout-drawer");
  await p.getByRole("button", { name: /as paid/ }).click();
  await p.getByRole("dialog").getByText("Paid out").first().waitFor();
  await shot(p, "admin-payout-paid");
  await p.keyboard.press("Escape");
  await p.getByRole("button", { name: /^Overview/ }).first().click();
  await p.getByText("Booking value").waitFor();
  await shot(p, "admin-overview-after");

  /* ---------------- mobile ---------------- */
  const adminM = await login(browser, ADMIN, mobile);
  await adminM.page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await adminM.page.getByText("Booking value").waitFor();
  await shot(adminM.page, "mobile-admin-overview");
  await adminM.page.locator("nav button", { hasText: "Jobs" }).last().click();
  await adminM.page.getByText("Completed").first().click();
  await shot(adminM.page, "mobile-admin-jobs");

  const vendorM = await login(browser, VENDOR, mobile);
  await vendorM.page.goto(`${BASE}/partner`, { waitUntil: "networkidle" });
  await vendorM.page.getByText("Job requests").first().waitFor();
  await vendorM.page.locator("nav button", { hasText: "History" }).last().click();
  await shot(vendorM.page, "mobile-vendor-history");

  await browser.close();
  console.log(errors.length ? `\n${errors.length} browser errors:\n${[...new Set(errors)].join("\n")}` : "\nNo browser errors.");
})().catch(async (e) => {
  console.error("Walkthrough failed:", e.message);
  console.log(errors.join("\n"));
  process.exit(1);
});
