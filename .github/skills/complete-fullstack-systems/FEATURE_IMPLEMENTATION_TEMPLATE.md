# Feature Implementation Template

Use this template when starting a new full-stack feature. Copy and adapt for your specific needs.

## Feature: [Feature Name]

### Overview
- **User Story:** [Who, what, why]
- **Acceptance Criteria:** [What makes it done]
- **Affected Systems:** Frontend □ Backend □ Database □ Admin □ Portals □ Integrations (Gemini/Square)
- **Estimated Effort:** [T-shirt size or days]

---

## Phase 1: Requirements & Architecture

### Data Model Design
```prisma
// Add to backend/prisma/schema.prisma
model FeatureName {
  id        String   @id @default(cuid())
  // TODO: Define fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### API Endpoints
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/feature` | Required | List/fetch |
| POST | `/api/feature` | Required | Create |
| PUT | `/api/feature/:id` | Required | Update |
| DELETE | `/api/feature/:id` | Required | Delete |

### External Service Dependencies
- [ ] Gemini AI: [specific use case or not needed]
- [ ] Square Payments: [specific use case or not needed]
- [ ] Firebase: [specific use case or not needed]

---

## Phase 2: Backend Implementation

### Database
- [ ] Schema designed in `backend/prisma/schema.prisma`
- [ ] Migration created: `npx prisma migrate dev --name feature_name`
- [ ] Types exported to `src/shared/types/featureName.ts`

**Test command:**
```bash
cd backend && npx prisma studio
```

### API Implementation
- [ ] Routes created in `backend/` (specify file structure)
- [ ] Request validation added
- [ ] Error handling configured
- [ ] Tested with curl/Postman

**Test commands:**
```bash
curl -X GET http://localhost:3000/api/feature
curl -X POST http://localhost:3000/api/feature \
  -H "Content-Type: application/json" \
  -d '{"field":"value"}'
```

### Services (if applicable)
- [ ] `geminiService.ts` updated: [specific methods]
- [ ] `squareService.ts` updated: [specific methods]
- [ ] `.env` updated with new keys: [list keys]

---

## Phase 3: Frontend Implementation

### Component Structure
```
src/
├── pages/
│   └── FeaturePage.tsx         # Main page
├── components/
│   └── Feature/
│       ├── FeatureForm.tsx     # Form component
│       ├── FeatureList.tsx     # List component
│       └── FeatureDetail.tsx   # Detail view
└── services/
    └── api.ts                  # Add fetch methods
```

### Implementation Checklist
- [ ] Main page component created: `src/pages/FeaturePage.tsx`
- [ ] Sub-components created (form, list, detail)
- [ ] API calls implemented in `src/services/api.ts`
- [ ] State management (useState, custom hooks)
- [ ] Loading/error/success states handled
- [ ] Tailwind styling applied
- [ ] TypeScript types from `src/shared/types/` used

### Component Template
```tsx
// src/components/Feature/FeatureName.tsx
import { useState, useEffect } from 'react';
import type { FeatureName } from '@/types/featureName';
import { api } from '@/services/api';

export function FeatureComponent() {
  const [data, setData] = useState<FeatureName | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await api.getFeature();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return <div>{/* Render data */}</div>;
}
```

---

## Phase 4: Integration & Adapters

### Admin Control Center (if applicable)
- [ ] Page created in `admin-control-center/src/pages/Feature.tsx`
- [ ] Admin controls for feature toggles/configuration
- [ ] Wrapped with `AdminLayout.tsx`
- [ ] Connected to backend API

### Portal Integration (if applicable)
- [ ] Patient Portal updated: `src/portals/PatientPortal.tsx`
- [ ] Doctor Portal updated: `src/portals/DoctorPortal.tsx`
- [ ] Role-based visibility implemented
- [ ] Auth tokens validated

### Content & Analytics (if user-facing)
- [ ] Content added to `src/content/` if needed
- [ ] Analytics event created in `src/utils/events.ts`
- [ ] SEO schema added using `SEOSchema.tsx` if public page
- [ ] Tracking implemented in component

---

## Phase 5: Testing & Quality

### Functional Testing
- [ ] Happy path tested (main workflow succeeds)
- [ ] Error scenarios tested (invalid input, network failure)
- [ ] Edge cases tested (empty states, limits)
- [ ] Manual end-to-end test completed

### Code Quality
```bash
# Run type checking
npx tsc --noEmit

# Run linter (if configured)
npm run lint

# Manual testing
npm run dev           # Frontend
cd backend && npm run dev  # Backend
cd admin-control-center && npm run dev  # Admin (if needed)
```

- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Mobile responsive verified
- [ ] Accessibility tested (Tab navigation, alt text, contrast)

### Performance
- [ ] React DevTools Profiler checked for unnecessary renders
- [ ] Database queries optimized (no N+1 queries)
- [ ] Bundle size impact acceptable
- [ ] API response times acceptable

---

## Phase 6: Admin & Ops Preparation

### Documentation
- [ ] Feature documented in README.md or internal docs
- [ ] API endpoints documented with examples
- [ ] JSDoc comments added to complex functions
- [ ] Troubleshooting guide created

### Monitoring & Support
- [ ] Error logging implemented
- [ ] Admin runbook created (how to manage/fix issues)
- [ ] Feature flags/toggles documented if applicable
- [ ] Rollback plan documented

---

## Phase 7: Deployment Readiness

### Pre-Deployment
- [ ] All code changes committed
- [ ] Environment variables documented in `.env.example`
- [ ] Database migrations tested
- [ ] No secrets in code repo
- [ ] Build succeeds:
  ```bash
  npm run build
  cd admin-control-center && npm run build
  ```

### Deployment Checklist
- [ ] Staging tested
- [ ] Production credentials configured
- [ ] Database backup confirmed before migration
- [ ] Rollback plan confirmed
- [ ] Team notified of deployment
- [ ] Post-deployment validation completed

---

## Completion Verification

- [ ] Feature works end-to-end
- [ ] All tests pass
- [ ] Documentation complete
- [ ] Admin/ops team ready to manage
- [ ] No known issues or TODOs remaining
- [ ] Ready for production

---

## Notes & Blockers

[Add any issues encountered, decisions made, or follow-up tasks here]

---

**Implementation Date:** [YYYY-MM-DD]
**Completed Date:** [YYYY-MM-DD]
**Reviewed By:** [Team member]
