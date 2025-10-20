# Technology Stack
# CollabCanvas - Technology Stack

**Date:** October 19, 2025  
**Status:** Approved for Development

---

## Core Framework

### Next.js 15.0.0
- **Purpose:** React framework with App Router
- **Features Used:**
  - App Router (React Server Components)
  - API Routes (serverless functions)
  - Automatic code splitting
  - Fast Refresh development
  - Vercel deployment optimized
- **Why:** Modern, serverless, React 19 support

### React 19.0.0
- **Purpose:** UI library
- **Features Used:**
  - Server Components
  - Improved performance
  - Better error boundaries
- **Why:** Latest stable release

### TypeScript 5.6.3
- **Purpose:** Type safety
- **Features Used:**
  - Strict mode enabled
  - No `any` types allowed
  - Path aliases configured (`@/*`)
  - Type-safe imports
- **Why:** Prevents bugs, better DX

---

## Real-Time & Canvas

### Liveblocks 2.11.0
**Packages:**
- `@liveblocks/client` - Core client
- `@liveblocks/react` - React bindings

**Features Used:**
- Lson storage (LiveMap, LiveObject)
- Presence API for cursors
- WebSocket transport
- Auto-reconnect

**Configuration:**
```typescript
const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
  throttle: 33, // 30 FPS
});
```

**Why:** Purpose-built for collaborative apps, proven in figma-clone

---

### Konva 9.3.2 + react-konva 18.2.9
**Packages:**
- `konva` - Core canvas library
- `react-konva` - React bindings
- `@types/konva` - TypeScript types

**Features Used:**
- HTML5 Canvas rendering
- Event system (drag, click, wheel)
- Transform support (scale, rotate)
- Stage/Layer architecture
- GPU-accelerated transforms

**Basic Usage:**
```typescript
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
```

**Why:** Mature (9+ years), performant, excellent event system

---

## Authentication & AI

### Firebase 11.0.1
**Package:** `firebase`

**Features Used:**
- `firebase/auth` - Anonymous authentication
- Client-side SDK only
- Free tier (unlimited anonymous)

**Configuration:**
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

export const auth = getAuth(app);
```

**Why:** Simple anonymous auth, free, reliable

---

### Anthropic Claude SDK
**Package:** `@anthropic-ai/sdk`

**Features Used:**
- Claude Haiku 3.5 model
- Function calling support
- Server-side only (API routes)

**Configuration:**
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});
```

**Why:** Cheapest option ($1/1M tokens), fast, excellent function calling

---

## Utilities

### nanoid
**Package:** `nanoid`

**Purpose:** UUID generation
- Shorter than uuid (11 chars vs 36)
- Cryptographically secure
- URL-safe characters

**Usage:**
```typescript
import { nanoid } from 'nanoid';
const id = nanoid(); // "V1StGXR8_Z5"
```

**Why:** Smaller IDs = less bandwidth

---

### lodash
**Package:** `lodash`

**Features Used:**
- `throttle` - Throttle cursor/object updates
- Utility functions as needed

**Usage:**
```typescript
import { throttle } from 'lodash';

const throttledUpdate = throttle((x, y) => {
  updateObject(id, { x, y });
}, 33); // 30 FPS
```

**Why:** Battle-tested utilities, reliable throttling

---

## Styling

### Tailwind CSS 3.4.14
**Packages:**
- `tailwindcss` - Core library
- `autoprefixer` - CSS vendor prefixes
- `postcss` - CSS processing

**Configuration:**
```typescript
// tailwind.config.ts
export default {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4C5FD5',
          dark: '#3C4CB0',
          light: '#E4E6FB',
        },
      },
    },
  },
};
```

**Why:** Utility-first, fast development, JIT compiler

---

## Development Tools

### ESLint 9.13.0
**Package:** `eslint`

**Configurations:**
- `next/core-web-vitals` - Next.js rules
- `next/typescript` - TypeScript rules

**Custom Rules:**
```json
{
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

**Why:** Consistent code style, catch errors early

---

### TypeScript Compiler
**Features Used:**
- Strict mode
- No emit (Next.js handles compilation)
- Path aliases (`@/*` → `./src/*`)
- Incremental compilation

**Configuration:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Package.json

```json
{
  "name": "collab-canva-bmad",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@liveblocks/client": "^2.11.0",
    "@liveblocks/react": "^2.11.0",
    "firebase": "^11.0.1",
    "konva": "^9.3.2",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-konva": "^18.2.9",
    "nanoid": "^5.0.0",
    "lodash": "^4.17.21",
    "@anthropic-ai/sdk": "^0.20.0"
  },
  "devDependencies": {
    "@types/konva": "^8.4.2",
    "@types/node": "^22.8.5",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.1",
    "@types/lodash": "^4.17.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.13.0",
    "eslint-config-next": "^15.0.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3"
  }
}
```

---

## Installation Commands

### Initial Setup
```bash
npm install
```

### Add New Dependencies
```bash
# Production dependency
npm install package-name

# Development dependency
npm install -D package-name
```

---

## Environment Variables

### Required for Development

```bash
# .env.local
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_xxxxx
LIVEBLOCKS_SECRET_KEY=sk_dev_xxxxx
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### Variable Naming Convention
- `NEXT_PUBLIC_*` - Exposed to browser
- No prefix - Server-side only

---

## Browser Support

### Targets
- **Chrome** (primary) - Latest 2 versions
- **Firefox** (secondary) - Latest 2 versions
- **Safari** (secondary) - Latest 2 versions
- **Edge** (secondary) - Latest 2 versions

### Not Supported
- IE11
- Mobile browsers (desktop-only for MVP)

---

## Deployment Platform

### Vercel
**Features Used:**
- Auto-deploy on push to main
- Environment variables management
- Edge network (global CDN)
- Serverless functions for API routes

**Configuration:**
- Build command: `npm run build`
- Output directory: `.next`
- Node version: 18.x

---

## Version Management

### Node.js
- **Required:** 18.17+ (LTS)
- **Recommended:** 20.x (latest LTS)

### Package Manager
- **npm:** 9+ (comes with Node.js)
- **Alternative:** pnpm 8+ (faster)

---

## Related Documents

- **Coding Standards:** See `coding-standards.md`
- **Project Structure:** See `project-structure.md`
- **ADRs:** See ADR files for technology choice rationale