I already have an Employee Asset & Inventory Management System project created and running.

IMPORTANT:
Do NOT create a new project.
Do NOT reinstall or recreate the frontend/backend unless something is actually missing.
Do NOT delete or rewrite working code.

My required stack is:
- Frontend: Next.js + TypeScript
- Backend: NestJS + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- REST APIs

First, inspect my ENTIRE existing project structure and current code.

Compare my current implementation with these required features:

1. Dashboard
2. Assets
3. Categories
4. Employees
5. Asset Assignments
6. Asset Returns
7. Asset History
8. Authentication
9. Users & Roles
10. Health endpoint

Required asset statuses:
AVAILABLE
ASSIGNED
DAMAGED
UNDER_REPAIR
LOST
RETIRED

Required asset conditions:
NEW
GOOD
FAIR
DAMAGED

Important business rules:
- Only AVAILABLE assets can be assigned.
- Only ACTIVE employees can receive assets.
- An asset cannot have more than one active assignment.
- Returning an asset must close the active assignment.
- A good return should make the asset AVAILABLE.
- A damaged return should make the asset DAMAGED.
- Assignment, return and status changes must create AssetHistory.
- Assignment and return operations should use Prisma transactions.
- Asset codes must be unique.
- Employee codes must be unique.
- Serial numbers should be unique where applicable.

Architecture rules:
- NestJS controllers should not directly access Prisma.
- Business logic should be in services.
- Database operations should use PrismaService.
- Next.js should use services and a central API client.
- Do not convert the backend into microservices.

DO NOT start coding yet.

FIRST give me a PROJECT AUDIT.

Tell me:

1. What is already completed
2. What is partially completed
3. What is missing
4. Any errors or architecture problems you find
5. Database/Prisma status
6. Frontend status
7. Backend/API status
8. Which phase I should work on next

Then create a checklist like:

Phase 1 - Foundation: Complete / Partial / Missing
Phase 2 - Assets + Categories: Complete / Partial / Missing
Phase 3 - Employees: Complete / Partial / Missing
Phase 4 - Assignment: Complete / Partial / Missing
Phase 5 - Returns + History: Complete / Partial / Missing
Phase 6 - Dashboard: Complete / Partial / Missing
Phase 7 - Authentication + Roles: Complete / Partial / Missing
Phase 8 - Testing + Swagger + README: Complete / Partial / Missing

Do not modify any files until you finish the audit and show me the results.

After the audit, STOP and wait for my confirmation before making changes.