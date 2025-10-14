# Quick Reference Guide - BelegBoost

**Multi-Tenant SaaS Tech Stack**

---

## Essential Links

### Next.js 15.5
- **Docs**: https://nextjs.org/docs/app
- **Middleware**: https://nextjs.org/docs/app/api-reference/file-conventions/middleware
- **Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- **Upgrade Guide**: https://nextjs.org/docs/app/guides/upgrading/version-15
- **Vercel Platforms Example**: https://github.com/vercel/platforms

### Appwrite
- **Main Docs**: https://appwrite.io/docs
- **Multi-Tenancy**: https://appwrite.io/docs/products/auth/multi-tenancy
- **Teams API**: https://appwrite.io/docs/server/teams
- **Database**: https://appwrite.io/docs/references/cloud/client-web/databases
- **Storage**: https://appwrite.io/docs/references/cloud/client-web/storage
- **Custom Domains**: https://appwrite.io/docs/advanced/platform/custom-domains

### TypeScript
- **Handbook**: https://www.typescriptlang.org/docs/handbook/intro.html
- **Strict Mode**: https://www.typescriptlang.org/tsconfig#strict

### Tailwind CSS 4
- **Docs**: https://tailwindcss.com/docs
- **Theme Variables**: https://tailwindcss.com/docs/theme
- **v4 Release**: https://tailwindcss.com/blog/tailwindcss-v4
- **Upgrade Guide**: https://tailwindcss.com/docs/upgrade-guide

### shadcn/ui
- **Docs**: https://ui.shadcn.com/docs
- **Next.js Install**: https://ui.shadcn.com/docs/installation/next
- **Tailwind v4**: https://ui.shadcn.com/docs/tailwind-v4
- **Components**: https://ui.shadcn.com/docs/components

---

## Common Commands

### Development
```bash
# Start dev server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### shadcn/ui
```bash
# Initialize shadcn/ui (with React 19)
pnpx shadcn@latest init

# Add components
npx shadcn@latest add button
npx shadcn@latest add card dialog input
```

### Appwrite (when integrated)
```bash
# Install Appwrite SDK
npm install appwrite

# Install Appwrite CLI
npm install -g appwrite-cli

# Login to Appwrite
appwrite login

# Initialize project
appwrite init
```

### Migrations
```bash
# Migrate to Next.js 15
npx @next/codemod@latest upgrade latest

# Specific codemods
npx @next/codemod@latest next-async-request-api
```

---

## Code Snippets

### Middleware for Subdomain Routing

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];

  if (subdomain && subdomain !== 'localhost') {
    url.pathname = `/tenant/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
```

---

### Server Action with Validation

```typescript
// app/actions/tenant.ts
'use server';

import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createTenant(formData: FormData) {
  const result = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!result.success) {
    return { error: 'Validation failed', details: result.error.flatten() };
  }

  // Create tenant logic
  return { success: true };
}
```

---

### Dynamic Tailwind Theming

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
}

@layer base {
  [data-theme='ocean'] {
    --color-primary: #aab9ff;
  }

  [data-theme='sunset'] {
    --color-primary: #ff6b6b;
  }
}
```

```typescript
// Tenant layout
export default async function TenantLayout({ children, params }) {
  const { subdomain } = await params;
  const tenant = await getTenant(subdomain);

  return (
    <div style={{ '--color-primary': tenant.primaryColor } as React.CSSProperties}>
      {children}
    </div>
  );
}
```

---

### Appwrite Multi-Tenancy Setup

```typescript
import { Client, Teams, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('[PROJECT_ID]');

const teams = new Teams(client);
const databases = new Databases(client);

// Create tenant (team)
async function createTenant(name: string) {
  const team = await teams.create('unique()', name);

  await databases.createDocument(
    'tenants-db',
    'tenants',
    'unique()',
    { teamId: team.$id, name },
    [`read("team:${team.$id}")`, `write("team:${team.$id}", ["owner"])`]
  );

  return team;
}

// Query tenant-scoped data
import { Query } from 'appwrite';

async function getTenantData(teamId: string) {
  return databases.listDocuments('db', 'collection', [
    Query.equal('teamId', teamId),
  ]);
}
```

---

### TypeScript: Tenant Types

