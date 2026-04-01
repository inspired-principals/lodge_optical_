# Complete Full-Stack Systems Skill Summary

**Workspace Location:** `.github/skills/complete-fullstack-systems/`

## What This Skill Provides

A comprehensive, battle-tested workflow for implementing complete features across lodge-optical's full-stack architecture: Express backend + Prisma database + React frontend + admin dashboard + secure portals.

## Files Included

1. **SKILL.md** (Main Reference)
   - 7-phase workflow from requirements through deployment
   - 100+ checkpoints for quality assurance
   - Built around your actual tech stack
   - ~10 minute read for full overview

2. **QUICK_CHECKLIST.md** (Print-Friendly)
   - Fast reference for developers actively coding
   - Database, backend, frontend, quality, admin, deploy sections
   - Pre-built command templates (copy-paste ready)
   - ~2 minute scan

3. **PROJECT_STRUCTURE.md** (Navigation Guide)
   - Explains every major directory
   - Service integration reference (Gemini, Square, Firebase)
   - Common development tasks with examples
   - Troubleshooting quick lookup table

4. **FEATURE_IMPLEMENTATION_TEMPLATE.md** (Per-Feature Planning)
   - Copy this template for each new feature
   - Has blanks for your specific design decisions
   - Tracks phases from architecture through deployment
   - Includes code templates and test commands

## How to Use

### Getting Started on a Feature
1. Copy `FEATURE_IMPLEMENTATION_TEMPLATE.md` to your docs folder
2. Fill in the feature name and acceptance criteria
3. Follow phase-by-phase, checking boxes as you go

### Quick Reference While Coding
- Keep `QUICK_CHECKLIST.md` open in split pane
- Use `PROJECT_STRUCTURE.md` to navigate unfamiliar code
- Reference `SKILL.md` Phase sections as needed

### Invoking the Skill in Chat
```
Type: /complete-fullstack-systems
Description will appear with full workflow guidance
```

## Architecture Covered

✅ **Frontend:** React + Vite + Tailwind
✅ **Backend:** Express + TypeScript
✅ **Database:** Prisma + PostgreSQL
✅ **Admin:** Admin control center (separate React app)
✅ **Portals:** Patient + Doctor secure interfaces
✅ **AI:** Gemini integration (chatbot, decision support)
✅ **Payments:** Square integration
✅ **Auth:** Firebase authentication
✅ **Monorepo:** npm workspace coordination

## Key Quality Gates

Each phase includes verification steps for:
- ✓ Type safety (TypeScript compilation)
- ✓ Functionality (end-to-end testing)
- ✓ Performance (query optimization, render profiling)
- ✓ Accessibility (WCAG compliance)
- ✓ Security (no hardcoded secrets, auth validation)
- ✓ Documentation (runbooks, troubleshooting)
- ✓ Operational readiness (monitoring, logs, admin controls)

## When to Use This Skill

Perfect for:
- 🚀 Building new features across multiple layers
- 🔄 Implementing API endpoints + corresponding UI
- 📊 Adding portal features (patient or doctor)
- ⚙️ Creating admin controls for operational teams
- 🛠️ Refactoring existing features end-to-end
- 📱 Integrating external services (Gemini, Square)
- 🚢 Preparing features for production deployment

## Common Workflows

### New Patient-Facing Feature (Website)
1. Follow SKILL.md Phases 1-3 (Requirements → Database → Backend → Frontend)
2. Add content to `src/content/` in Phase 3.5
3. Complete Phases 5-7 (Testing → Documentation → Deploy)
4. Update QUICK_CHECKLIST for team

### New Admin Control
1. Design schema in Phase 1-2
2. Create backend API in Phase 2
3. Create admin page in `admin-control-center/src/pages/` (Phase 3)
4. Follow Phases 5-7 for quality and deploy

### Portal Feature (Doctor or Patient)
1. Add database model in Phase 2
2. Create backend API in Phase 2
3. Update `src/portals/DoctorPortal.tsx` or `PatientPortal.tsx` in Phase 3
4. Implement auth checks via `SecurePortalLayout.tsx`
5. Test role-based visibility before deploy

## Time Investment

- **Initial Setup:** 5 min (copy template, understand phases)
- **Per Feature:** Depends on scope, but workflow guides you through all layers
- **Quality Checks:** Built-in checkpoints prevent rework later

## Next Steps

1. Bookmark this file or add to favorites
2. Print `QUICK_CHECKLIST.md` for reference
3. Create first feature using `FEATURE_IMPLEMENTATION_TEMPLATE.md`
4. Share skill link with team: `.github/skills/complete-fullstack-systems/`

---

**Created:** March 30, 2026
**For:** lodge-optical full-stack development
**Status:** Ready for production use ✅
