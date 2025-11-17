/**
 * Organization Service
 *
 * Handles all organization-related business logic using the published SDK.
 * Provides a TypeScript-first API for organization operations.
 */

import { sdk } from './sdk-client';
import type {
  Organization,
  OrganizationMember,
  Team,
  TeamMember,
  LLMProvider,
  LLMModel,
} from '@llm-dev-ops/llm-governance-types';

export class OrganizationService {
  private static instance: OrganizationService;

  private constructor() {}

  public static getInstance(): OrganizationService {
    if (!OrganizationService.instance) {
      OrganizationService.instance = new OrganizationService();
    }
    return OrganizationService.instance;
  }

  // ==================== Organizations ====================

  async listOrganizations(): Promise<Organization[]> {
    try {
      return await sdk.organizations.listOrganizations();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrganization(id: string): Promise<Organization> {
    try {
      return await sdk.organizations.getOrganization(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createOrganization(
    data: Partial<Organization>
  ): Promise<Organization> {
    try {
      return await sdk.organizations.createOrganization(data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateOrganization(
    id: string,
    data: Partial<Organization>
  ): Promise<Organization> {
    try {
      return await sdk.organizations.updateOrganization(id, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteOrganization(id: string): Promise<void> {
    try {
      await sdk.organizations.deleteOrganization(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== Organization Members ====================

  async listOrganizationMembers(
    organizationId: string
  ): Promise<OrganizationMember[]> {
    try {
      return await sdk.organizations.listOrganizationMembers(organizationId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addOrganizationMember(
    organizationId: string,
    userId: string,
    role: string
  ): Promise<OrganizationMember> {
    try {
      return await sdk.organizations.addOrganizationMember(
        organizationId,
        userId,
        role
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateOrganizationMember(
    organizationId: string,
    memberId: string,
    role: string
  ): Promise<OrganizationMember> {
    try {
      return await sdk.organizations.updateOrganizationMember(
        organizationId,
        memberId,
        role
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeOrganizationMember(
    organizationId: string,
    memberId: string
  ): Promise<void> {
    try {
      await sdk.organizations.removeOrganizationMember(
        organizationId,
        memberId
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== Teams ====================

  async listTeams(organizationId: string): Promise<Team[]> {
    try {
      return await sdk.organizations.listTeams(organizationId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTeam(teamId: string): Promise<Team> {
    try {
      return await sdk.organizations.getTeam(teamId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createTeam(
    organizationId: string,
    data: Partial<Team>
  ): Promise<Team> {
    try {
      return await sdk.organizations.createTeam(organizationId, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTeam(teamId: string, data: Partial<Team>): Promise<Team> {
    try {
      return await sdk.organizations.updateTeam(teamId, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteTeam(teamId: string): Promise<void> {
    try {
      await sdk.organizations.deleteTeam(teamId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== Team Members ====================

  async listTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      return await sdk.organizations.listTeamMembers(teamId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addTeamMember(
    teamId: string,
    userId: string,
    role?: string
  ): Promise<TeamMember> {
    try {
      return await sdk.organizations.addTeamMember(teamId, userId, role);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeTeamMember(teamId: string, memberId: string): Promise<void> {
    try {
      await sdk.organizations.removeTeamMember(teamId, memberId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== LLM Providers ====================

  async listProviders(organizationId: string): Promise<LLMProvider[]> {
    try {
      return await sdk.organizations.listProviders(organizationId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProvider(providerId: string): Promise<LLMProvider> {
    try {
      return await sdk.organizations.getProvider(providerId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createProvider(
    organizationId: string,
    data: Partial<LLMProvider>
  ): Promise<LLMProvider> {
    try {
      return await sdk.organizations.createProvider(organizationId, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProvider(
    providerId: string,
    data: Partial<LLMProvider>
  ): Promise<LLMProvider> {
    try {
      return await sdk.organizations.updateProvider(providerId, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteProvider(providerId: string): Promise<void> {
    try {
      await sdk.organizations.deleteProvider(providerId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== LLM Models ====================

  async listModels(providerId: string): Promise<LLMModel[]> {
    try {
      return await sdk.organizations.listModels(providerId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getModel(modelId: string): Promise<LLMModel> {
    try {
      return await sdk.organizations.getModel(modelId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createModel(
    providerId: string,
    data: Partial<LLMModel>
  ): Promise<LLMModel> {
    try {
      return await sdk.organizations.createModel(providerId, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateModel(
    modelId: string,
    data: Partial<LLMModel>
  ): Promise<LLMModel> {
    try {
      return await sdk.organizations.updateModel(modelId, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteModel(modelId: string): Promise<void> {
    try {
      await sdk.organizations.deleteModel(modelId);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== Helper Methods ====================

  private handleError(error: any): Error {
    if (error.status_code) {
      return new Error(error.detail || 'Operation failed');
    }
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unknown error occurred');
  }
}

// Export singleton instance
export const organizationService = OrganizationService.getInstance();
