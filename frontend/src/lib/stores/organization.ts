/**
 * Organization Store (TypeScript-First)
 *
 * Svelte store that uses the TypeScript OrganizationService for state management.
 * All business logic is in the service layer, this just manages UI state.
 */

import { writable, derived } from 'svelte/store';
import { organizationService } from '$lib/services';
import type {
  Organization,
  Team,
  LLMProvider,
  OrganizationMember,
} from '$lib/services';

interface OrganizationStore {
  organizations: Organization[];
  currentOrganization: Organization | null;
  teams: Team[];
  members: OrganizationMember[];
  providers: LLMProvider[];
  isLoading: boolean;
  error: string | null;
}

class OrganizationStoreManager {
  private store = writable<OrganizationStore>({
    organizations: [],
    currentOrganization: null,
    teams: [],
    members: [],
    providers: [],
    isLoading: false,
    error: null,
  });

  subscribe = this.store.subscribe;

  // ==================== Organizations ====================

  async loadOrganizations(): Promise<void> {
    this.setLoading(true);
    try {
      const organizations = await organizationService.listOrganizations();
      this.store.update((state) => ({
        ...state,
        organizations,
        error: null,
      }));
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to load organizations');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async setCurrentOrganization(id: string): Promise<void> {
    this.setLoading(true);
    try {
      const org = await organizationService.getOrganization(id);
      this.store.update((state) => ({
        ...state,
        currentOrganization: org,
        error: null,
      }));
      // Auto-load related data
      await Promise.all([
        this.loadTeams(id),
        this.loadMembers(id),
        this.loadProviders(id),
      ]);
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to load organization');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    this.setLoading(true);
    try {
      const org = await organizationService.createOrganization(data);
      this.store.update((state) => ({
        ...state,
        organizations: [...state.organizations, org],
        error: null,
      }));
      return org;
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to create organization');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async updateOrganization(id: string, data: Partial<Organization>): Promise<void> {
    this.setLoading(true);
    try {
      const updated = await organizationService.updateOrganization(id, data);
      this.store.update((state) => ({
        ...state,
        organizations: state.organizations.map((org) =>
          org.id === id ? updated : org
        ),
        currentOrganization:
          state.currentOrganization?.id === id ? updated : state.currentOrganization,
        error: null,
      }));
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to update organization');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async deleteOrganization(id: string): Promise<void> {
    this.setLoading(true);
    try {
      await organizationService.deleteOrganization(id);
      this.store.update((state) => ({
        ...state,
        organizations: state.organizations.filter((org) => org.id !== id),
        currentOrganization:
          state.currentOrganization?.id === id ? null : state.currentOrganization,
        error: null,
      }));
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to delete organization');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  // ==================== Teams ====================

  async loadTeams(organizationId: string): Promise<void> {
    try {
      const teams = await organizationService.listTeams(organizationId);
      this.store.update((state) => ({
        ...state,
        teams,
        error: null,
      }));
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to load teams');
      throw error;
    }
  }

  async createTeam(organizationId: string, data: Partial<Team>): Promise<Team> {
    this.setLoading(true);
    try {
      const team = await organizationService.createTeam(organizationId, data);
      this.store.update((state) => ({
        ...state,
        teams: [...state.teams, team],
        error: null,
      }));
      return team;
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to create team');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async deleteTeam(teamId: string): Promise<void> {
    this.setLoading(true);
    try {
      await organizationService.deleteTeam(teamId);
      this.store.update((state) => ({
        ...state,
        teams: state.teams.filter((team) => team.id !== teamId),
        error: null,
      }));
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to delete team');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  // ==================== Members ====================

  async loadMembers(organizationId: string): Promise<void> {
    try {
      const members = await organizationService.listOrganizationMembers(organizationId);
      this.store.update((state) => ({
        ...state,
        members,
        error: null,
      }));
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to load members');
      throw error;
    }
  }

  async addMember(organizationId: string, userId: string, role: string): Promise<void> {
    this.setLoading(true);
    try {
      const member = await organizationService.addOrganizationMember(
        organizationId,
        userId,
        role
      );
      this.store.update((state) => ({
        ...state,
        members: [...state.members, member],
        error: null,
      }));
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to add member');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async removeMember(organizationId: string, memberId: string): Promise<void> {
    this.setLoading(true);
    try {
      await organizationService.removeOrganizationMember(organizationId, memberId);
      this.store.update((state) => ({
        ...state,
        members: state.members.filter((m) => m.id !== memberId),
        error: null,
      }));
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to remove member');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  // ==================== Providers ====================

  async loadProviders(organizationId: string): Promise<void> {
    try {
      const providers = await organizationService.listProviders(organizationId);
      this.store.update((state) => ({
        ...state,
        providers,
        error: null,
      }));
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to load providers');
      throw error;
    }
  }

  async createProvider(organizationId: string, data: Partial<LLMProvider>): Promise<LLMProvider> {
    this.setLoading(true);
    try {
      const provider = await organizationService.createProvider(organizationId, data);
      this.store.update((state) => ({
        ...state,
        providers: [...state.providers, provider],
        error: null,
      }));
      return provider;
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to create provider');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async deleteProvider(providerId: string): Promise<void> {
    this.setLoading(true);
    try {
      await organizationService.deleteProvider(providerId);
      this.store.update((state) => ({
        ...state,
        providers: state.providers.filter((p) => p.id !== providerId),
        error: null,
      }));
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to delete provider');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  // ==================== Helper Methods ====================

  private setLoading(isLoading: boolean): void {
    this.store.update((state) => ({ ...state, isLoading }));
  }

  private setError(error: string | null): void {
    this.store.update((state) => ({ ...state, error }));
  }

  clearError(): void {
    this.setError(null);
  }
}

export const organizationStore = new OrganizationStoreManager();

// Derived stores for common use cases
export const currentOrganization = derived(
  organizationStore,
  ($store) => $store.currentOrganization
);

export const organizations = derived(
  organizationStore,
  ($store) => $store.organizations
);

export const teams = derived(organizationStore, ($store) => $store.teams);

export const providers = derived(organizationStore, ($store) => $store.providers);
