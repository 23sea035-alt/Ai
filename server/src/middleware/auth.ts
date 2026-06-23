// Re-export Clerk-based auth as the standard auth interface.
// Routes continue to import requireAuth and AuthRequest from this module.
export { requireAuth, optionalAuth } from "../services/auth/clerk.middleware.js";
export type { AuthRequest } from "../services/auth/clerk.middleware.js";
