# Comprehensive Technology Stack Documentation

**Project:** BelegBoost - Multi-Tenant SaaS with Subdomain Routing
**Last Updated:** October 15, 2025

## Project Overview

Building a multi-tenant SaaS application with subdomain routing where each tenant has custom branding. This document provides comprehensive documentation for all technologies used in the project.

---

## Current Installed Versions

Based on `package.json`:
- **Next.js**: 15.5.5
- **React**: 19.1.0
- **TypeScript**: ^5
- **Tailwind CSS**: 4.1.14
- **@tailwindcss/postcss**: 4.1.14

---

# 1. Next.js 15.5

## Version Information
- **Current Version**: 15.5.5
- **Release Date**: August 2025
- **Status**: Stable, Production Ready

## Official Documentation
- **Main Docs**: https://nextjs.org/docs/app
- **Release Notes**: https://nextjs.org/blog/next-15-5
- **Upgrade Guide**: https://nextjs.org/docs/app/guides/upgrading/version-15

---

## 1.1 App Router Middleware

### Overview
Middleware runs on the server before a request is completed, allowing you to modify the response by rewriting, redirecting, modifying headers, or responding directly.

### Official Documentation
- **Middleware Reference**: https://nextjs.org/docs/app/api-reference/file-conventions/middleware
- **Getting Started**: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware

### Key Features in Next.js 15.5

#### Node.js Runtime Support (Now Stable)
After experimental support in 15.2, Node.js middleware runtime is now stable in 15.5.

**Before**: Next.js middleware only supported the Edge Runtime (limited Node.js library support)
**Now**: Full Node.js runtime support for middleware

**Configuration:**
```typescript
// middleware.ts
import type { NextRequest } from 'next/server';

export const config = {
  runtime: 'nodejs', // or 'edge' (default)
};

export function middleware(request: NextRequest) {
  // Your middleware logic
}
```

### File Location
Create `middleware.ts` (or `middleware.js`) in:
- Root of your project
- Inside `src` directory (if using)

