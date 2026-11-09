// Vendor onboarding through the real UI: vendors page → login → apply → pending → admin verifies → dashboard.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const path = require("path");

const OUT = path.join(__dirname, "screenshots");
const BASE = process.env.BASE || "http://localhost:3001";
const { admin: ADMIN, vendor: VENDOR } = require("./accounts");
const errors = [];
let step = 40;
const shot = async (page, name, fullPage = false) => {
  step++;
  await page.screenshot({ path: path.join(OUT, `${step}-${name}.png`), fullPage });
  console.log("📸", `${step}-${name}.png`);
};
const watch = (page, who) => {
  page.on("pageerror", (e) => errors.push(`[${who}] ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`[${who}] console: ${m.text().slice(0, 200)}`));
};

(async () => {
  require("fs").mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const desktop = { width: 1440, height: 900 };

  /* ---- vendor ---- */
  const vctx = await browser.newContext({ viewport: desktop });
  const v = await vctx.newPage();
  watch(v, "vendor");
  await v.goto(`${BASE}/partners`, { waitUntil: "networkidle" });
  await shot(v, "vendors-landing", true);
  await v.getByRole("button", { name: "I already have an account" }).click();
  await v.waitForURL(/auth\/signin/);
  await v.fill('input[name="email"]', VENDOR.email);
  await v.fill('input[name="password"]', VENDOR.password);
  await v.click('button[type="submit"]');
  await v.waitForURL(/partners\/apply/, { timeout: 30000 });
  console.log("✓ login redirected vendor to the application form");
  await v.getByText("Apply to join Kliner").waitFor();

  await v.getByLabel("Business name").fill("Sparkle Hands Cleaning");
  await v.getByLabel("Office or base address").fill("5 Olorunlogbon Street, Gbagada Phase 1");
  await v.getByLabel("Team size").fill("6");
  await v.getByLabel("Years operating").fill("4");
  await v.getByLabel(/About your business/).fill("Residential deep cleaning and post-construction cleans across Gbagada.");
  await v.getByLabel(/Owner's full name/).fill("Emmanuel Waro");
  await v.getByLabel("ID you'll show us").selectOption("nin");
  await v.getByLabel("Full name", { exact: true }).nth(0).fill("Emma Waro");
  await v.locator('input[type="tel"]').nth(0).fill("08030000002");
  await v.getByLabel("Full name", { exact: true }).nth(1).fill("Grace Okafor");
  await v.locator('input[type="tel"]').nth(1).fill("08031112222");
  await v.getByLabel(/Relationship/).fill("Pastor");
  await v.getByLabel("Client 1 name").fill("Mrs Bello");
  await v.locator('input[type="tel"]').nth(2).fill("08035556666");
  await v.getByLabel("Client 2 name").fill("Mr Adeyemi");
  await v.locator('input[type="tel"]').nth(3).fill("08037778888");
  await v.getByRole("button", { name: "Laundry" }).click();
  for (const area of ["Gbagada Phase 1", "Gbagada Phase 2", "Ifako-Gbagada", "Soluyi"]) {
    await v.getByRole("button", { name: area, exact: true }).click();
  }
  await v.getByLabel("Bank").fill("GTBank");
  await v.getByLabel("Account number").fill("0123456789");
  await v.getByLabel("Account name").fill("Emmanuel Waro");
  await shot(v, "apply-form-filled", true);
  await v.getByRole("button", { name: "Submit application" }).click();
  await v.waitForURL(/\/partner$/, { timeout: 30000 });
  await v.getByText("Awaiting verification").waitFor();
  console.log("✓ application submitted, vendor sees 'Awaiting verification'");
  await shot(v, "vendor-pending");

  /* ---- admin verifies ---- */
  const actx = await browser.newContext({ viewport: desktop });
  const a = await actx.newPage();
  watch(a, "admin");
  await a.goto(`${BASE}/auth/signin`, { waitUntil: "networkidle" });
  await a.fill('input[name="email"]', ADMIN.email);
  await a.fill('input[name="password"]', ADMIN.password);
  await a.click('button[type="submit"]');
  await a.waitForURL((u) => !u.pathname.includes("/auth/signin"), { timeout: 30000 });
  await a.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await a.getByText("Needs your attention").waitFor();
  await shot(a, "admin-overview-with-application");
  await a.getByRole("button", { name: /^Applications/ }).first().click();
  await a.getByText("Sparkle Hands Cleaning").first().click();
  const drawer = a.getByRole("dialog");
  await drawer.waitFor();
  await shot(a, "admin-application-drawer");
  const verifyBtn = drawer.getByRole("button", { name: /Verify partner/ });
  console.log(`✓ Verify disabled before checks: ${await verifyBtn.isDisabled()}`);
  for (const label of ["Owner's ID seen in person", "Payout account name matches", "Guarantor called", "Office or base visited", "Past clients called"]) {
    await drawer.getByText(label).click();
    await a.waitForTimeout(600);
  }
  await drawer.getByPlaceholder(/Private notes/).fill("UI test: NIN matched. Pastor Okafor vouched. Base visited, 6 staff, own equipment.");
  await drawer.getByRole("button", { name: "Save notes" }).click();
  await a.waitForTimeout(800);
  await shot(a, "admin-checks-complete");
  console.log(`✓ Verify enabled after checks: ${!(await verifyBtn.isDisabled())}`);
  await verifyBtn.click();
  await drawer.waitFor({ state: "detached" });
  await a.getByRole("button", { name: /^Partners/ }).first().click();
  await a.getByText("Verified").first().waitFor();
  await shot(a, "admin-partner-verified");

  /* ---- vendor sees dashboard ---- */
  await v.getByRole("button", { name: /Refresh status/ }).click();
  await v.getByText("Job requests").first().waitFor();
  console.log("✓ vendor now lands on the full dashboard");
  await shot(v, "vendor-dashboard-after-verify");

  await browser.close();
  console.log(errors.length ? `\nBrowser errors:\n${[...new Set(errors)].join("\n")}` : "\nNo browser errors.");
})().catch((e) => {
  console.error("Onboarding UI test failed:", e.message);
  console.log(errors.join("\n"));
  process.exit(1);
});
