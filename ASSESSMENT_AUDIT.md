# Employee Asset Inventory Management assessment audit

Reviewed and completed on 3 October 2026 against Employee_Asset_Inventory_Management_Assessment.docx.pdf.

The existing application had the main screens and CRUD endpoints, but several lifecycle, validation, history, filtering and dashboard behaviors were incomplete. These have been implemented and verified while retaining the existing NestJS, Prisma, PostgreSQL and Next.js architecture.

## Requirements coverage

| Requirement | Completed behavior | Verification |
| --- | --- | --- |
| FR01 Asset management | Create, list, detail, update, retire; purchase price, warranty, condition and notes; unique tags and serials; category validation | API CRUD and validation tests; browser form and detail inspection |
| FR02 Category management | Create, read, update, activate/deactivate, delete unused categories; rename cascades and referenced deletion is rejected | API CRUD, rename and reference protection tests |
| FR03 Employee management | Create, read, update, active status, department/search filters; preserve referenced employees through deactivation | API CRUD and historical reference tests |
| FR04 Assignment | Assign only available assets to active employees; prevent duplicate active ownership; legacy endpoints use the same workflow | API permissions, concurrent assignment and rollback tests |
| FR05 Return | Inspection condition, return notes and date; update availability/condition; prevent duplicate returns | API return, date, concurrent return and rollback tests; browser form inspection |
| FR06 Lifecycle | Available, assigned, damaged, under repair, lost and retired; protected transitions while assigned; recovery and retirement | API transition tests; browser status controls |
| FR07 History | Creation, assignment, return and status events with previous/new status; asset history endpoint; no history mutation endpoints | API history and transaction tests; browser detail inspection |
| FR08 Lists | Validated search, filters, pagination and sort on major APIs; table sorting/pagination; assignment/return server pagination | API query tests; browser assignment search |
| FR09 Dashboard | All six statuses, category breakdown, recent assignments/activity; personal employee dashboard and history | API summary and employee portal tests; browser dashboard inspection |
| FR10 Validation/errors | DTO validation, required/null handling, normalized email, consistent problem details and conflict/not-found responses | API malformed input, duplicates and error tests |

Authentication supports ADMIN, MANAGER and EMPLOYEE. Permissions, current account activation/role and employee association are checked against database state. Employee access is restricted to personal records. User CRUD, password changes, activation and deletion are covered by API tests. Health and generated Swagger documentation are available.

## Corrections made

- Restored the missing asset history route and added PATCH asset updates and a validated status endpoint.
- Made assignments, returns and their history atomic; added a database constraint preventing two active assignments for one asset.
- Prevented assignment bypasses, invalid lifecycle changes and retirement of assigned equipment.
- Persisted inspection condition and return notes separately from assignment notes.
- Linked assets to category records, backfilled existing category names and preserved records needed for audit history.
- Completed dashboard data, employee portal data, optional date/serial handling and asset financial/warranty fields.
- Fixed frontend session rendering, response parsing, stale list requests, filters, sorting, pagination and the dedicated Returns screen.
- Enabled live Swagger generation and isolated integration testing from working inventory.

## Verification

| Check | Result |
| --- | --- |
| Backend build and lint | Passed |
| Frontend production build and lint | Passed |
| Backend unit tests | 20 suites, 51 tests passed |
| API integration tests | 8 suites, 63 tests passed |
| Total automated tests | 114 passed |
| Browser checks | Admin login, dashboard, asset form/detail/history, category form, Returns form and assignment search verified |
| Database migrations | All 11 migrations apply successfully, including two lifecycle/condition migrations added in this work |

The API suite creates, migrates and seeds a uniquely named temporary PostgreSQL schema, then removes only that schema. It covers CRUD, all three roles, validation, concurrent requests and rollback when history insertion fails. Browser checks used existing records without submitting inventory changes.

Run backend verification from `backend`: `npm run build`, `npm run lint`, `npm test -- --runInBand`, and `npm run test:e2e`. Run frontend verification from `frontend`: `npm run build` and `npm run lint`. The integration runner optionally accepts TEST_DATABASE_URL; its database user needs permission to create temporary schemas. Do not run the reset-style seed against inventory you want to retain.

## Practical limits

- Historical returns created before this upgrade have no recorded inspection condition/return notes; those values remain unknown rather than invented. Existing damaged asset conditions are backfilled as DAMAGED.
- Roles remain the three assessment roles, implemented as an enum; dynamic role management from the suggested folder scaffold is not required for these workflows.
- Array-backed frontend tables paginate locally; the APIs support explicit server pagination. Assignments and Returns use server pagination.
- The existing working-database employee demo account does not accept the README's sample employee password. Its password was left unchanged. Employee login and permissions pass with isolated test accounts.
- Browser checks were targeted smoke checks. Automated API tests provide the complete CRUD and workflow coverage.

Local review: http://localhost:3000. API documentation: http://localhost:3001/api/docs.
