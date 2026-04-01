# lodge-optical Project Structure Reference

Quick reference for navigating the codebase when implementing features.

## Frontend Architecture

| Directory | Purpose | Contains |
|-----------|---------|----------|
| `src/pages/` | Top-level route pages | Home, About, Services, Triage, DryEye, etc. |
| `src/components/` | Reusable components | Header, Footer, Hero, forms, payment, etc. |
| `src/components/patterns/` | Design pattern components | CTA buttons, section headers, process steps |
| `src/components/sections/` | Page sections | Hero sections, education blocks, FAQ blocks |
| `src/services/` | API & integration clients | geminiService, squareService, firebase, api.ts |
| `src/content/` | Multilingual/editable content | homeContent, dryEyeContent, etc. |
| `src/hooks/` | Custom React hooks | useAdaptiveUI for responsive behavior |
| `src/utils/` | Utilities | analytics, events, helpers |
| `src/types/` | TypeScript definitions | clinical types, shared types |
| `src/shared/types/` | Cross-app types | Shared with backend & admin |

## Specialized Applications

| App | Path | Frontend Type | Purpose |
|-----|------|---------------|---------|
| Main Website | `src/` | React + Vite | Patient-facing landing, blog, services |
| Admin Control Center | `admin-control-center/` | React + Vite | Operations dashboard, feature toggles |
| Doctor Portal | `src/portals/DoctorPortal.tsx` | React component | Doctor case management |
| Patient Portal | `src/portals/PatientPortal.tsx` | React component | Patient records & appointments |
| Legacy Portals | `portals/` | Vanilla TS | Legacy portal app (being migrated) |

## Backend Architecture

| Directory | Purpose | Contains |
|-----------|---------|----------|
| `backend/` | Express API server | Routes, middleware, business logic |
| `backend/prisma/` | Database layer | schema.prisma, migrations |
| `backend/agents/` | AI agent logic | Specialized workflows |
| `.env` (root) | Environment config | API keys, db credentials |

## Key Configuration Files

| File | Purpose |
|------|---------|
| `package.json` (root) | Root workspace dependencies |
| `tsconfig.json` | TypeScript configuration |
| `vite.config.ts` | Frontend build config |
| `tailwind.config.js` | Tailwind CSS theme |
| `firebase-applet-config.json` | Firebase project config |
| `.env` | Environment variables (local dev) |

## Service Integrations

### Gemini AI (`src/services/geminiService.ts`)
- Medical decision support, patient education, chatbot
- Used in: AI Chat Assistant, decision engine, content generation

### Square Payments (`src/services/squareService.ts`)
- Payment processing for telehealth appointments, products
- Used in: Checkout page, SquarePayment component

### Firebase
- Authentication (patient, doctor, admin login)
- Realtime database (notifications, presence)
- Configuration: `firebase-applet-config.json`

### Prisma Database
- PostgreSQL ORM
- Models: Users, Appointments, PatientRecords, etc.
- Migrations: `backend/prisma/migrations/`

## Common Development Tasks

### Add a New Page
1. Create `src/pages/NewPage.tsx`
2. Export content from `src/content/newContent.ts`
3. Add route in main `src/main.tsx` or router
4. Test form components if needed

### Add an API Endpoint
1. Create handler in `backend/` routes
2. Test with curl: `curl -X POST http://localhost:3000/api/endpoint`
3. Export TypeScript type to `src/shared/types/`
4. Call from frontend via `src/services/api.ts`

### Add Admin Control
1. Create page in `admin-control-center/src/pages/`
2. Wrap with `AdminLayout.tsx` for navigation
3. Connect to parent Express API if needed
4. Test in dev: `cd admin-control-center && npm run dev`

### Add to Portal (Patient or Doctor)
1. Update `src/portals/PatientPortal.tsx` or `DoctorPortal.tsx`
2. Implement auth check via `SecurePortalLayout.tsx`
3. Restrict data visibility by user role
4. Test login flows in dev

### Database Schema Change
1. Edit `backend/prisma/schema.prisma`
2. Run: `cd backend && npx prisma migrate dev --name descriptive_name`
3. Update TypeScript types
4. Test data consistency

## Development Workflows

### Start Full Stack (3 terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev    # Starts Express on port 3000
```

**Terminal 2 - Frontend:**
```bash
npm run dev    # Starts Vite on port 5173
```

**Terminal 3 - Admin:**
```bash
cd admin-control-center
npm run dev    # Starts on port 5174 (usually)
```

### Database Operations
```bash
cd backend
npx prisma migrate dev --name my_feature    # Create migration
npx prisma studio                           # Visual DB browser
npx prisma generate                         # Regenerate client
```

### Type Checking (All Packages)
```bash
npx tsc --noEmit                  # Root frontend
cd admin-control-center && npx tsc --noEmit
cd backend && npx tsc --noEmit
```

## Testing Locally

### Manual Testing Checklist
- [ ] Frontend loads without errors (http://localhost:5173)
- [ ] Admin loads without errors (http://localhost:5174)
- [ ] Backend API responds (http://localhost:3000/api/health)
- [ ] Can navigate between pages
- [ ] Forms submit and show feedback
- [ ] Mobile viewport responsive

### API Testing (curl examples)
```bash
# Test backend availability
curl http://localhost:3000/

# POST example (adjust endpoint/payload)
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'

# With token (Firebase auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/protected
```

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process: `lsof -i :3000` or change port in config |
| `npm install` fails | Clear cache: `npm cache clean --force`, try install again |
| TypeScript errors | Run `npx tsc --noEmit` to see full list |
| Prisma sync issues | Run `npx prisma generate` after schema changes |
| Firebase auth failing | Check `firebase-applet-config.json` and `.env` keys |
| Database connection error | Verify PostgreSQL running, check `.env` DATABASE_URL |

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview and setup |
| `src/docs/triage_ux_flow.md` | Triage feature flow documentation |
| This file | Project structure reference |

---

**Last Updated:** When creating the complete-fullstack-systems skill
