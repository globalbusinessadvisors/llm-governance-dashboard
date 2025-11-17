/**
 * Service Layer Index
 *
 * Centralized export point for all TypeScript services.
 * This provides a clean API for components to import services.
 */

export { sdkClient, sdk } from './sdk-client';
export { authService, AuthService } from './auth-service';
export {
  organizationService,
  OrganizationService,
} from './organization-service';

// Re-export types from the published package
export type {
  User,
  Organization,
  Team,
  LLMProvider,
  LLMModel,
  OrganizationMember,
  TeamMember,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from '@llm-dev-ops/llm-governance-types';
