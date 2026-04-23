# Phase 6 Implementation Sequence

## Objective
Create an internal `clinical_control` package boundary inside the existing backend so Lodge Optical becomes a client of a reusable clinical operations engine.

## Sequence
1. Introduce neutral package boundaries under `backend/app/core/clinical_control/`.
2. Route active imports through that boundary while preserving existing module paths.
3. Centralize contracts in `clinical_control/contracts/`.
4. Centralize case lifecycle access in `clinical_control/case_core/`.
5. Centralize decision services in `clinical_control/decision_engine/`.
6. Centralize audit/event access in `clinical_control/audit_layer/`.
7. Keep Lodge Optical routers as compatibility adapters over the new boundary.
8. After import stability, move implementations into the boundary package incrementally.
9. Add tenant-aware interfaces before extracting into a standalone repo.
10. Replace runtime dev schema mutation with migrations-only evolution before externalizing.

## Current Phase 6 Scope
- Package boundary created
- Neutral imports enabled
- Legacy app remains operational

## Next Extraction Steps
- Move submission/case schemas from `modules/triage` into `clinical_control/contracts`
- Move `CaseService` and `TriageService` implementations into `clinical_control/case_core`
- Move `TriageAIService` and `TriageRoutingService` implementations into `clinical_control/decision_engine`
- Add tenant-aware contracts and service inputs
