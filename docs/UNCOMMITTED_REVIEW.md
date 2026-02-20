# Review: Uncommitted work — what to keep and commit

## Summary

**Recommendation: Commit almost everything.** The app and tests already depend on several of these files; leaving them untracked would break a fresh clone. Only exclude local/IDE/agent artifacts if you prefer not to version them.

---

## ✅ Commit (required for a working repo)

These are **referenced by existing tracked code** or are the only copy of new features. Without them, build or runtime breaks.

| Path | Why commit |
|------|------------|
| `src/lib/business/business-rules.ts` | **Required.** `booking-service`, `cancel-booking`, `check-time-slot`, `calendar/availability` import `getBusinessRules`; admin settings and restore routes use it. |
| `src/lib/services/sms-message-service.ts` | **Required.** `twilio-service` and `api/twilio/incoming-sms` use `saveSmsMessage`. |
| `src/app/api/admin/business-rules/route.ts` | **Required.** Admin settings page calls this API. |
| `src/app/api/admin/business-rules/restore/route.ts` | **Required.** Admin settings “Restore defaults” uses it. |
| `src/app/api/admin/sms-messages/route.ts` | Admin messages list; nav links to `/admin/messages`. |
| `src/app/api/twilio/incoming-sms/route.ts` | Twilio webhook; required for inbound SMS and forwarding. |
| `src/app/(admin)/admin/settings/page.tsx` | Admin UI for business rules; nav links to `/admin/settings`. |
| `src/app/(admin)/admin/messages/page.tsx` | Admin UI for SMS messages. |

**Tests** (needed for CI and coverage):

| Path | Why commit |
|------|------------|
| `tests/e2e/admin-settings.spec.ts` | E2E for admin settings redirect (backlog #15). |
| `tests/e2e/helpers.ts` | Used by E2E specs for `isLocalTarget()` / `getEffectiveBaseUrl()`. |
| `tests/integration/business-rules-save-get.test.ts` | Integration test for business rules save → get (backlog #15). |
| `tests/unit/business-rules.test.ts` | Unit tests for `getBusinessRules`, cache, fee tiers. |
| `tests/unit/service-area-validation.test.ts` | Unit tests for service area validation. |

**Config:**

| Path | Why commit |
|------|------------|
| `config/playwright.ci.config.ts` | CI E2E config; referenced by `docs/E2E_TESTING.md` and `test:e2e:ci`. |

**Docs** (useful for the team and future you):

| Path | Why commit |
|------|------------|
| `docs/APP_INVENTORY.md` | Single source for notifications, business rules, auth, booking flow. |
| `docs/BACKLOG.md` | Single ordered backlog (Phases 1–6) and status. |
| `docs/E2E_TESTING.md` | How to run E2E in CI vs local; what writes to DB. |
| `docs/PHASE4_BLOAT_CHECKLIST.md` | Phase 4 bloat batches (components, API routes, services, design). |
| `docs/PHASE4_SERVICE_CONSOLIDATION.md` | Service callers and merge plan (notification + driver/tracking). |

---

## ⏭️ Skip (optional — add to `.gitignore` if you don’t want them in the repo)

| Path | Reason |
|------|--------|
| `.claude/worktrees/` | Agent/worktree artifacts; usually local-only. |
| `.cursor/plans/UNIFIED_PLAN.md` | Cursor plan file; optional to share. |
| `.cursor/plans/gregg_isabella_feedback.plan.md` | Cursor plan file; optional to share. |

If you want to ignore these so they stop showing as untracked, add to `.gitignore`:

```
.claude/
.cursor/plans/
```

You can still commit the rest.

---

## Commit plan

**Option A — Commit everything except local artifacts**

```bash
# Ignore local/IDE artifacts (optional)
echo ".claude/" >> .gitignore
echo ".cursor/plans/" >> .gitignore

# Stage app, tests, config, docs
git add \
  src/lib/business/business-rules.ts \
  src/lib/services/sms-message-service.ts \
  src/app/api/admin/business-rules/ \
  src/app/api/admin/sms-messages/ \
  src/app/api/twilio/ \
  src/app/\(admin\)/admin/settings/ \
  src/app/\(admin\)/admin/messages/ \
  config/playwright.ci.config.ts \
  tests/e2e/admin-settings.spec.ts \
  tests/e2e/helpers.ts \
  tests/integration/business-rules-save-get.test.ts \
  tests/unit/business-rules.test.ts \
  tests/unit/service-area-validation.test.ts \
  docs/APP_INVENTORY.md \
  docs/BACKLOG.md \
  docs/E2E_TESTING.md \
  docs/PHASE4_BLOAT_CHECKLIST.md \
  docs/PHASE4_SERVICE_CONSOLIDATION.md

git status   # review
git commit -m "feat: business rules, admin settings/messages, Twilio SMS, E2E/docs and Phase 4 bloat checklist"
```

**Option B — Commit in two logical commits**

1. **App + config + tests:** business rules, SMS service, admin routes (settings + messages), Twilio webhook, Playwright CI config, E2E helpers, admin-settings spec, business-rules and service-area unit/integration tests.  
2. **Docs:** APP_INVENTORY, BACKLOG, E2E_TESTING, PHASE4_BLOAT_CHECKLIST, PHASE4_SERVICE_CONSOLIDATION.

---

## Verdict

| Category | Action |
|----------|--------|
| **App / API / lib** | **Keep and commit** — required for build and for admin/SMS features. |
| **Tests** | **Keep and commit** — required for CI and backlog #15. |
| **Config** | **Keep and commit** — needed for E2E CI. |
| **Docs** | **Keep and commit** — good single source for inventory, backlog, E2E, bloat. |
| **`.claude/`, `.cursor/plans/`** | **Skip or .gitignore** — optional local/IDE artifacts. |

**Bottom line:** Commit all of the untracked app, test, config, and doc files above (and optionally add `.claude/` and `.cursor/plans/` to `.gitignore`). The only things to exclude are those local/plan directories if you don’t want them in version control.
