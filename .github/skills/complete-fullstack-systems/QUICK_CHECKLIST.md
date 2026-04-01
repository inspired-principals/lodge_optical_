# Quick Implementation Checklist

Print or bookmark this for rapid reference during feature development.

## Database Changes
- [ ] Update `backend/prisma/schema.prisma`
- [ ] Run `npx prisma migrate dev --name feature_description`
- [ ] Export new types to `src/shared/types/`
- [ ] Test with `npx prisma studio`

## Backend API
- [ ] Define endpoints (POST/GET/PUT/DELETE)
- [ ] Add route handlers with validation
- [ ] Update `src/services/api.ts` client if needed
- [ ] Add error handling middleware
- [ ] Test with curl/Postman

## Frontend Components
- [ ] Create components in `src/components/` or `src/pages/`
- [ ] Use TypeScript interfaces
- [ ] Call API via `src/services/api.ts`
- [ ] Handle loading/error/success states
- [ ] Add Tailwind styling

## Special Integrations
- [ ] Update `geminiService.ts` if AI-powered
- [ ] Update `squareService.ts` if payment-involved
- [ ] Firebase auth flows verified
- [ ] Portal auth tokens validated

## Quality Checks
- [ ] Type-check: `npx tsc --noEmit` ✓
- [ ] Run tests (if available)
- [ ] Manual end-to-end test
- [ ] Error scenarios tested
- [ ] Mobile responsive verified

## Admin/Ops
- [ ] Added controls to ControlSurface if admin feature
- [ ] Environment variables documented
- [ ] Logging/monitoring in place
- [ ] README updated
- [ ] No secrets in code

## Pre-Deploy
- [ ] Frontend builds: `cd admin-control-center && npm run build`
- [ ] Backend starts successfully
- [ ] No console errors
- [ ] Database backup plan confirmed
- [ ] Rollback plan documented

## Common Commands
```bash
# Start dev servers
cd backend && npm run dev          # Terminal 1
npm run dev                         # Terminal 2: frontend
cd admin-control-center && npm run dev  # Terminal 3: admin

# Database
cd backend && npx prisma migrate dev --name my_change
cd backend && npx prisma studio    # Visual DB browser

# Type checking
npx tsc --noEmit

# Build for deployment
npm run build
cd admin-control-center && npm run build
```

---

**Phases:** Requirements → Backend DB → Backend API → Frontend → Integration → Testing → Admin/Ops → Deploy
