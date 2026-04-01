---
name: complete-fullstack-systems
description: "Use when: building complete features or systems across frontend, backend, and database; implementing operations-ready full-stack modules; coordinating changes across Express API, Prisma models, React components, and services; preparing systems for production deployment"
---

# Complete Full-Stack Systems Implementation

**Scope:** End-to-end feature development spanning database, backend services, frontend components, and integration layers. Use this for building production-ready systems in lodge-optical.

---

## Phase 1: Requirements & Architecture

### 1.1 Define Feature Scope
- [ ] Clarify user stories and acceptance criteria
- [ ] Identify affected modules: backend services, frontend pages/components, database entities, admin control center, portals
- [ ] Document data flow: frontend → API → database → external services (Square, Gemini)
- [ ] List external service integrations needed (Gemini, Square, Firebase)

### 1.2 Plan Data Model
- [ ] Review existing Prisma schema at `backend/prisma/schema.prisma`
- [ ] Design new models or schema changes
- [ ] Identify relationships with existing entities (users, appointments, patient records)
- [ ] Document migration strategy

### 1.3 Plan API Contract
- [ ] Define REST endpoints needed
- [ ] Document request/response types matching `src/shared/types/`
- [ ] Plan error handling and status codes
- [ ] Consider authentication/authorization (Firebase auth)

---

## Phase 2: Backend Implementation

### 2.1 Database Schema
- [ ] Add/update Prisma models in `backend/prisma/schema.prisma`
- [ ] Create migration: `npx prisma migrate dev --name descriptive_name`
- [ ] Verify schema with `npx prisma studio` (if interactive)
- [ ] Update type exports in `src/shared/types/` for frontend

### 2.2 Express API Layer
- [ ] Create route handlers in `backend/` (or existing agent structure)
- [ ] Implement CRUD operations using Prisma client
- [ ] Add request validation and type safety (`@types/express`)
- [ ] Configure error handling middleware
- [ ] Document with JSDoc or inline comments

### 2.3 Service Integration
- [ ] Update `src/services/geminiService.ts` if using AI features
- [ ] Update `src/services/squareService.ts` if payment-related
- [ ] Create new service files if needed (e.g., `clinical.ts` for medical logic)
- [ ] Ensure services follow error handling patterns
- [ ] Add environment variables to `.env` (API keys, endpoints)

### 2.4 Backend Testing
- [ ] Test endpoints with curl or Postman
- [ ] Verify database transactions
- [ ] Check error messages and status codes
- [ ] Validate external service calls with mock/test credentials

---

## Phase 3: Frontend Implementation

### 3.1 Component Architecture
- [ ] Create React components in `/src/components/` or `/src/pages/`
- [ ] Use TypeScript for type safety
- [ ] Follow existing patterns: functional components, hooks (`useAdaptiveUI`, custom hooks)
- [ ] Structure: pages → sections → components → patterns

### 3.2 State Management & Services
- [ ] Call backend APIs via `src/services/api.ts`
- [ ] Handle async operations (loading, error, success states)
- [ ] Use `src/services/emitter.ts` for cross-component communication if needed
- [ ] Manage Firebase auth state

### 3.3 UI & Styling
- [ ] Use Tailwind CSS classes (configured in `tailwind.config.js`)
- [ ] Maintain design system consistency with existing pattern components
- [ ] Test responsive behavior
- [ ] Ensure accessibility (alt text, ARIA labels, keyboard navigation)

### 3.4 Integration with Specialized UIs
- [ ] **Portals:** Update `src/portals/PatientPortal.tsx`, `DoctorPortal.tsx` if feature affects them
- [ ] **Admin Center:** Update `admin-control-center/src/pages/ControlSurface.tsx` for admin features
- [ ] **Forms/Payments:** Integrate with `SquarePayment.tsx` if transactions involved
- [ ] **Decision Engine:** Connect to `DecisionEnginePreview.tsx` for diagnostic flow

### 3.5 Content & SEO
- [ ] Update content files in `src/content/` if customer-facing
- [ ] Add SEO schema markup using `SEOSchema.tsx` component
- [ ] Add analytics events via `src/utils/analytics.ts`
- [ ] Test with `src/utils/events.ts` event tracking

---

## Phase 4: Integration & Adapters

### 4.1 Cross-Tab Communication
- [ ] Verify Firebase Realtime Database listeners if multi-tab sync needed
- [ ] Test emergency exit overlay (`ExitIntentOverlay.tsx`) if applicable
- [ ] Check adaptive UI responsiveness via `useAdaptiveUI` hook

### 4.2 Service Layer Coordination
- [ ] Test Gemini AI integration if feature uses AI
- [ ] If Square Payments involved: test payment flow end-to-end
- [ ] Verify Redis caching (if using `backend` Redis config)
- [ ] Test database connection pooling (Prisma with PG)