```typescript
// types/tenant.ts
export interface Tenant {
  id: string;
  subdomain: string;
  name: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
  };
  subscription: {
    plan: 'free' | 'starter' | 'pro' | 'enterprise';
    status: 'active' | 'trialing' | 'past_due' | 'canceled';
  };
}

export type TenantId = string & { readonly __brand: 'TenantId' };

export interface TenantResource {
  id: string;
  tenantId: TenantId;
  createdAt: string;
  updatedAt: string;
}
```

---

## Breaking Changes Cheat Sheet

### Next.js 15

| API | Before | After |
|-----|--------|-------|
| `cookies()` | `const c = cookies()` | `const c = await cookies()` |
| `headers()` | `const h = headers()` | `const h = await headers()` |
| `params` | `{ params }` | `{ params: Promise<{...}>}` |
| `searchParams` | `{ searchParams }` | `{ searchParams: Promise<{...}>}` |
| Caching | Cached by default | Uncached by default |

### Tailwind CSS 4

| Feature | v3 | v4 |
|---------|----|----|
| Config | `tailwind.config.js` | `@theme` in CSS |
| PostCSS | `tailwindcss` | `@tailwindcss/postcss` |
| Directives | `@tailwind base;` | `@import "tailwindcss";` |
| Animation | `tailwindcss-animate` | `tw-animate-css` |

---

## Environment Variables

```bash
# .env.local

# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your-project-id
APPWRITE_API_KEY=your-api-key

# Multi-Tenancy
NEXT_PUBLIC_ROOT_DOMAIN=yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database (if self-hosting Appwrite)
APPWRITE_DB_HOST=localhost
APPWRITE_DB_PORT=5432
```

---

## File Structure

```
belegboost/
├── src/
│   ├── app/
│   │   ├── (public)/          # Public routes
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── tenant/
│   │   │   └── [subdomain]/   # Tenant-scoped routes
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       └── dashboard/
│   │   ├── actions/           # Server Actions
│   │   │   ├── tenant.ts
│   │   │   └── user.ts
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── tenant/            # Tenant-specific components
│   ├── lib/
│   │   ├── appwrite.ts
│   │   ├── utils.ts
│   │   └── tenant.ts
│   └── types/
│       ├── tenant.ts
│       └── api.ts
├── middleware.ts
├── components.json
├── postcss.config.mjs
├── tsconfig.json
├── next.config.ts
└── package.json
```

---

## Troubleshooting

### React 19 Peer Dependency Issues
```bash
# Use pnpm (recommended)
pnpm install

# Or with npm
npm install --legacy-peer-deps
```

### Tailwind Not Working
1. Check `postcss.config.mjs` has `@tailwindcss/postcss`
2. Verify `globals.css` imports: `@import "tailwindcss";`
3. Ensure Tailwind 4.x installed: `npm list tailwindcss`

### Middleware Not Running
1. Place `middleware.ts` in project root or `src/`
2. Check `matcher` config excludes static files
3. Verify file exports `config` and `middleware` function

### Subdomain Routing Locally
Add to `/etc/hosts` (Mac/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
```
127.0.0.1 tenant1.localhost
127.0.0.1 tenant2.localhost
```

Access: `http://tenant1.localhost:3000`

---

## Performance Tips

### Turbopack (Next.js 15.5)
- **Development**: Enabled by default
- **Production**: Use `--turbopack` flag (beta)
  ```bash
  npm run build -- --turbopack
  ```

### Caching Strategy
```typescript
// Opt-in to caching
export const revalidate = 3600; // Revalidate every hour

// Or per-request
fetch(url, { next: { revalidate: 3600 } });
```

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src={tenant.logo}
  alt={tenant.name}
  width={200}
  height={50}
  priority // For LCP images
/>
```

---

## Security Checklist

- [ ] Validate all Server Action inputs with Zod
- [ ] Verify user authentication in Server Actions
- [ ] Check tenant access permissions
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS in production
- [ ] Implement CSRF protection
- [ ] Use Content Security Policy headers
- [ ] Sanitize user-generated content
- [ ] Rate limit API endpoints
- [ ] Implement proper error handling (don't leak sensitive info)

---

## Next Steps

1. Review full documentation: `docs/TECH_STACK_DOCUMENTATION.md`
2. Set up Appwrite instance (cloud or self-hosted)
3. Implement subdomain middleware
4. Create tenant database schema
5. Build authentication flow
6. Implement dynamic theming
7. Deploy to Vercel

---

**Last Updated**: October 15, 2025