### Matcher Configuration
```typescript
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 1.2 Subdomain Routing Patterns

### Official Examples
- **Vercel Platforms**: https://github.com/vercel/platforms
- **Official Guide**: https://vercel.com/guides/nextjs-multi-tenant-application

### Implementation Pattern

**Middleware for Subdomain Detection:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Extract subdomain
  const subdomain = hostname.split('.')[0];

  // Handle different environments
  const isLocalhost = hostname.includes('localhost');
  const isVercelPreview = hostname.includes('vercel.app');

  if (isLocalhost) {
    // Local development: tenant1.localhost:3000
    if (subdomain && subdomain !== 'localhost') {
      url.pathname = `/tenant/${subdomain}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  } else {
    // Production: tenant1.yourdomain.com
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      const tenant = parts[0];
      url.pathname = `/tenant/${tenant}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}
```

### Directory Structure for Multi-Tenancy
```
src/app/
├── (public)/           # Public routes (no tenant)
│   ├── login/
│   └── signup/
├── tenant/
│   └── [subdomain]/    # Tenant-specific routes
│       ├── layout.tsx  # Tenant layout with branding
│       ├── page.tsx
│       └── dashboard/
└── middleware.ts
```

### Local Development Setup
Add to `/etc/hosts` (macOS/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
```
127.0.0.1 tenant1.localhost
127.0.0.1 tenant2.localhost
```

Run dev server:
```bash
npm run dev
# Access at: http://tenant1.localhost:3000
```

### Key Resources
- **Vercel Platforms Template**: Production-ready Next.js 15 multi-tenant app
  - Tech Stack: Next.js 15 App Router, React 19, Upstash Redis, Tailwind 4, shadcn/ui
  - Features: Custom subdomains, tenant-specific content, shared layouts, admin interface
- **Medium Guide (Oct 2025)**: "Build a Multi-Tenant SaaS with Subdomains in Next.js"
  - Covers: App Router, Server Actions, Prisma, Postgres, Stripe integration

---

## 1.3 Server Actions Best Practices

### Official Documentation
- **Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations

### Key Principles (2025)

#### 1. Separation of Concerns
Server Actions isolate server-side responsibilities into dedicated functions, leaving components to focus on UI logic.

#### 2. Organization Strategy
**Don't**: Create single `actions.js` file
**Do**: Organize actions alongside components in feature-based folders

```
src/app/
└── dashboard/
    ├── page.tsx
    ├── actions.ts       # Dashboard-specific actions
    └── components/
        ├── UserForm.tsx
        └── actions.ts   # Form-specific actions
```

#### 3. File-Level vs Function-Level Directive

**File-level** (recommended for files with only server actions):
```typescript
// app/actions.ts
'use server';

export async function createUser(formData: FormData) {
  // Server action logic
}

export async function deleteUser(id: string) {
  // Server action logic
}
```

**Function-level** (for mixed client/server files):
```typescript
// components/UserForm.tsx
'use client';

import { useState } from 'react';

export default function UserForm() {
  async function handleSubmit(formData: FormData) {
    'use server';
    // Server action logic
  }

  return <form action={handleSubmit}>...</form>;
}
```

#### 4. Security Best Practices

**Always validate input with Zod:**
```typescript
'use server';

import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  tenantId: z.string().uuid(),
});

export async function createUser(formData: FormData) {
  // 1. Validate input
  const result = userSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
    tenantId: formData.get('tenantId'),
  });

  if (!result.success) {
    return { error: 'Invalid input', details: result.error.flatten() };
  }

  // 2. Verify user authentication
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  // 3. Verify tenant access
  const hasAccess = await verifyTenantAccess(session.userId, result.data.tenantId);
  if (!hasAccess) {
    return { error: 'Forbidden' };
  }

  // 4. Perform action
  const user = await db.user.create({
    data: result.data,
  });

  return { success: true, user };
}
```

#### 5. Error Handling Pattern
```typescript
'use server';

export async function updateProfile(formData: FormData) {
  try {
    // Validation
    const data = profileSchema.parse(Object.fromEntries(formData));

    // Business logic
    const result = await db.profile.update({
      where: { id: data.id },
      data,
    });

    revalidatePath('/profile');
    return { success: true, data: result };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Validation failed', details: error.flatten() };
    }

    console.error('Profile update failed:', error);
    return { error: 'An unexpected error occurred' };
  }
}
```

#### 6. Reusability
Server Actions can be used across multiple components:

```typescript
// app/actions/user.ts
'use server';

export async function getUsersByTenant(tenantId: string) {
  const session = await getSession();
  await verifyTenantAccess(session.userId, tenantId);

  return db.user.findMany({
    where: { tenantId },
  });
}

// Used in multiple components:
// - app/dashboard/users/page.tsx
// - app/settings/team/page.tsx
// - app/reports/users/page.tsx
```

### Security Improvements in Next.js 15
- Unused server actions excluded from client bundle (reduced exposure)
- Unique ID per server action (enhanced security via hidden input field)
- Dead code elimination for better security

---

## 1.4 Turbopack Configuration

### Official Documentation
- **Turbopack Reference**: https://nextjs.org/docs/app/api-reference/turbopack
- **Config Reference**: https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack

### Status in Next.js 15.5
- **Development**: Stable (default in 15.0+)
- **Production Builds**: Beta (available with `--turbopack` flag)

### Enabling Turbopack

**Development (Automatic):**
```json
// package.json
{
  "scripts": {
    "dev": "next dev --turbopack"
  }
}
```

**Production Builds (Beta):**
```json
// package.json
{
  "scripts": {
    "build": "next build --turbopack"
  }
}
```

### Configuration in next.config.ts

**Migration from Next.js 15.2 and earlier:**
```typescript
// OLD (experimental)
const config: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

// NEW (15.3+)
const config: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};
```

### Performance Characteristics

**Production Metrics** (from Vercel's rollout to vercel.com, v0.app, nextjs.org):
- Similar or smaller JavaScript/CSS bundles
- Fewer network requests
- Comparable or better Core Web Vitals (FCP, LCP, TTFB)
- Battle-tested with 1.2+ billion requests

**Current Limitations:**
- On smaller machines/projects: marginal improvements due to Webpack's persistent cache
- Persistent caching for Turbopack in development (coming soon)

### Recommendation
- **Development**: Use Turbopack (default, stable)
- **Production**: Try Turbopack builds if you've adopted it in development
- **Small Projects**: May see neutral improvements until persistent caching arrives

---

# 2. Appwrite

## Overview
Appwrite is a self-hosted Backend-as-a-Service (BaaS) platform for web, mobile, and flutter developers.

**Note**: Appwrite is not currently installed in this project. Below is documentation for when you integrate it.

### Official Documentation
- **Main Docs**: https://appwrite.io/docs
- **Multi-Tenancy Guide**: https://appwrite.io/docs/products/auth/multi-tenancy
- **Teams API**: https://appwrite.io/docs/server/teams
- **Database Reference**: https://appwrite.io/docs/references/cloud/client-web/databases
- **Storage Reference**: https://appwrite.io/docs/references/cloud/client-web/storage

---

## 2.1 Teams API for Multi-Tenancy

### Documentation
- **Teams Guide**: https://appwrite.io/docs/products/auth/teams
- **Multi-Tenancy Pattern**: https://appwrite.io/docs/products/auth/multi-tenancy

### Multi-Tenancy Architecture with Teams

Appwrite uses Teams as the foundation for multi-tenant applications with built-in data isolation.

**Key Concepts:**
1. **One Team per Tenant**: Create a dedicated team for each tenant
2. **User Memberships**: Invite users to teams with role-based access
3. **Team-Based Permissions**: Control access to resources using `Role.team()`

### Implementation Pattern

```typescript
// 1. Create a new tenant (team)
import { Client, Teams, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('[PROJECT_ID]');

const teams = new Teams(client);
const databases = new Databases(client);

async function createTenant(tenantName: string, ownerId: string) {
  // Create team for tenant
  const team = await teams.create(
    'unique()', // Team ID (auto-generated)
    tenantName  // Team name
  );

  // Create tenant metadata in database
  await databases.createDocument(
    'tenants-db',
    'tenants',
    'unique()',
    {
      teamId: team.$id,
      name: tenantName,
      subdomain: tenantName.toLowerCase().replace(/\s+/g, '-'),
      ownerId,
      createdAt: new Date().toISOString(),
    },
    [
      // Permissions: Only team members can read
      `read("team:${team.$id}")`,
      // Only team owner can write
      `write("team:${team.$id}", ["owner"])`,
    ]
  );

  return team;
}

// 2. Add users to tenant
async function addUserToTenant(teamId: string, email: string, roles: string[]) {
  const membership = await teams.createMembership(
    teamId,
    roles,           // ['admin', 'member', 'viewer']
    email
  );

  return membership;
}

// 3. Query tenant-scoped data
async function getTenantDocuments(teamId: string) {
  const documents = await databases.listDocuments(
    'main-db',
    'documents',
    [
      // Query only documents belonging to this team
      Query.equal('teamId', teamId)
    ]
  );

  return documents;
}
```

### Permission Patterns

**Grant access to all team members:**
```typescript
const permissions = [
  `read("team:${teamId}")`,
  `write("team:${teamId}")`,
];
```

**Grant access to specific roles:**
```typescript
const permissions = [
  `read("team:${teamId}")`,
  `write("team:${teamId}", ["owner", "admin"])`,
];
```

**Individual user permissions:**
```typescript
const permissions = [
  `read("user:${userId}")`,
  `write("user:${userId}")`,
];
```

---

## 2.2 Database Collections and Queries

### Documentation
- **Database Overview**: https://appwrite.io/docs/products/databases
- **Documents**: https://appwrite.io/docs/products/databases/documents
- **Permissions**: https://appwrite.io/docs/products/databases/permissions

### Permission Models

Appwrite offers two permission models:

#### 1. Collection-Level Permissions
Apply to every document in the collection. If a user has read/create/update/delete at the collection level, they can access ALL documents.

```typescript
// Set at collection creation
await databases.createCollection(
  'main-db',
  'public-posts',
  'Public Posts',
  [
    // Anyone can read
    'read("any")',
    // Only authenticated users can create
    'create("users")',
  ]
);
```

#### 2. Document-Level Permissions
Grant access to individual documents. More flexible for multi-tenant scenarios.

```typescript
// Set per document
await databases.createDocument(
  'main-db',
  'invoices',
  'unique()',
  {
    tenantId: teamId,
    amount: 1000,
    status: 'pending',
  },
  [
    // Only this team can read/write
    `read("team:${teamId}")`,
    `write("team:${teamId}", ["owner", "admin"])`,
  ]
);
```

### Query Patterns

**Basic Queries:**
```typescript
import { Query } from 'appwrite';

// Equal
const result = await databases.listDocuments(
  'db',
  'collection',
  [Query.equal('status', 'active')]
);

// Greater than
const recent = await databases.listDocuments(
  'db',
  'collection',
  [Query.greaterThan('createdAt', '2025-01-01')]
);

// Combine multiple queries (max 100)
const filtered = await databases.listDocuments(
  'db',
  'collection',
  [
    Query.equal('tenantId', teamId),
    Query.equal('status', 'published'),
    Query.orderDesc('createdAt'),
    Query.limit(25),
  ]
);
```

**Tenant-Scoped Query Pattern:**
```typescript
async function getTeamDocuments(
  teamId: string,
  filters: Record<string, any> = {}
) {
  const queries = [
    Query.equal('teamId', teamId), // Always filter by tenant
  ];

  // Add additional filters
  Object.entries(filters).forEach(([key, value]) => {
    queries.push(Query.equal(key, value));
  });

  return databases.listDocuments('db', 'collection', queries);
}
```

### Constraints
- Maximum 100 queries per request
- Each query maximum 4096 characters

---

## 2.3 Storage Buckets and File Management

### Documentation
- **Storage Overview**: https://appwrite.io/docs/products/storage
- **Buckets**: https://appwrite.io/docs/products/storage/buckets
- **API Reference**: https://appwrite.io/docs/references/cloud/client-web/storage

### Buckets Overview
Storage buckets are groups of files, similar to tables in Appwrite Databases.

**Bucket Configuration Options:**
- **Encryption**: Enable for files <20MB
- **Compression**: gzip or zstd algorithms
- **File Size Limits**: Prevent abuse
- **File Extensions**: Whitelist allowed types (max 100)

### Creating Buckets

```typescript
import { Storage } from 'appwrite';

const storage = new Storage(client);

const bucket = await storage.createBucket(
  'tenant-uploads',
  'Tenant File Uploads',
  [
    // Bucket-level permissions
    'read("any")',                    // Anyone can read files
    'create("users")',                // Auth users can upload
    'update("users")',                // Auth users can update
    'delete("users")',                // Auth users can delete
  ],
  false,                              // fileSecurity (true for per-file permissions)
  true,                               // enabled
  20000000,                           // maxFileSize (20MB)
  ['jpg', 'png', 'pdf', 'docx'],     // allowedFileExtensions
  'none',                             // compression
  false,                              // encryption
  false                               // antivirus
);
```

### File Upload Pattern

**Multi-Tenant File Upload:**
```typescript
async function uploadTenantFile(
  tenantId: string,
  file: File,
  userId: string
) {
  const fileId = 'unique()';

  // Upload file
  const result = await storage.createFile(
    'tenant-uploads',
    fileId,
    file,
    [
      // File-level permissions (if fileSecurity enabled)
      `read("team:${tenantId}")`,
      `write("user:${userId}")`,
    ]
  );

  // Store metadata in database
  await databases.createDocument(
    'main-db',
    'files',
    'unique()',
    {
      fileId: result.$id,
      tenantId,
      uploadedBy: userId,
      fileName: file.name,
      mimeType: result.mimeType,
      sizeBytes: result.sizeOriginal,
      uploadedAt: new Date().toISOString(),
    },
    [
      `read("team:${tenantId}")`,
      `write("team:${tenantId}", ["owner", "admin"])`,
    ]
  );

  return result;
}
```

### Large File Upload (Chunking)

Files >5MB should be uploaded in chunks. SDKs handle this automatically:

```typescript
// SDK automatically handles chunking for large files
const file = document.getElementById('file').files[0];

const upload = await storage.createFile(
  'bucket-id',
  'unique()',
  file,
  permissions,
  // Optional progress callback
  (progress) => {
    console.log(`Upload: ${progress.chunksUploaded}/${progress.chunksTotal}`);
  }
);
```

### File Download/Preview

```typescript
// Get file for download
const fileUrl = storage.getFileDownload('bucket-id', 'file-id');

// Get file preview (images only)
const previewUrl = storage.getFilePreview(
  'bucket-id',
  'file-id',
  400,        // width
  400,        // height
  'center',   // gravity
  80,         // quality
  0,          // borderWidth
  '',         // borderColor
  0,          // borderRadius
  1,          // opacity
  0,          // rotation
  'ffffff',   // background
  'jpg'       // output format
);

// Use in img tag
<img src={previewUrl} alt="File preview" />
```

---

## 2.4 Self-Hosting on Custom Domains

### Documentation
- **Custom Domains**: https://appwrite.io/docs/advanced/platform/custom-domains
- **Sites (Static Hosting)**: https://appwrite.io/docs/advanced/self-hosting/sites

### API Custom Domain Setup

**Purpose**: Use your own domain (e.g., `api.yourdomain.com`) as Appwrite API endpoint.

**Benefits:**
- Cookies are no longer treated as 3rd-party
- Better session security
- Consistent domain for your app

**Setup Steps:**

1. Navigate to Appwrite Console → Project → Settings → Custom Domains
2. Click "Create domain"
3. Enter your custom domain (e.g., `api.yourdomain.com`)
4. Copy the provided CNAME record
5. Add CNAME record to your DNS provider:
   ```
   CNAME   api.yourdomain.com   your-appwrite-instance.com
   ```
6. Wait for DNS propagation
7. Appwrite will automatically verify and issue SSL certificate

### Self-Hosted Sites with Apex Domain

For static site hosting on self-hosted Appwrite:

**Environment Variables (`.env`):**
```bash
# Required for apex domain support
_APP_DOMAIN_TARGET_A=203.0.113.1        # Your server's IPv4
# OR
_APP_DOMAIN_TARGET_AAAA=2001:db8::1     # Your server's IPv6

# Apex domain
_APP_DOMAIN=yourdomain.com
```

**DNS Configuration:**
```
# A record for apex domain
A       yourdomain.com          203.0.113.1

# Wildcard for subdomains
A       *.yourdomain.com        203.0.113.1
```

### SSL Certificates for Custom Domains

Appwrite doesn't handle wildcard certificates automatically. Generate using Appwrite CLI:

```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login
appwrite login

# Generate SSL certificate
appwrite ssl --domain "*.yourdomain.com"
```

### Function Custom Domains

For custom domains on Appwrite Functions:

**DNS Setup:**
```
# Wildcard for functions
CNAME   *.functions.example.com   your-appwrite-instance.com
```

**Configuration:**
Environment variable in your Appwrite instance:
```bash
_APP_DOMAIN_FUNCTIONS=functions.example.com
```

---

# 3. TypeScript 5

## Version Information
- **Current Version**: TypeScript 5.x
- **Project Config**: Strict mode enabled

### Official Documentation
- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **Handbook**: https://www.typescriptlang.org/docs/handbook/intro.html

---

## 3.1 Strict Mode Patterns

### Current Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    // ... other options
  }
}
```

### What Strict Mode Enables

The `strict` flag enables:
- `strictNullChecks`: Prevents null/undefined issues
- `strictFunctionTypes`: Stricter function type checking
- `strictBindCallApply`: Type-checks bind/call/apply
- `strictPropertyInitialization`: Class properties must be initialized
- `noImplicitThis`: Flags implicit `any` on `this`
- `noImplicitAny`: Requires explicit types, no implicit `any`
- `alwaysStrict`: Emits "use strict" in JavaScript

### Best Practices for 2025

#### 1. Always Use Strict Mode for New Projects
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,  // Additional safety
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### 2. Null Safety Patterns
```typescript
// Bad
function getUser(id: string) {
  const user = users.find(u => u.id === id);
  return user.name; // Error: Object is possibly 'undefined'
}

// Good
function getUser(id: string): string | null {
  const user = users.find(u => u.id === id);
  return user?.name ?? null;
}

// Better (with type guard)
function getUser(id: string): string {
  const user = users.find(u => u.id === id);
  if (!user) {
    throw new Error('User not found');
  }
  return user.name;
}
```

#### 3. Strict Property Initialization
```typescript
// Bad
class TenantService {
  tenantId: string; // Error: Property has no initializer

  async initialize() {
    this.tenantId = await fetchTenantId();
  }
}

// Good - Use definite assignment
class TenantService {
  tenantId!: string; // OK with ! (use sparingly)

  async initialize() {
    this.tenantId = await fetchTenantId();
  }
}

// Better - Initialize in constructor
class TenantService {
  constructor(public readonly tenantId: string) {}
}
```

#### 4. No Implicit Any
```typescript
// Bad
function processData(data) { // Error: Parameter 'data' implicitly has 'any'
  return data.value;
}

// Good
interface Data {
  value: string;
}

function processData(data: Data): string {
  return data.value;
}
```

---

## 3.2 Type Safety for Multi-Tenant Contexts

### Tenant Context Type Definitions

```typescript
// types/tenant.ts

/**
 * Tenant branding configuration
 */
export interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  favicon: string;
  customCss?: string;
}

