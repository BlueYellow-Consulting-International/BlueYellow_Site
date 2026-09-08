/** Injection token for the worker's single shared PrismaClient.
 *  Lives in its own file so providers can inject it without importing
 *  worker.module.ts (which would create a circular dependency). */
export const PRISMA_CLIENT = 'PRISMA_CLIENT';
