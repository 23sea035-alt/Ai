// Re-export Clerk-based auth as the standard auth interface.
// Routes continue to import requireAuth and AuthRequest from this module.
export { requireAuth, optionalAuth, AuthRequest } from "../services/auth/clerk.middleware.js";
