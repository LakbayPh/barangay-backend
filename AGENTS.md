# Project Instructions

Before changing backend code in this repository, read and follow `ARCHITECTURE.md`.

The project prioritizes maintainability first, then scalability. Keep NestJS modules feature-based, controllers thin, business logic in services, and database access behind Prisma-backed providers.

Every backend change must be checked strictly for security risk. Personal data must be treated as sensitive by default and encrypted in transit and at rest.
