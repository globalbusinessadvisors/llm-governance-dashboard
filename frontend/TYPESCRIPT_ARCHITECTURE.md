# TypeScript-First Frontend Architecture

This document explains the TypeScript-centric architecture of the LLM Governance Dashboard frontend.

## 🎯 Philosophy

**TypeScript First, Templates Second**

- ✅ **90%+ TypeScript** - Business logic, state management, and API calls in `.ts` files
- ✅ **Minimal Templates** - Svelte `.svelte` files contain only UI markup
- ✅ **Published SDK** - Uses our npm-published `@llm-dev-ops/llm-governance-sdk`
- ✅ **Type Safety** - Complete type definitions from `@llm-dev-ops/llm-governance-types`
- ✅ **Testable** - Pure TypeScript services are easy to unit test

## 📁 Directory Structure

```
frontend/src/lib/
├── services/              # 100% TypeScript - Business Logic Layer
│   ├── sdk-client.ts      # SDK singleton wrapper
│   ├── auth-service.ts    # Authentication business logic
│   ├── organization-service.ts  # Organization business logic
│   └── index.ts           # Service exports
│
├── stores/                # TypeScript Classes - State Management
│   ├── auth.ts            # Auth state (uses AuthService)
│   ├── organization.ts    # Organization state (uses OrganizationService)
│   └── theme.ts           # UI theme state
│
├── types/                 # TypeScript Types (Re-exported from SDK)
│   └── index.ts
│
├── components/            # Svelte Components (Minimal Logic)
│   └── *.svelte           # UI templates only
│
└── api/                   # Legacy (being phased out)
    └── *.ts               # Old API client (replaced by SDK)
```

## 🏗️ Architecture Layers

### Layer 1: Published SDK (Foundation)

```typescript
// From npm: @llm-dev-ops/llm-governance-sdk
import { LLMGovernanceSDK } from '@llm-dev-ops/llm-governance-sdk';
import type { User, Organization } from '@llm-dev-ops/llm-governance-types';

const sdk = new LLMGovernanceSDK({
  baseUrl: 'https://api.example.com/v1',
  token: 'your-token',
});

// Direct SDK usage (low-level)
const user = await sdk.auth.getCurrentUser();
```

**What it provides:**
- HTTP client with authentication
- All API endpoints (auth, organizations, teams, providers)
- Complete TypeScript types
- Error handling

### Layer 2: Service Classes (Business Logic)

```typescript
// frontend/src/lib/services/auth-service.ts
import { sdk } from './sdk-client';
import type { LoginCredentials, User } from '@llm-dev-ops/llm-governance-types';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<User> {
    // Business logic here (validation, transformation, etc.)
    const response = await sdk.auth.login(credentials);
    // Additional processing
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return await sdk.auth.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return !!sdk.getToken();
  }
}

export const authService = new AuthService();
```

**What it provides:**
- Wraps SDK with business logic
- Handles errors gracefully
- Transforms data for UI needs
- Validates input
- Caches results if needed

### Layer 3: Store Classes (State Management)

```typescript
// frontend/src/lib/stores/auth.ts
import { writable } from 'svelte/store';
import { authService } from '$lib/services';
import type { User } from '$lib/services';

class AuthStoreManager {
  private store = writable<{
    user: User | null;
    isLoading: boolean;
    error: string | null;
  }>({
    user: null,
    isLoading: false,
    error: null,
  });

  subscribe = this.store.subscribe;

  async login(credentials: LoginCredentials): Promise<void> {
    this.setLoading(true);
    try {
      await authService.login(credentials);
      const user = await authService.getCurrentUser();
      this.setUser(user);
    } catch (error) {
      this.setError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  private setUser(user: User): void {
    this.store.update(s => ({ ...s, user }));
  }

  private setLoading(loading: boolean): void {
    this.store.update(s => ({ ...s, isLoading: loading }));
  }

  private setError(error: string): void {
    this.store.update(s => ({ ...s, error }));
  }
}

export const authStore = new AuthStoreManager();
```

**What it provides:**
- Reactive state management
- UI state (loading, errors)
- Coordinates multiple service calls
- Optimistic updates
- Cache invalidation

### Layer 4: Svelte Components (UI Only)

```svelte
<!-- frontend/src/routes/login/+page.svelte -->
<script lang="ts">
  import { authStore } from '$lib/stores';
  import type { LoginCredentials } from '$lib/services';

  let credentials: LoginCredentials = {
    email: '',
    password: '',
  };

  async function handleLogin() {
    await authStore.login(credentials);
  }
</script>

{#if $authStore.isLoading}
  <p>Loading...</p>
{:else if $authStore.error}
  <p class="error">{$authStore.error}</p>
{/if}

<form on:submit|preventDefault={handleLogin}>
  <input bind:value={credentials.email} type="email" />
  <input bind:value={credentials.password} type="password" />
  <button type="submit">Login</button>
</form>
```

**What it contains:**
- ❌ **NO** API calls
- ❌ **NO** business logic
- ❌ **NO** data transformation
- ✅ **ONLY** UI markup
- ✅ **ONLY** event handlers calling stores
- ✅ **ONLY** reactive subscriptions

## 🔄 Data Flow