/**
 * Tenant configuration
 */
export interface Tenant {
  id: string;
  subdomain: string;
  name: string;
  branding: TenantBranding;
  features: TenantFeatures;
  subscription: TenantSubscription;
  createdAt: string;
  updatedAt: string;
}

export interface TenantFeatures {
  analytics: boolean;
  customDomain: boolean;
  apiAccess: boolean;
  teamSize: number;
}

export interface TenantSubscription {
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  currentPeriodEnd: string;
}

/**
 * Tenant context for accessing current tenant data
 */
export interface TenantContext {
  tenant: Tenant;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Type guard to check if a value is a valid tenant
 */
export function isTenant(value: unknown): value is Tenant {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'subdomain' in value &&
    typeof (value as any).id === 'string' &&
    typeof (value as any).subdomain === 'string'
  );
}
```

### Tenant-Scoped Data Types

```typescript
// types/tenant-data.ts

/**
 * Base interface for tenant-scoped resources
 */
export interface TenantResource {
  id: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Branded type to ensure tenant ID is validated
 */
export type TenantId = string & { readonly __brand: 'TenantId' };

export function createTenantId(id: string): TenantId {
  // Validation logic
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid tenant ID');
  }
  return id as TenantId;
}

/**
 * Scoped query builder with type safety
 */
