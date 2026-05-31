# Backend Development Rules

This project prioritizes maintainability first, then scalability. Build it as a modular NestJS backend with clear feature boundaries, SOLID principles, and PostgreSQL access through Prisma.

## Core Architecture

Use a modular monolith.

The app should stay in one deployable backend unless there is a real operational reason to split it. Keep the code modular enough that a feature can be moved or scaled later without rewriting the whole system.

Request flow:

```text
Controller
  -> DTO validation
  -> Guard / permission check
  -> Service / use-case logic
  -> Repository or Prisma data provider
  -> PrismaService
  -> PostgreSQL
```

## Module Rules

Organize code by feature, not by technical type.

Preferred structure:

```text
src/
  common/
  config/
  prisma/
  auth/
  users/
  residents/
  documents/
  barangay/
```

Each feature module should own its controller, service, DTOs, tests, and data access helpers.

A module should expose only what other modules truly need. Avoid importing one module everywhere just to access internal details.

## SOLID Rules

### Single Responsibility Principle

Each class should have one clear reason to change.

Controllers handle HTTP only. They should not contain business rules, password logic, or database queries.

Services handle use cases and business rules. They should not know HTTP details like `Request`, `Response`, headers, or status codes unless absolutely necessary.

Repositories or data providers handle database queries. They should not decide business policy.

DTOs validate and shape input. They should not perform database calls.

### Open/Closed Principle

Prefer adding a new provider, strategy, policy, or helper over editing a large conditional block.

If a service starts growing many `if` or `switch` branches for different behaviors, consider extracting those behaviors into separate classes.

### Liskov Substitution Principle

If a class implements an interface or replaces another provider, it must keep the same contract.

Do not make a mock, repository, or strategy behave differently from the real implementation in ways that surprise callers.

### Interface Segregation Principle

Keep contracts small.

Do not inject a large service when the caller only needs one small behavior. Create focused providers or methods when it improves clarity.

Avoid "god services" such as one service that manages users, auth, residents, documents, and reports.

### Dependency Inversion Principle

High-level business logic should not depend directly on low-level implementation details when that dependency makes the code hard to test or change.

For simple CRUD, a service may use `PrismaService` directly if the logic is still small and clear.

When database access becomes repeated, complex, or shared, create a feature repository/data provider and inject that into the service.

External systems such as email, SMS, storage, payment, or third-party APIs should be wrapped behind project-owned services or interfaces.

## Controller Rules

Controllers must stay thin.

Allowed in controllers:

- Route decorators
- Guards and permission decorators
- DTO parameters
- Calling one service method
- Returning the service result

Avoid in controllers:

- Prisma queries
- Password hashing
- Token generation
- Business rules
- Large mapping logic
- Manual validation that belongs in DTOs or pipes

## Service Rules

Services should represent application use cases.

Good service method names describe actions:

```text
login
createResident
requestBarangayClearance
approveDocumentRequest
```

Avoid vague service method names:

```text
handle
process
doStuff
manageData
```

Services should be easy to unit test by mocking database and external dependencies.

## Database Rules

Prisma is the only approved database access layer.

Do not query PostgreSQL directly from controllers or random helper files.

Use Prisma migrations for schema changes.

After changing `prisma/schema.prisma`, run:

```bash
npx prisma generate
npx prisma migrate dev --name <migration-name>
```

Do not commit real secrets from `.env`.

Use `.env.example` to document required environment variables.

## DTO And Validation Rules

Every request body should have a DTO.

DTOs should use `class-validator` decorators.

Do not pass unvalidated raw request bodies into services.

Use separate DTOs for separate operations when the rules differ. For example, `CreateUserDto` and `UpdateUserDto` should not be forced into one shape if they validate differently.

## Auth And Security Rules

Password hashing belongs in auth or user-related services, never in controllers.

JWT creation and validation belong in auth providers and strategies.

Protected routes must use guards.

Never return `passwordHash` from API responses.

Use generic authentication errors such as `Invalid credentials` so attackers cannot learn whether an email exists.

Every backend change must be reviewed for security risk before it is considered complete. Check authentication, authorization, input validation, injection risk, rate limiting, secret exposure, unsafe logging, file handling, external calls, and data leakage.

Treat personal data as sensitive by default. Personal data includes names, birth dates, addresses, contact numbers, email addresses, government IDs, household details, and any resident-identifying information.

Personal data must be encrypted in transit and at rest. Use TLS for transport, and encrypt stored personal data through a project-owned encryption provider or an approved managed encryption mechanism. Do not store personal data in plaintext unless there is a documented, approved reason.

Keep encryption centralized in a service, Prisma middleware/extension, or feature data provider. Do not scatter ad hoc crypto calls through controllers, DTOs, or unrelated helpers.

Encryption keys and secrets must come from environment-backed secret management. Never hard-code them, commit them, log them, or expose them in API responses.

Only decrypt personal data at the boundary where it is needed for an authorized use case. Do not log decrypted values, include them in errors, or return them to callers without an explicit permission check.

Use hashing, not encryption, for passwords and other one-way verification secrets.

## Testing Rules

Unit tests should not require a real PostgreSQL database.

Mock `PrismaService`, repositories, JWT services, and external services in unit tests.

Integration or e2e tests may use a real test database, but that setup should be explicit.

Tests should focus on behavior, not implementation details.

## Naming Rules

Use clear names over clever names.

Recommended patterns:

```text
AuthService
UsersService
ResidentsService
CreateResidentDto
UpdateResidentDto
ResidentsRepository
JwtAuthGuard
```

Avoid abbreviations unless they are common in the project domain.

## Refactoring Rule

Do not introduce abstractions only because they sound professional.

Add an abstraction when it does at least one of these:

- Removes meaningful duplication
- Makes testing easier
- Separates business logic from infrastructure
- Makes a feature easier to change safely
- Matches an established project pattern

## Review Checklist

Before considering backend work complete, check:

- Is the controller thin?
- Is input validated with DTOs?
- Is business logic in a service?
- Is database access kept out of controllers?
- Are secrets kept out of code?
- Has the change been checked for authentication, authorization, validation, injection, logging, and data leakage risks?
- Is all persisted personal data encrypted at rest?
- Is personal data only decrypted and returned for authorized use cases?
- Are module boundaries clear?
- Can the service be unit tested with mocks?
- Did Prisma Client get regenerated after schema changes?
- Did build and relevant tests pass?
