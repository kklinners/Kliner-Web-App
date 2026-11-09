# Browser tests (Playwright)

Two scripts drive the real UI and save screenshots to `tests/ui/screenshots/`.

| Script | What it covers |
|---|---|
| `ui-onboarding.js` | Vendors page → log in → application form → "Awaiting verification" → admin ticks checks and verifies → vendor dashboard |
| `ui-walkthrough.js` | Admin assigns a paid job → vendor accepts, starts, completes → admin records payout; desktop and mobile screenshots |

## Run

```bash
# 1. backend running:   cd ../kklinners-backend && node app.js
# 2. test data ready:   cd ../kklinners-backend && node scripts/e2e-marketplace.js
# 3. web app running:   npm run dev            (or: npm run build && npx next start -p 3001)
npm i -D playwright && npx playwright install chromium   # first time only
BASE=http://localhost:3000 node tests/ui/ui-walkthrough.js
```

`ui-onboarding.js` expects the vendor to have **no** partner profile yet; delete it first (or rerun the API
E2E afterwards to restore the full data set). Logins come from `TEST_ACCOUNTS.local.md`.
