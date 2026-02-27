# CMS Simplification Plan (Handoff for Claude/Cursor)

## Goal

Reduce bugs and codebase complexity by replacing the half-built generic CMS/inline editing system with a simpler, safer content workflow.

Current usage pattern:
- Single owner/operator (Gregg)
- Copy changes roughly once per week
- Admin pages are still desirable long-term
- Priority is simplicity and reliability over flexibility

## Recommended Direction (TL;DR)

Do **not** finish the inline click-to-edit CMS right now.

Instead:
1. Preserve current production copy (backup/snapshot)
2. Move page copy to local checked-in files (plain TS/JSON)
3. Keep or build **simple admin pages** only for high-value settings (pricing/business), and later for page copy if needed
4. Remove generic CMS runtime/edit-mode complexity

This gives the smallest runtime surface area and the lowest chance of breaking production copy.

## Why This Plan

The current CMS implementation is fragmented:
- Inline editor is mounted without a save function (`src/app/AppContent.tsx`)
- CMS key formats are inconsistent (bare `cmsId` keys vs `page.key` backend paths)
- Provider is mostly passive and not a real-time source of truth (`src/design/providers/CMSDataProvider.tsx`)
- Some admin CMS pages are incomplete or dead links (`/admin/cms/pages`, communication, analytics)
- Inline edit mode/event interception is brittle across shared UI components

For weekly edits, this is too much complexity for too little value.

## Constraints / Priorities

- Preserve current production copy exactly before changing read paths
- Minimize runtime systems (subscriptions, edit modes, generic event buses)
- Keep future admin-page expansion possible
- Avoid risky “big bang” changes
- Prefer code files + git diffs for copy review

## Non-Goals (for this effort)

- Building a full headless CMS
- Multi-user editorial workflow
- Real-time collaborative editing
- Polished inline WYSIWYG editing

## Phase 0: Safety Snapshot (Do First)

### Objective
Capture production copy before any migration so local files can match prod exactly.

### Tasks
1. Export/snapshot current Firestore `cms` documents (all pages).
2. Save the snapshot in repo (or a secure backup location if production data should not be committed).
3. Mark this snapshot as migration baseline.
4. Verify key pages manually against production UI (`home`, `about`, `help`, `contact`, `booking`).

### Deliverables
- `data/cms-data-backup.json` (or updated equivalent)
- Short note listing snapshot date/time and source environment

### Acceptance Criteria
- A single file exists that captures current page copy as baseline
- Team can diff future local copy changes against this baseline

## Phase 1: Define Simple Content Source (Local Files)

### Objective
Create a local content structure that replaces runtime CMS reads for page copy.

### Recommended File Structure

```text
src/content/
  site-copy/
    home.ts
    about.ts
    help.ts
    contact.ts
    booking.ts
    index.ts
```

Alternative (simpler but less type-safe):
- JSON files instead of TS

### Tasks
1. Create local copy modules for 3-5 highest-traffic pages first (`home`, `about`, `help`, `contact`, `booking`).
2. Copy exact values from Firestore snapshot into local files.
3. Add a small shared type for page copy maps (`Record<string, string>` is fine to start).
4. Add a single import surface (`src/content/site-copy/index.ts`).

### Acceptance Criteria
- Local copy files reproduce current production copy for initial pages
- Copy is readable and diff-friendly
- No runtime Firestore dependency required for those pages

## Phase 2: Switch Page Read Paths (Incremental)

### Objective
Stop reading page copy from the generic CMS provider for selected pages.

### Tasks (page-by-page)
1. Update page/container components to import local copy instead of `useCMSData()` for page text.
2. Keep rendering behavior identical (same fallback strings / same output).
3. Verify no visual regression.
4. Repeat page-by-page.

### Notes
- This can be incremental. Do not migrate every page in one PR.
- Start with public marketing pages.
- Leave operational/admin settings (pricing/business) untouched for now.

### Acceptance Criteria
- Selected pages render without Firestore CMS data
- Production copy matches baseline snapshot
- No dependency on `CMSDataProvider` for migrated pages

## Phase 3: Simplify / Remove Generic CMS Runtime

### Objective
Remove unused CMS complexity after enough pages are migrated.