```
User Action (Click Login Button)
    ↓
Svelte Component Event Handler
    ↓
Store Manager Method (authStore.login())
    ↓
Service Class Method (authService.login())
    ↓
Published SDK Call (sdk.auth.login())
    ↓
HTTP Request to API
    ↓
Response
    ↓
Service processes/validates response
    ↓
Store updates state
    ↓
Svelte component auto-updates via reactivity
```

## 📦 Using the Published SDK

### Installation

The frontend now uses our published npm packages:

```json
{
  "dependencies": {
    "@llm-dev-ops/llm-governance-sdk": "^1.0.1",
    "@llm-dev-ops/llm-governance-types": "^1.0.0"
  }
}
```

### Importing

```typescript
// Services layer
import { sdk } from '$lib/services/sdk-client';
import { authService, organizationService } from '$lib/services';

// Types
import type {
  User,
  Organization,
  Team,
  LLMProvider,
} from '@llm-dev-ops/llm-governance-types';

// Or re-export from services
import type { User, Organization } from '$lib/services';
```

## 🎨 Component Best Practices

### ❌ Bad (Old Way - Logic in Component)

```svelte
<script lang="ts">
  import { apiClient } from '$lib/api';

  let user = null;
  let loading = false;
  let error = null;

  async function login() {
    loading = true;
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.ok) {
        user = await response.json();
        localStorage.setItem('token', user.token);
      } else {
        error = 'Login failed';
      }
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>
```

### ✅ Good (New Way - TypeScript Services)

```svelte
<script lang="ts">
  import { authStore } from '$lib/stores';
  import type { LoginCredentials } from '$lib/services';

  let credentials: LoginCredentials = {
    email: '',
    password: '',
  };

  async function handleLogin() {
    await authStore.login(credentials);
  }
</script>

{#if $authStore.isLoading}
  <LoadingSpinner />
{:else if $authStore.error}
  <ErrorMessage message={$authStore.error} />
{/if}

<LoginForm {credentials} on:submit={handleLogin} />
```

## 🧪 Testing

### Service Testing (Pure TypeScript)

```typescript
// auth-service.test.ts
import { AuthService } from './auth-service';
import { sdk } from './sdk-client';

jest.mock('./sdk-client');

describe('AuthService', () => {
  it('should login successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    sdk.auth.login = jest.fn().resolves({ access_token: 'token', user: mockUser });

    const service = new AuthService();
    const result = await service.login({ email: 'test@example.com', password: 'pass' });

    expect(result).toEqual(mockUser);
    expect(sdk.auth.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'pass',
    });
  });
});
```

### Store Testing (TypeScript Classes)

```typescript
// auth-store.test.ts
import { get } from 'svelte/store';
import { authStore } from './auth';
import { authService } from '$lib/services';

jest.mock('$lib/services');

describe('AuthStore', () => {
  it('should update user on login', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    authService.login = jest.fn().resolves();
    authService.getCurrentUser = jest.fn().resolves(mockUser);

    await authStore.login({ email: 'test@example.com', password: 'pass' });

    const state = get(authStore);
    expect(state.user).toEqual(mockUser);
    expect(state.isLoading).toBe(false);
  });
});
```

## 📚 Migration Guide

### For Developers

1. **Stop writing logic in `.svelte` files**
   - Extract to service classes
   - Use stores for state

2. **Use the published SDK**
   - Import from `@llm-dev-ops/llm-governance-sdk`
   - Don't write raw `fetch()` calls

3. **Type everything**
   - Import types from `@llm-dev-ops/llm-governance-types`
   - No `any` types

4. **Components are dumb**
   - Only markup and event handlers
   - Call stores, don't call services directly

### Migrating Existing Components

```diff
 <script lang="ts">
-  import { apiClient } from '$lib/api';
+  import { organizationStore } from '$lib/stores';

-  let orgs = [];
-  let loading = false;
-
-  onMount(async () => {
-    loading = true;
-    const response = await apiClient.get('/organizations');
-    orgs = response.data;
-    loading = false;
-  });
+  import { onMount } from 'svelte';
+  onMount(() => organizationStore.loadOrganizations());
 </script>

-{#if loading}
+{#if $organizationStore.isLoading}
   <LoadingSpinner />
 {:else}
-  {#each orgs as org}
+  {#each $organizationStore.organizations as org}
     <OrgCard {org} />
   {/each}
 {/if}
```

## 🚀 Benefits

### Before (HTML-Heavy)
- ❌ Business logic scattered in `.svelte` files
- ❌ Hard to test
- ❌ Duplicate API calls
- ❌ Inconsistent error handling
- ❌ No type safety

### After (TypeScript-First)
- ✅ **90%+ TypeScript** - Logic in testable classes
- ✅ **Reusable** - Services used across components
- ✅ **Type-Safe** - Full TypeScript coverage
- ✅ **Testable** - Pure functions, easy mocking
- ✅ **Maintainable** - Clear separation of concerns
- ✅ **Published SDK** - Use same SDK as external devs

## 📖 Additional Resources

- [SDK Documentation](../packages/sdk/README.md)
- [CLI Documentation](../packages/cli/README.md)
- [Types Documentation](../packages/types/README.md)
- [Svelte Best Practices](https://svelte.dev/docs)

---

**Made with ❤️ using TypeScript-first principles**
