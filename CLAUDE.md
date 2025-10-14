# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BelegBoost is a multi-tenant B2B SaaS application for German tax advisors (Steuerberater) and their clients (Mandanten). The platform enables checklist management with document uploads and status tracking via a traffic light system.

**Target Market:** German tax advisory firms (DACH region)
**Tech Stack:** Next.js 15, TypeScript, React 19, Tailwind CSS 4, shadcn/ui, Appwrite (self-hosted)
**Deployment:** Self-hosted on Hetzner Germany for GDPR compliance

### Multi-Tenancy Architecture

- **Domain Structure:**
  - `belegboost.de` → Main landing page + tax advisor registration
  - `[berater-subdomain].belegboost.de` → Tax advisor portal with custom branding
- **Tenant Isolation:** Subdomain-based routing via Next.js middleware with Appwrite Teams API for backend isolation
- **Single Deployment:** One Next.js app serves all tenants dynamically

## Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Production
npm run build           # Build for production with Turbopack
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint checks
```

**Note:** This project uses Turbopack for faster builds.

## High-Level Architecture

### Routing Strategy (Planned)

```
app/
├── (main)/                      # belegboost.de
│   ├── page.tsx                 # Landing/registration
│   ├── impressum/               # Legal imprint (required in Germany)
│   └── datenschutz/             # Privacy policy (GDPR)
│
├── tenants/
│   └── [tenant]/                # [berater].belegboost.de
│       ├── (auth)/
│       │   └── login/           # Tenant-specific login
│       ├── (dashboard)/
│       │   ├── checklists/      # Checklist management
│       │   ├── documents/       # Document library
│       │   ├── clients/         # Client management (advisor only)
│       │   └── einstellungen/   # Settings
│       └── layout.tsx           # Tenant branding wrapper
│
└── middleware.ts                # Subdomain detection & routing
```

### Data Isolation Pattern

**CRITICAL:** All database queries MUST include `tenant_id` filtering to prevent data leakage between tenants.

```typescript
// Example pattern for Data Access Layer (DAL)
export async function getChecklists(tenantId: string) {
  return await databases.listDocuments(
    DATABASE_ID,
    CHECKLISTS_COLLECTION,
    [
      Query.equal('tenant_id', tenantId),  // Always filter by tenant
      Query.orderDesc('created_at')
    ]
  );
}
```

Use a centralized Data Access Layer (`lib/dal/`) to enforce this pattern across all queries.

### Database Schema (Appwrite Collections)

Core collections (to be created):

- `tenants` - Tax advisor firm metadata (subdomain, branding, team_id)
- `users` - User profiles with role (owner|advisor|client)
- `checklists` - Client checklists with status tracking
- `checklist_items` - Individual checklist items with traffic light status (red|yellow|green)
- `documents` - File metadata linked to Appwrite Storage

All collections must have `tenant_id` field with indexes for filtering.

### GDPR & Security Requirements

**Critical Compliance Points:**

1. **Data Hosting:** Self-host Appwrite on Hetzner Germany (never use US/non-EU servers)
2. **Required Legal Pages:** Impressum and Datenschutzerklärung (in German)
3. **User Rights:** Implement data export (JSON + ZIP) and account deletion with 10-year retention for tax documents
4. **Audit Logging:** Log all document uploads/downloads, user logins, data exports/deletions
5. **Security Headers:** Configure CSP, X-Frame-Options, CSRF protection in `next.config.ts`
6. **File Upload Security:**
   - Validate MIME types AND magic bytes (not just extensions)
   - Whitelist: PDF, JPG, PNG, XLSX, DOCX
   - Max file size: 10MB
   - Sanitize filenames before storage
   - Store files in tenant-scoped buckets

### TypeScript Configuration

- **Strict Mode:** Enabled (`strict: true` in tsconfig.json)
- **Path Alias:** `@/*` maps to `./src/*`
- **No `any` Types:** Use proper typing or `unknown` with type guards

### Styling & UI Components

- **Framework:** Tailwind CSS 4 with PostCSS
- **Component Library:** shadcn/ui (to be installed)
- **Fonts:** Geist Sans + Geist Mono (already configured)
- **Theme:** Support dynamic tenant branding via CSS custom properties

### Key Implementation Patterns

**Server Actions:**
Place in `actions/` directory with proper error handling and tenant context validation.

```typescript
// Example pattern
'use server'

import { getTenantContext } from '@/lib/server/tenant';

export async function createChecklist(formData: FormData) {
  const { tenantId, userId, role } = await getTenantContext();

  // Validate role
  if (role !== 'owner' && role !== 'advisor') {
    throw new Error('Unauthorized');
  }

  // Always include tenantId in mutations
  const checklist = await databases.createDocument(
    DATABASE_ID,
    CHECKLISTS_COLLECTION,
    ID.unique(),
    { tenant_id: tenantId, ...data }
  );

  return checklist;
}
```

**Middleware for Subdomain Routing:**
Extract subdomain from hostname and pass to routes via rewrite. Handle localhost and Vercel preview URLs gracefully.

**Component Organization:**
```
components/
├── ui/              # shadcn/ui components
├── checklist/       # Checklist-specific components
├── documents/       # Document upload/management
├── tenant/          # Tenant branding components
└── gdpr/            # Cookie consent, data export UI
```

## Critical Security Reminders

1. **Never commit secrets:** Use `.env.local` (already in .gitignore)
2. **Always validate tenant context:** Check subdomain matches user's tenant before operations
3. **Test tenant isolation:** Write E2E tests to ensure users cannot access other tenants' data
4. **Rate limit auth endpoints:** Prevent brute force attacks
5. **Validate file uploads:** Check both MIME type and file content (magic bytes)

## Appwrite Setup (When Ready)

**Environment Variables Required:**
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://appwrite.belegboost.de
NEXT_PUBLIC_APPWRITE_PROJECT_ID=...
APPWRITE_API_KEY=...  # Server-side only
```

**Collections to Create:**
Follow schema in docs/github-issue-belegboost.md (ERD diagram at line 72-139)

**Storage Buckets:**
- Create one bucket per tenant on registration
- Enable encryption (AES)
- Set file type restrictions in bucket settings

## German Market Specifics

- **Language:** All UI text in German (dates, validation messages, legal pages)
- **Date Format:** DD.MM.YYYY (not US format)
- **Currency:** EUR (€) if displaying prices
- **Legal Requirements:**
  - Impressum with company details
  - Datenschutzerklärung (privacy policy)
  - Cookie consent banner (GDPR-compliant)
  - Verarbeitungsverzeichnis (data processing documentation)

## Code Quality Standards

- **TypeScript:** Strict mode, no `any` types
- **Linting:** Must pass `npm run lint` before commits
- **Naming:** Use German for domain concepts (Mandant, Steuerberater, Beleg) but English for technical code
- **Comments:** Document complex logic, especially tenant isolation patterns
- **Testing:** Write E2E tests for all critical tenant isolation points

## Project Phase Status

**Current Phase:** Foundation (Phase 1)
**Status:** Project initialized with Next.js 15, awaiting Appwrite setup and middleware implementation

See `docs/github-issue-belegboost.md` for complete implementation plan with 7 phases (lines 141-451).

## Important Documentation Files

- `docs/prd.md` - Product requirements (German)
- `docs/github-issue-belegboost.md` - Comprehensive technical spec with architecture, database schema, and implementation phases
- `README.md` - Standard Next.js setup guide

## Multi-Tenant Development Tips

**Local Testing with Subdomains:**
Edit `/etc/hosts` (Mac/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
```
127.0.0.1 belegboost.local
127.0.0.1 test-berater.belegboost.local
127.0.0.1 demo.belegboost.local
```

Access via `http://test-berater.belegboost.local:3000` during development.

**Middleware Pattern:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];

  // Handle localhost
  if (hostname.includes('localhost')) {
    // Extract subdomain from localhost:3000 format if needed
  }

  // Main domain vs tenant subdomain
  if (subdomain === 'belegboost' || !subdomain) {
    return NextResponse.next(); // Main site
  }

  // Rewrite to tenant routes
  return NextResponse.rewrite(
    new URL(`/tenants/${subdomain}${request.nextUrl.pathname}`, request.url)
  );
}
```

## When in Doubt

- **Tenant Isolation:** Always filter by `tenant_id` in database queries
- **GDPR:** If touching user data, consider privacy implications
- **Security:** Validate all user input, especially file uploads
- **German Law:** Legal pages (Impressum, Datenschutz) are mandatory, not optional