export interface TenantScopedQuery<T extends TenantResource> {
  tenantId: TenantId;
  filters?: Partial<Omit<T, keyof TenantResource>>;
  pagination?: {
    page: number;
    limit: number;
  };
  sort?: {
    field: keyof T;
    order: 'asc' | 'desc';
  };
}

/**
 * Example: User scoped to tenant
 */
export interface TenantUser extends TenantResource {
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: string[];
}

/**
 * Type-safe query builder
 */
export function buildTenantQuery<T extends TenantResource>(
  query: TenantScopedQuery<T>
): T[] {
  // Implementation with type safety
  return [];
}
```

### Discriminated Unions for Tenant States

```typescript
// types/tenant-state.ts

export type TenantLoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Tenant }
  | { status: 'error'; error: Error };

/**
 * Type-safe state handler
 */
export function handleTenantState(state: TenantLoadingState) {
  switch (state.status) {
    case 'idle':
      return <div>Not loaded</div>;
    case 'loading':
      return <div>Loading...</div>;
    case 'success':
      // TypeScript knows state.data exists here
      return <div>{state.data.name}</div>;
    case 'error':
      // TypeScript knows state.error exists here
      return <div>Error: {state.error.message}</div>;
  }
}
```

### Template Literal Types for Type-Safe Permissions

```typescript
// types/permissions.ts

