# Asset Lifecycle & Workflow Specifications

This document defines the lifecycle states, state transitions, validation invariants, and transactional audit trails for company assets in AssetFlow.

---

## 1. Lifecycle State Machine

```
              ┌───────────────┐
              │   AVAILABLE   │ ◄────────────────────────┐
              └───────┬───────┘                          │
                      │                                  │
               assign │                                  │ return (GOOD)
                      ▼                                  │
              ┌───────────────┐                          │
              │   ASSIGNED    │ ─────────────────────────┘
              └───────┬───────┘
                      │
      return DAMAGED  │
                      ▼
              ┌───────────────┐
              │    DAMAGED    │
              └───────┬───────┘
                      │
      send for repair │
                      ▼
              ┌───────────────┐
              │ UNDER_REPAIR  │ ─── repaired ───► [ AVAILABLE ]
              └───────┬───────┘
                      │
               retire │
                      ▼
              ┌───────────────┐
              │    RETIRED    │ (Terminal / Decommissioned)
              └───────────────┘
```

---

## 2. Status Invariants & Business Rules

1. **Assignment Rule:**
   - Only assets with `status === 'available'` may be assigned to an active employee.
   - Any attempt to assign an asset that is `assigned`, `damaged`, `under_repair`, or `retired` is rejected with `400 Bad Request` or `409 Conflict`.
   - An asset cannot have more than one `ACTIVE` assignment at any given time.

2. **Return Rule:**
   - A return can only be submitted against an active assignment (`status === 'ACTIVE'`).
   - If the return condition is `DAMAGED`, the asset transitions to `damaged`.
   - If the return condition is `GOOD`, the asset transitions to `available`.
   - The asset's current `employeeId` is detached (`null`).

3. **Transaction Guarantee:**
   - Both Assignment and Return workflows are executed inside an atomic Prisma `$transaction`.
   - If writing the assignment record, updating the asset state, or logging the immutable audit record fails, the entire transaction is rolled back.

4. **Immutable Audit Trail:**
   - Every asset transition triggers an `AssetHistory` record capturing:
     - `assetId`: Target asset identifier.
     - `employeeId`: Assigned employee (if applicable).
     - `action`: `CREATED`, `ASSIGNED`, `RETURNED`, or `STATUS_CHANGE`.
     - `notes`: Reason, condition, or ticket reference.
     - `createdAt`: ISO-8601 audit timestamp.
