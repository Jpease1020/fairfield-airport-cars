# Deploy & Runtime Runbook — Fairfield Airport Cars

_Last updated: 2026-06-14._ Hard-won operational knowledge. Read before touching deps,
Node version, or deploys. Companion to `docs/SITE_AUDIT_ROADMAP.md`.

Stack: Next.js 16 (App Router) · Firebase · Square · Twilio · Vercel (auto-promotes `main` → prod).

## ⚠️ Landmines (do not relearn the hard way)

### firebase-admin is pinned to 13.x — DO NOT bump to 14
v14 → `jwks-rsa@4` → `jose@6` (ESM-only). jwks-rsa@4 does `require('jose')`, which throws
`ERR_REQUIRE_ESM` in Vercel's CommonJS serverless bundle **at module load**, crashing
**every API route** (health, booking, admin, auth → all 500). v13 → jwks-rsa@3 → jose@4 (CJS, safe).
**It passes local `npm run build` + tsc + unit/integration tests** — the crash only appears in the
deployed Vercel runtime. If you ever retry 14, verify on a **preview** deploy (`/api/health` → 200 JSON).

### Node is pinned `22.x` (not `>=22`)
A `>=22` range made Vercel pick untested **Node 24**, which broke all API routes. Keep `engines.node: "22.x"`.
Work locally on 22: `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22`.

### Keep `.npmrc` + `overrides`
`.npmrc` has `legacy-peer-deps=true` (React-19/ESLint-10 peer ranges). `package.json` `overrides`
pin `google-auth-library@10.7.0` for `googleapis-common`/`google-gax` (dedups an OAuth2Client type
conflict). Remove either and `npm ci` / tsc break.

### Vercel auto-promotes `main` → production
Every merge to `main` deploys straight to prod. This re-broke prod repeatedly. **Verify risky changes
on a preview deploy first.** Consider adding a manual-promote gate.

## Playbook

**Check prod health:** `curl -s https://www.fairfieldairportcar.com/api/health`
(healthy = `database: operational`).

**Get a prod serverless stack trace** (local build/tests won't show prod-only crashes):
```
vercel logs <deploy-url> --scope justin-peases-projects     # stream, then curl the failing route
```

**Roll back prod** (non-Pro = previous deploy only):
```
vercel rollback <deploy-url> --scope justin-peases-projects --yes
```

**Run tests locally (Node 22):**
```
TZ=America/New_York npx vitest run tests/unit tests/integration
npm run test:e2e:ui-mocked     # self-contained; needs `npx playwright install chromium` first
```

**Commit gotcha:** the pre-commit hook fails on commits that stage **no** `.ts/.js` files
(set -e + empty grep). Use `git commit --no-verify` for docs/config/lockfile-only commits.

**ESLint zones:** strict in `src/app/(customer)` & `src/design` (no inline styles / hardcoded colors);
relaxed in `(admin)` / `(public)`.

## CI notes
- CI E2E runs the self-contained `test:e2e:ui-mocked` lane with **dummy `NEXT_PUBLIC_FIREBASE_*`**
  env (the app initializes the Firebase client at module load; absent config → `auth/invalid-api-key`
  crash on boot). The `preview-safe` lane needs `E2E_BASE_URL` (a deployed Vercel preview) — wire it
  to the preview URL as a separate job (TODO).