export type Permission =
  | 'tenant:read'
  | 'tenant:write'
  | 'user:read'
  | 'user:write'
  | 'user:delete'
  | 'settings:read'
  | 'settings:write'
  | 'billing:read'
  | 'billing:write';

export type Resource = 'tenant' | 'user' | 'settings' | 'billing';
export type Action = 'read' | 'write' | 'delete';

// Type-safe permission builder
export type BuildPermission<
  R extends Resource,
  A extends Action
> = `${R}:${A}`;

// Usage
const userReadPermission: BuildPermission<'user', 'read'> = 'user:read'; // OK
// const invalid: BuildPermission<'user', 'read'> = 'user:invalid'; // Error

/**
 * Check if user has permission
 */
export function hasPermission(
  userPermissions: Permission[],
  required: Permission
): boolean {
  return userPermissions.includes(required);
}
```

---

## 3.3 Server vs Client Type Definitions

### Next.js 15 TypeScript Improvements

Next.js 15.5 includes:
- **Typed Routes**: Compile-time type safety for routes (stable)
- **Automatic Type Generation**: PageProps, LayoutProps, RouteContext
- **Route Export Validation**: Using TypeScript's `satisfies` operator

### Enabling Typed Routes

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: {
    typedRoutes: true, // Now stable in 15.5
  },
};

export default config;
```

### Server Component Types

```typescript
// app/tenant/[subdomain]/page.tsx (Server Component)

import { Tenant } from '@/types/tenant';

// Next.js 15.5 auto-generates PageProps
interface PageProps {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TenantPage(props: PageProps) {
  // Params and searchParams are now Promises (Next.js 15 change)
  const params = await props.params;
  const searchParams = await props.searchParams;

  const tenant = await getTenant(params.subdomain);

  return (
    <div>
      <h1>{tenant.name}</h1>
    </div>
  );
}

// Type-safe metadata generation
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const tenant = await getTenant(params.subdomain);

  return {
    title: tenant.name,
    description: `Welcome to ${tenant.name}`,
  };
}
```

### Layout Types

```typescript
// app/tenant/[subdomain]/layout.tsx

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

export default async function TenantLayout(props: LayoutProps) {
  const params = await props.params;
  const tenant = await getTenant(params.subdomain);

  return (
    <div style={{ '--primary-color': tenant.branding.primaryColor } as React.CSSProperties}>
      {props.children}
    </div>
  );
}
```

### Client Component Types

```typescript
// components/TenantDashboard.tsx
'use client';

import { useState } from 'react';
import type { Tenant } from '@/types/tenant';

interface TenantDashboardProps {
  initialTenant: Tenant; // Server-to-client data flow
}

export function TenantDashboard({ initialTenant }: TenantDashboardProps) {
  const [tenant, setTenant] = useState<Tenant>(initialTenant);

  // Client-side logic
  return <div>{tenant.name}</div>;
}
```

### Server Actions Types

```typescript
// app/actions/tenant.ts
'use server';

import { z } from 'zod';
import type { Tenant } from '@/types/tenant';

const updateTenantSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  branding: z.object({
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  }),
});

type UpdateTenantInput = z.infer<typeof updateTenantSchema>;

export async function updateTenant(
  data: UpdateTenantInput
): Promise<{ success: true; tenant: Tenant } | { success: false; error: string }> {
  const result = updateTenantSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: 'Invalid input' };
  }

  // Update tenant
  const tenant = await db.tenant.update({
    where: { id: result.data.tenantId },
    data: result.data,
  });

  return { success: true, tenant };
}
```

### Shared Types Pattern

```typescript
// types/api.ts - Shared between server and client

/**
 * API response wrapper with discriminated union
 */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Type guard
 */
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is { success: true; data: T } {
  return response.success === true;
}

/**
 * Usage in Server Action
 */
export async function getTenantsAction(): Promise<ApiResponse<Tenant[]>> {
  try {
    const tenants = await db.tenant.findMany();
    return { success: true, data: tenants };
  } catch (error) {
    return { success: false, error: 'Failed to fetch tenants' };
  }
}

/**
 * Usage in Client Component
 */
'use client';

async function fetchTenants() {
  const response = await getTenantsAction();

  if (isApiSuccess(response)) {
    // TypeScript knows response.data exists
    console.log(response.data);
  } else {
    // TypeScript knows response.error exists
    console.error(response.error);
  }
}
```

### Route Context Types (Auto-Generated in Next.js 15.5)

```typescript
// Automatically available (no import needed)
// .next/types/app/tenant/[subdomain]/page.ts

// RouteContext for the current route
type RouteContext = {
  params: { subdomain: string };
};

// Use in generateStaticParams
export async function generateStaticParams(): Promise<RouteContext['params'][]> {
  const tenants = await db.tenant.findMany();

  return tenants.map(tenant => ({
    subdomain: tenant.subdomain,
  }));
}
```

---

# 4. Tailwind CSS 4.1.14

## Version Information
- **Installed Version**: 4.1.14
- **Release Date**: 2025
- **Status**: Stable

### Official Documentation
- **Main Docs**: https://tailwindcss.com/docs
- **v4 Announcement**: https://tailwindcss.com/blog/tailwindcss-v4
- **Theme Variables**: https://tailwindcss.com/docs/theme
- **Installation**: https://tailwindcss.com/docs/installation/using-postcss

