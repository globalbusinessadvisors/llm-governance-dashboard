/**
 * SDK Client Service
 *
 * Wraps the published @llm-dev-ops/llm-governance-sdk package
 * and provides a singleton instance for the frontend.
 */

import { LLMGovernanceSDK } from '@llm-dev-ops/llm-governance-sdk';
import { browser } from '$app/environment';

class SDKClientService {
  private static instance: SDKClientService;
  private sdk: LLMGovernanceSDK;

  private constructor() {
    const baseUrl = browser
      ? window.location.origin + '/api/v1'
      : 'http://localhost:8000/api/v1';

    const token = browser ? localStorage.getItem('auth_token') : null;

    this.sdk = new LLMGovernanceSDK({
      baseUrl,
      token: token || undefined,
      onTokenChange: (newToken) => {
        if (browser) {
          if (newToken) {
            localStorage.setItem('auth_token', newToken);
          } else {
            localStorage.removeItem('auth_token');
          }
        }
      },
    });
  }

  public static getInstance(): SDKClientService {
    if (!SDKClientService.instance) {
      SDKClientService.instance = new SDKClientService();
    }
    return SDKClientService.instance;
  }

  public getSDK(): LLMGovernanceSDK {
    return this.sdk;
  }

  public setToken(token: string | null): void {
    this.sdk.setToken(token);
  }

  public getToken(): string | null {
    return this.sdk.getToken();
  }

  public isAuthenticated(): boolean {
    return !!this.sdk.getToken();
  }
}

// Export singleton instance
export const sdkClient = SDKClientService.getInstance();
export const sdk = sdkClient.getSDK();