### Likely Removals (only when no longer used)
- Inline editor UI and event system:
  - `src/components/business/InlineTextEditor.tsx`
  - edit-mode toggle UI (`ModeToggleMenu`) if only used for CMS
- Generic interaction mode used solely for editing copy:
  - `src/design/providers/InteractionModeProvider.tsx` (or narrow its scope)
- Generic page copy CMS API routes if no longer needed:
  - `src/app/api/admin/cms/pages/route.ts`
- `CMSDataProvider` if no longer needed by remaining pages
- Dead admin CMS links/pages

### Tasks
1. Inventory remaining runtime usages (`rg "useCMSData|cmsId|InlineTextEditor|InteractionModeProvider"`).
2. Remove or refactor only after usages are migrated.
3. Delete local `firestore.rules` file if it is not source of truth and causes confusion.
4. Update docs/README notes to describe the new copy workflow.

### Acceptance Criteria
- No dead/unused generic CMS runtime code remains
- No misleading local Firebase rules file remains (if confirmed unused)
- Codebase is smaller and easier to reason about

## Phase 4 (Optional, Later): Simple Admin Copy Pages

### Objective
Add a minimal admin UI for Gregg if manual code-file edits become annoying.

### Recommended Scope (Minimal)
- Page-based text editors only (Home/About/Help)
- Save via one admin API route per page or one simple route with `page` param
- No inline editing
- No real-time subscriptions
- “Save” + “Preview” + “Last saved” only

### Data Storage Options (choose one)

Option A (simplest runtime): Local files only
- Gregg (or AI) edits code files
- No runtime admin UI for copy

Option B (still simple): Firestore docs for page copy via admin forms
- Keep one doc per page in `cms`
- Admin form reads/writes those docs
- Public pages may still read local files until you intentionally switch

### Recommendation
Use **Option A first**. Add Option B only if weekly edits become burdensome.

## If You Insist on Fixing the Existing Inline CMS (Not Recommended)

This is the minimum work required to make it usable:

1. Wire `InlineTextEditor` save in `src/app/AppContent.tsx` to call authenticated `PUT /api/admin/cms/pages`
2. Standardize `cmsId` format to `page.key` across all editable elements
3. Fix shared `Button` edit-mode interception so editor Save/Cancel buttons can function
4. Make provider state update after save (or subscribe and invalidate cache)
5. Fix inconsistent editable behavior across `Text`, `Heading`, `Span`, `Button`
6. Remove/implement dead admin CMS sections

Estimated effort:
- “Mostly works”: 2-4 days
- Stable: 4-8 days
- Clean: 1-2 weeks

## Execution Plan for Claude/Cursor (Suggested Task Sequence)

Use this order to minimize risk:

1. Create/refresh production CMS snapshot and document baseline
2. Create `src/content/site-copy/*` local copy modules for `home`, `about`, `help`, `contact`
3. Migrate those pages to local copy (one page per commit/PR)
4. Verify UI matches baseline snapshot
5. Migrate additional pages as needed (`booking`, `privacy`, `terms`)
6. Remove inline CMS/edit-mode system when no longer needed
7. Remove dead CMS admin links/routes
8. Delete misleading local `firestore.rules` file (if confirmed unused)
9. Document new copy-edit workflow for Gregg

## Validation Checklist (Per Page Migration)

- Page renders without `useCMSData()` page-copy dependency
- Text matches current production copy
- No runtime errors
- No broken buttons/links/forms
- No changed booking/business logic
- Diff only touches intended page copy usage and new content files

## Suggested Prompt for Claude/Cursor

Use this as a starting prompt:

> Simplify the CMS by migrating page copy from the generic Firestore CMS runtime to local checked-in content files, starting with `home`, `about`, `help`, and `contact`. Preserve current production copy exactly using the existing CMS backup data as baseline. Do not implement inline editing. Keep pricing/business admin pages unchanged for now. Remove dead/incomplete CMS links only after migrations are complete. Make changes incrementally and verify each page renders the same content.

## Notes for Future Re-Architecture (Only If Needed)

If the business grows beyond a single owner/driver:
- Reintroduce admin copy editing as page-based forms
- Add validation/schema versioning
- Consider a real CMS only when editorial complexity justifies it

For now, optimize for low complexity and low risk.