### 4.3 Environment & Secrets
- [ ] Add all new env vars to `.env` and document in README
- [ ] Create `.env.example` with template values
- [ ] Ensure no credentials in code or git
- [ ] Test with dev, staging, and production credential sets if applicable

---

## Phase 5: Testing & Quality

### 5.1 Functional Testing
- [ ] Test happy path (success scenario)
- [ ] Test error paths (invalid input, network failure, auth failure)
- [ ] Verify all CRUD operations if applicable
- [ ] Check edge cases (empty states, rate limits, timeouts)

### 5.2 Integration Testing
- [ ] Test frontend ↔ backend communication end-to-end
- [ ] Verify backend ↔ database consistency
- [ ] Test external service integration (Gemini, Square) with real/test keys
- [ ] Validate Cross Origin requests if APIs on different domains

### 5.3 Performance & Optimization
- [ ] Check component render performance (React DevTools Profiler)
- [ ] Verify database query efficiency (check Prisma query logs)
- [ ] Lazy-load components or data if applicable
- [ ] Minimize bundle size impact (check `vite` build output)

### 5.4 Accessibility & UX Polishing
- [ ] Run axe or Lighthouse audit
- [ ] Test keyboard navigation
- [ ] Verify color contrast ratios
- [ ] Test on mobile (admin-control-center responsive, portals usable)
- [ ] Verify form validation messaging
- [ ] Check loading states and feedback

---

## Phase 6: Admin & Ops Preparation

### 6.1 Admin Control Surface
- [ ] Expose admin controls in `admin-control-center/src/pages/ControlSurface.tsx` if needed
- [ ] Add feature toggles or configuration options
- [ ] Test admin workflows

### 6.2 Monitoring & Logging
- [ ] Add server-side logging with structured format
- [ ] Capture error events in analytics
- [ ] Set up alerts for critical failures if using observability tools
- [ ] Document troubleshooting steps

### 6.3 Documentation & Runbooks
- [ ] Document feature in README or internal docs
- [ ] Add JSDoc comments for complex functions
- [ ] Create quick-start examples or API docs
- [ ] Document deployment steps if config changes needed

---

## Phase 7: Deployment Readiness

### 7.1 Pre-Deployment Checklist
- [ ] All tests pass (`npm test` if configured)
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Secrets properly managed (not in code)

### 7.2 Build Verification
- [ ] Frontend build succeeds: `npm run build` in `src/`
- [ ] Admin build succeeds: `npm run build` in `admin-control-center/`
- [ ] Backend starts: `npm run dev` or `npx ts-node server.ts`
- [ ] No TypeScript errors: `npx tsc --noEmit`

### 7.3 Production Safety
- [ ] Verify error boundaries (React error handling)
- [ ] Check rate limiting on API routes
- [ ] Ensure database backups are configured
- [ ] Validate CORS/security headers
- [ ] Test with production-like data volume if possible

---

## Helpful Commands

| Task | Command |
|------|---------|
| Start backend dev | `cd backend && npm run dev` |
| Start frontend dev | `npm run dev` (root) |
| Start admin center dev | `cd admin-control-center && npm run dev` |
| Create DB migration | `cd backend && npx prisma migrate dev --name feature_name` |
| View Prisma Studio | `cd backend && npx prisma studio` |
| Build all | `npm run build` (check each package.json) |
| Type-check | `npx tsc --noEmit` |
| Run linter | `npm run lint` (if configured) |

---

## Common Patterns

### Adding a New Database Entity
1. Add model to `backend/prisma/schema.prisma`
2. Run migration: `npx prisma migrate dev --name add_entity`
3. Export types to `src/shared/types/`
4. Add API endpoints in backend
5. Create React component/form to consume endpoint

### Integrating with Gemini AI
1. Call `geminiService.ts` with prompt/input
2. Handle streaming or promise-based responses
3. Display results in component UI
4. Log to analytics for tracking

### Adding to Admin Control Surface
1. Add route/page to `admin-control-center/src/pages/`
2. Wrap with `AdminLayout.tsx` for consistent navigation
3. Connect to backend API
4. Display admin-only controls

### Portal Feature (Patient/Doctor)
1. Add page or component in `src/portals/`
2. Implement `SecurePortalLayout.tsx` wrapper for auth
3. Call backend with authenticated token
4. Restrict data visibility per user role (patient sees own, doctor sees assigned)

---

## Post-Implementation Verification

After completing all phases, verify the complete system with this checklist:

- [ ] Feature works end-to-end (UI → API → DB → response)
- [ ] All error scenarios handled gracefully
- [ ] No hardcoded credentials or secrets
- [ ] Documentation updated and complete
- [ ] Performance acceptable (no N+1 queries, optimized renders)
- [ ] Accessibility standards met
- [ ] Admin controls accessible and functional
- [ ] Ready for operational team to manage/monitor
- [ ] Deployment instructions clear
- [ ] Environment configuration documented