---

## 4.1 Dynamic Theming Patterns

### Overview
Tailwind CSS v4 exposes all design tokens as native CSS variables, enabling true dynamic theming.

### Key Changes from v3
- No more `tailwind.config.js` (deprecated)
- CSS-first configuration with `@theme` directive
- Native CSS variables for all design tokens
- Built on `@property`, cascade layers, and `color-mix()`

---

### The @theme Directive

**Define themes in CSS:**
```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Define base colors */
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --color-accent: #f59e0b;

  /* Define spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;

  /* Define breakpoints */
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
}
```

**Usage in HTML:**
```html
<div class="bg-primary text-white">
  Primary themed content
</div>
```

---

### Multi-Theme Pattern with Data Attributes

**Define multiple themes:**
```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Default theme */
  --color-primary: #3b82f6;
  --color-background: #ffffff;
  --color-text: #1f2937;
}

@layer base {
  /* Ocean theme */
  [data-theme='ocean'] {
    --color-primary: #aab9ff;
    --color-background: #0c1929;
    --color-text: #e5e7eb;
  }

  /* Rainforest theme */
  [data-theme='rainforest'] {
    --color-primary: #56d0a0;
    --color-background: #0a1f1a;
    --color-text: #d1fae5;
  }

  /* Sunset theme */
  [data-theme='sunset'] {
    --color-primary: #ff6b6b;
    --color-background: #2d1b1b;
    --color-text: #ffe0e0;
  }
}
```

**Client-side theme switcher:**
```typescript
// components/ThemeProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'ocean' | 'rainforest' | 'sunset';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'ocean'
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

// components/ThemeSwitcher.tsx
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
      <option value="ocean">Ocean</option>
      <option value="rainforest">Rainforest</option>
      <option value="sunset">Sunset</option>
    </select>
  );
}
```

---

### Light/Dark Mode Pattern

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-background: #ffffff;
  --color-foreground: #000000;
}

@layer base {
  .dark {
    --color-background: #0a0a0a;
    --color-foreground: #ededed;
  }
}
```

**Dark mode toggle:**
```typescript
// components/DarkModeToggle.tsx
'use client';

import { useEffect, useState } from 'react';

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <button onClick={() => setIsDark(!isDark)}>
      {isDark ? 'Light' : 'Dark'} Mode
    </button>
  );
}
```

---

### Multi-Tenant Theming Pattern

**Dynamic tenant branding:**
```typescript
// app/tenant/[subdomain]/layout.tsx
import { getTenant } from '@/lib/tenant';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const tenant = await getTenant(subdomain);

  return (
    <div
      style={{
        '--color-primary': tenant.branding.primaryColor,
        '--color-secondary': tenant.branding.secondaryColor,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
```

**Define tenant-aware theme:**
```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Default fallback colors */
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
}

/* Tenant-specific colors are injected via inline styles */
```

---

## 4.2 CSS Custom Properties

### How Tailwind v4 Uses CSS Variables

All theme variables become CSS custom properties:

```css
@theme {
  --color-brand: #ff6b6b;
  --font-heading: 'Inter', sans-serif;
}

/* Compiled to: */
:root {
  --color-brand: #ff6b6b;
  --font-heading: 'Inter', sans-serif;
}
```

**Access from JavaScript:**
```typescript
// Read CSS variable
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-primary');

// Set CSS variable
document.documentElement.style.setProperty('--color-primary', '#ff0000');
```

---

### Custom Utilities with CSS Variables

```css
@theme {
  --spacing-content: 2rem;
}

@layer utilities {
  .content-spacing {
    padding-left: var(--spacing-content);
    padding-right: var(--spacing-content);
  }
}
```

---

### Responsive Theme Variables

```css
@theme {
  --spacing-container: 1rem;
}

@layer base {
  @media (min-width: 768px) {
    :root {
      --spacing-container: 2rem;
    }
  }

  @media (min-width: 1024px) {
    :root {
      --spacing-container: 4rem;
    }
  }
}
```

---

## 4.3 PostCSS Configuration with Next.js 15

### Installation

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

### PostCSS Configuration

**Create `postcss.config.mjs`:**
```javascript
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

**Or `postcss.config.js`:**
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

---

### CSS Entry Point

**Update `app/globals.css`:**
```css
/* app/globals.css */
@import "tailwindcss";

/* Your custom theme */
@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
}

/* Custom utilities */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

---

### Import in Layout

```typescript
// app/layout.tsx
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

---

### Key Differences from Tailwind v3

| Feature | Tailwind v3 | Tailwind v4 |
|---------|-------------|-------------|
| Config file | `tailwind.config.js` | No config file (CSS-first) |
| PostCSS plugin | `tailwindcss` | `@tailwindcss/postcss` |
| Theme definition | JavaScript object | `@theme` directive in CSS |
| Custom colors | `extend.colors` in config | CSS variables in `@theme` |
| Installation | `npx tailwindcss init` | Import in CSS directly |

---

### Compatibility

**Browser Requirements:**
- Safari 16.4+
- Chrome 111+
- Firefox 128+

**For older browsers:** Stick with Tailwind v3 until browser support requirements change.

---

# 5. shadcn/ui

## Overview
shadcn/ui is a collection of reusable React components built on Radix UI primitives and styled with Tailwind CSS.

**Key Philosophy:** Components are copied into your project (not installed as dependency), giving you full ownership and customization control.

### Official Documentation
- **Main Docs**: https://ui.shadcn.com/docs
- **Next.js Installation**: https://ui.shadcn.com/docs/installation/next
- **Tailwind v4 Guide**: https://ui.shadcn.com/docs/tailwind-v4
- **Components**: https://ui.shadcn.com/docs/components

---

## 5.1 Installation with Next.js 15

### Prerequisites
- Next.js 15.x
- React 19.x
- Tailwind CSS 4.x
- TypeScript (recommended)

---

### Installation Steps

**1. Initialize shadcn/ui:**
```bash
npx shadcn@latest init
```

**Important for Next.js 15 + React 19:**
- npm requires `--legacy-peer-deps` flag
- pnpm, yarn, and bun handle dependencies automatically

**With npm:**
```bash
npx --legacy-peer-deps shadcn@latest init
```

**With pnpm (recommended):**
```bash
pnpx shadcn@latest init
```

---

**2. Follow the prompts:**
```
✔ Would you like to use TypeScript (recommended)? … yes
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Where is your global CSS file? … src/app/globals.css
✔ Would you like to use CSS variables for colors? … yes
✔ Are you using a custom tailwind prefix? … no
✔ Where is your tailwind.config.js located? … (leave empty for v4)
✔ Configure the import alias for components: … @/components
✔ Configure the import alias for utils: … @/lib/utils
✔ Are you using React Server Components? … yes
```

---

**3. Configuration Files Generated:**

`components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

---

**4. Install Components:**
```bash
# Individual components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog

# Multiple at once
npx shadcn@latest add button card dialog input

# All components (not recommended)
npx shadcn@latest add
```

---

### Tailwind CSS v4 Compatibility

shadcn/ui officially supports Tailwind v4 via the canary release:

**Key Changes for v4:**
- No `tailwind.config.js` needed
- Uses CSS variables via `@theme` directive
- `tw-animate-css` replaces `tailwindcss-animate`

**Updated globals.css structure:**
```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Your theme variables */
  --color-primary: #3b82f6;
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... more variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode variables */
  }
}
```

---

## 5.2 Component Customization

### Philosophy
Components live in your `components/ui` directory. You own the code and can modify freely.

---

### Basic Customization Example

**Button component** (`components/ui/button.tsx`):
```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        // Add custom variant
        tenant: "bg-[--color-primary] text-white hover:opacity-90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        // Add custom size
        xl: "h-14 rounded-md px-12 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

