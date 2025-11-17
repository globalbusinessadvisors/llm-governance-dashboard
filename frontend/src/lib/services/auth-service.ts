/**
 * Authentication Service
 *
 * Handles all authentication-related business logic using the published SDK.
 * Provides a TypeScript-first API for authentication operations.
 */

import { sdk, sdkClient } from './sdk-client';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from '@llm-dev-ops/llm-governance-types';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await sdk.auth.login(credentials);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      return await sdk.auth.register(userData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    try {
      return await sdk.auth.getCurrentUser();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await sdk.auth.logout();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return sdkClient.isAuthenticated();
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return sdkClient.getToken();
  }

  /**
   * Set auth token
   */
  setToken(token: string | null): void {
    sdkClient.setToken(token);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      return await sdk.auth.requestPasswordReset(email);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    password: string
  ): Promise<{ message: string }> {
    try {
      return await sdk.auth.resetPassword(token, password);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Setup MFA
   */
  async setupMFA() {
    try {
      return await sdk.auth.setupMFA();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify MFA setup
   */
  async verifyMFASetup(code: string) {
    try {
      return await sdk.auth.verifyMFASetup(code);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify MFA code during login
   */
  async verifyMFA(request: any) {
    try {
      return await sdk.auth.verifyMFA(request);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle and normalize errors
   */
  private handleError(error: any): Error {
    if (error.status_code) {
      return new Error(error.detail || 'Authentication error occurred');
    }
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unknown error occurred');
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
