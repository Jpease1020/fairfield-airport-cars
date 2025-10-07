# 📋 Business Logic Interface - Project Tracking

## 🎯 Project Overview
Implementing a Business Logic Interface system to provide Gregg (non-technical owner) with plain-English documentation that's always in sync with our code and CMS settings.

## 📊 Implementation Status

### Phase 1: Foundation (Day 1)
- [ ] **Extract shared Zod contracts** - Move schemas to `src/lib/contracts/**`
- [ ] **Define pricing contract** - From CMS settings with typed accessors
- [ ] **Create docs generator script** - `scripts/docs/build-business-docs.ts`
- [ ] **Add drift validation** - `scripts/docs/validate-docs-in-sync.ts`
- [ ] **Generate initial docs** - pricing.md, booking-flow.md

### Phase 2: Admin Interface (Day 2)
- [ ] **Build admin docs page** - `/admin/docs` with tabs and live CMS panel
- [ ] **Add propose-change endpoint** - `/api/docs/propose-change`
- [ ] **Wire email/issue creation** - For change proposals

### Phase 3: Public Access (Day 3)
- [ ] **Create public docs pages** - `/docs/*` with password protection
- [ ] **Add Mermaid diagrams** - Visual booking flow
- [ ] **Implement CI drift check** - Fail builds if docs out of sync
- [ ] **Add comprehensive tests** - Unit, integration, E2E

### Phase 4: Enhancement (Optional)
- [ ] **Add XState booking machine** - For interactive diagrams
- [ ] **Create Gregg-friendly README** - Non-technical usage guide
- [ ] **Add change approval workflow** - Review process for proposals

## 🎯 Success Criteria
- Gregg can read plain-English docs with current numbers
- Docs automatically update when CMS settings change
- Change proposals flow to development team
- CI fails if docs drift from code
- No duplicated schemas across codebase

## 📁 Deliverables
- `src/lib/contracts/**` - Shared Zod contracts
- `scripts/docs/**` - Generation and validation scripts
- `docs/business/**` - Generated Markdown docs
- `src/app/admin/docs/**` - Admin interface
- `src/app/docs/**` - Public docs pages
- `docs/business/README.md` - Gregg-friendly guide

## 🔗 Related Documentation
- [Business Logic Interface Plan](../architecture/BUSINESS_LOGIC_INTERFACE_PLAN.md) - Full technical spec
- [Business README](./README.md) - Gregg-friendly usage guide

## 📝 Notes
- No .env file modifications required
- All changes respect existing auth patterns
- Mobile-friendly design for Gregg's access
- Password protection for public docs