**Usage:**
```typescript
import { Button } from "@/components/ui/button"

export function Example() {
  return (
    <>
      <Button variant="default">Default</Button>
      <Button variant="tenant">Tenant Branded</Button>
      <Button size="xl">Large Button</Button>
    </>
  )
}
```

---

### Theme Customization for Multi-Tenancy

**Global theme setup:**
```css
/* app/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    /* Tenant-specific (overridden per tenant) */
    --color-primary: 221 83% 53%;
    --color-secondary: 262 83% 58%;
  }
}
```

**Tenant layout with dynamic theme:**
```typescript
// app/tenant/[subdomain]/layout.tsx
import { getTenant } from '@/lib/tenant';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const tenant = await getTenant(subdomain);

  // Convert hex to HSL for shadcn/ui
  const primaryHsl = hexToHsl(tenant.branding.primaryColor);

  return (
    <div
      style={{
        '--color-primary': primaryHsl,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

function hexToHsl(hex: string): string {
  // Conversion logic
  // Returns: "221 83% 53%"
}
```

---

### Creating Custom Components

**Example: TenantCard component**
```typescript
// components/ui/tenant-card.tsx
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TenantCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  primaryColor?: string
}

export function TenantCard({
  title,
  description,
  primaryColor,
  className,
  children,
  ...props
}: TenantCardProps) {
  return (
    <Card
      className={cn("border-2", className)}
      style={{
        borderColor: primaryColor || 'hsl(var(--primary))',
      }}
      {...props}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
```

---

## 5.3 TypeScript Integration

### Type Safety Out of the Box

shadcn/ui components are written in TypeScript with full type safety.

**Component props are fully typed:**
```typescript
import { Button } from "@/components/ui/button"

// TypeScript knows all valid props
<Button
  variant="default"    // Autocomplete: "default" | "destructive" | "outline" | ...
  size="lg"            // Autocomplete: "default" | "sm" | "lg"
  onClick={(e) => {}}  // Typed event handler
  disabled={false}
/>
```

---

### Extending Component Types

**Custom variant with type safety:**
```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        default: "...",
        // Add custom variant
        tenant: "bg-[--color-primary] text-white hover:opacity-90",
      },
      size: {
        default: "...",
        // Add custom size
        xl: "h-14 rounded-md px-12 text-lg",
      },
    },
  }
)

// TypeScript automatically infers the new types
type ButtonVariant = VariantProps<typeof buttonVariants>['variant']
// "default" | "destructive" | "outline" | "tenant"
```

---

### Using with Server Actions

```typescript
// app/actions/tenant.ts
'use server';

import { z } from 'zod';

const tenantFormSchema = z.object({
  name: z.string().min(1),
  subdomain: z.string().regex(/^[a-z0-9-]+$/),
});

export type TenantFormData = z.infer<typeof tenantFormSchema>;

export async function createTenant(data: TenantFormData) {
  const result = tenantFormSchema.safeParse(data);

  if (!result.success) {
    return { error: result.error.flatten() };
  }

  // Create tenant
  return { success: true };
}

// components/CreateTenantForm.tsx
'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createTenant, type TenantFormData } from '@/app/actions/tenant';

export function CreateTenantForm() {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const data: TenantFormData = {
      name: formData.get('name') as string,
      subdomain: formData.get('subdomain') as string,
    };

    startTransition(async () => {
      const result = await createTenant(data);
      // Handle result
    });
  }

  return (
    <form action={handleSubmit}>
      <Input name="name" placeholder="Tenant name" />
      <Input name="subdomain" placeholder="subdomain" />
      <Button type="submit" disabled={isPending}>
        Create Tenant
      </Button>
    </form>
  );
}
```

---

### Utility Types

**The `cn` utility** (from `lib/utils.ts`):
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage: Merge Tailwind classes intelligently
<div className={cn(
  "bg-primary text-white",
  isActive && "bg-secondary",
  className
)} />
```

---

### Opting Out of TypeScript

**JavaScript version available** via components.json:
```json
{
  "tsx": false
}
```

Components will be generated as `.jsx` instead of `.tsx`.

---

## Key Resources for shadcn/ui

- **Official Docs**: https://ui.shadcn.com/docs
- **Component Library**: https://ui.shadcn.com/docs/components
- **Tailwind v4 Migration**: https://ui.shadcn.com/docs/tailwind-v4
- **Community Blocks**: https://github.com/birobirobiro/awesome-shadcn-ui

---

# Breaking Changes & Migration Guides

## Next.js 15 Breaking Changes

### Official Migration Guide
https://nextjs.org/docs/app/guides/upgrading/version-15

### Key Breaking Changes

#### 1. Async Request APIs (Most Important)
```typescript
// BEFORE (Next.js 14)
import { cookies, headers } from 'next/headers';

export default function Page() {
  const cookieStore = cookies();
  const headersList = headers();
}

// AFTER (Next.js 15)
import { cookies, headers } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const headersList = await headers();
}
```

**Also affects:**
- `draftMode()`
- `searchParams` prop
- `params` prop

#### 2. Caching Defaults Changed
- **Fetch requests**: Now `no-store` by default (was cached)
- **GET Route Handlers**: Now uncached by default
- **Page components**: Now uncached by default

**Migration:**
```typescript
// To opt-in to caching
export const dynamic = 'force-static';

// Or per-request
fetch('https://...', { cache: 'force-cache' });
```

#### 3. React 19 Required for App Router
App Router requires React 19, but Pages Router supports React 18.

#### 4. NextRequest API Changes
Removed properties:
- `geo` (use hosting provider's solution)
- `ip` (use hosting provider's solution)

### Automated Migration

```bash
# Upgrade to Next.js 15
npx @next/codemod@latest upgrade latest

# Specific codemods
npx @next/codemod@latest next-async-request-api
```

---

## Tailwind CSS 4 Breaking Changes

### Official Upgrade Guide
https://tailwindcss.com/docs/upgrade-guide

### Key Changes

#### 1. No More tailwind.config.js
Configuration moved to CSS via `@theme` directive.

#### 2. New PostCSS Plugin
```javascript
// OLD
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

// NEW
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

#### 3. Import Statement Changed
```css
/* OLD */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* NEW */
@import "tailwindcss";
```

#### 4. tailwindcss-animate Deprecated
Now use `tw-animate-css`:
```bash
npm uninstall tailwindcss-animate
npm install tw-animate-css
```

---

# Version-Specific Constraints

## Current Project Versions
- **Next.js**: 15.5.5 (Stable)
- **React**: 19.1.0 (Stable)
- **TypeScript**: 5.x (Stable)
- **Tailwind CSS**: 4.1.14 (Stable)

## Compatibility Matrix

| Technology | Version | Status | Notes |
|------------|---------|--------|-------|
| Next.js | 15.5.5 | Stable | Turbopack production builds in beta |
| React | 19.1.0 | Stable | Required for Next.js 15 App Router |
| TypeScript | 5.x | Stable | Strict mode enabled |
| Tailwind CSS | 4.1.14 | Stable | Requires Safari 16.4+, Chrome 111+, Firefox 128+ |
| shadcn/ui | Latest | Canary | Use canary for Tailwind v4 + React 19 |
| Appwrite | Latest | N/A | Not yet installed |

---

# Additional Resources

## Next.js
- **Examples Repository**: https://github.com/vercel/next.js/tree/canary/examples
- **Vercel Platforms (Multi-Tenant)**: https://github.com/vercel/platforms
- **Learn Next.js**: https://nextjs.org/learn

## Appwrite
- **Community**: https://appwrite.io/community
- **GitHub Issues**: https://github.com/appwrite/appwrite/issues
- **Discord**: https://appwrite.io/discord

## TypeScript
- **Handbook**: https://www.typescriptlang.org/docs/handbook/intro.html
- **Playground**: https://www.typescriptlang.org/play

## Tailwind CSS
- **Component Examples**: https://tailwindui.com/components
- **Play CDN**: https://tailwindcss.com/docs/installation/play-cdn

## shadcn/ui
- **Component Blocks**: https://ui.shadcn.com/blocks
- **Themes**: https://ui.shadcn.com/themes
- **Community Resources**: https://github.com/birobirobiro/awesome-shadcn-ui

---

# Implementation Checklist for Multi-Tenant SaaS

## Phase 1: Foundation
- [ ] Set up Next.js 15 project with Turbopack
- [ ] Configure TypeScript strict mode
- [ ] Install and configure Tailwind CSS 4
- [ ] Set up shadcn/ui with canary release
- [ ] Create base type definitions for tenants

## Phase 2: Multi-Tenancy Architecture
- [ ] Implement middleware for subdomain routing
- [ ] Create tenant context provider
- [ ] Set up tenant database schema (with Appwrite Teams)
- [ ] Implement tenant data isolation
- [ ] Create tenant onboarding flow

## Phase 3: Dynamic Theming
- [ ] Set up Tailwind CSS theming with CSS variables
- [ ] Create tenant branding configuration
- [ ] Implement dynamic theme injection per tenant
- [ ] Add theme customization UI
- [ ] Test theme persistence

## Phase 4: Authentication & Authorization
- [ ] Integrate Appwrite Auth
- [ ] Implement team-based permissions
- [ ] Create role-based access control (RBAC)
- [ ] Set up tenant-scoped sessions
- [ ] Add user invitation flow

## Phase 5: Data Management
- [ ] Set up Appwrite database collections
- [ ] Implement tenant-scoped queries
- [ ] Create Server Actions for CRUD operations
- [ ] Add file storage with tenant isolation
- [ ] Implement data backup/export

## Phase 6: Production Readiness
- [ ] Set up custom domain support
- [ ] Configure SSL certificates
- [ ] Implement error monitoring
- [ ] Add analytics tracking
- [ ] Performance optimization
- [ ] Security audit

---

**End of Documentation**
**Last Updated**: October 15, 2025
