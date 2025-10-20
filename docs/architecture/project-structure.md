# Project Structure
# CollabCanvas - Project Structure

**Date:** October 19, 2025  
**Status:** Approved for Development

---

## Complete Directory Layout

```
collab-canva-bmad/
├── .bmad-core/                    # BMAD method framework
│   ├── agents/                    # BMAD agents (SM, Dev, QA, etc.)
│   ├── tasks/                     # BMAD tasks
│   ├── templates/                 # BMAD templates
│   ├── data/
│   │   └── technical-preferences.md
│   └── core-config.yaml           # BMAD configuration
│
├── docs/                          # Planning documents
│   ├── research/
│   │   ├── market-analysis.md
│   │   ├── competitive-analysis.md
│   │   └── scope-validation.md
│   ├── prd/                       # Sharded PRD
│   │   ├── overview.md
│   │   ├── functional-requirements.md
│   │   ├── non-functional-requirements-and-ai-specs.md
│   │   ├── epic-01-canvas-infrastructure.md
│   │   ├── epic-02-shape-tools.md
│   │   ├── epic-03-realtime-collaboration.md
│   │   └── epics-04-through-07.md
│   ├── architecture/              # Sharded Architecture (NEW)
│   │   ├── overview.md
│   │   ├── component-structure.md
│   │   ├── data-architecture.md
│   │   ├── coding-standards.md
│   │   ├── tech-stack.md
│   │   ├── project-structure.md
│   │   ├── adr-0001-liveblocks.md
│   │   ├── adr-0002-konva.md
│   │   ├── adr-0003-ai-claude.md
│   │   └── adr-0004-firebase-auth.md
│   ├── stories/                   # User story files (created during dev)
│   │   ├── story-01-canvas-setup.md
│   │   ├── story-02-rectangle-tool.md
│   │   └── ...
│   ├── prd.md                     # Full PRD (reference)
│   ├── architecture.md            # Full architecture (reference)
│   ├── scope-final.md
│   └── README-PRD-Sharding.md
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout, providers
│   │   ├── page.tsx               # Landing page
│   │   ├── canvas/
│   │   │   └── [roomId]/
│   │   │       └── page.tsx       # Canvas page
│   │   ├── api/
│   │   │   └── ai/
│   │   │       └── canvas/
│   │   │           └── route.ts   # AI API endpoint
│   │   ├── globals.css            # Global styles
│   │   └── favicon.ico
│   │
│   ├── components/                # React components
│   │   ├── Canvas.tsx             # Main Konva canvas
│   │   ├── Toolbar.tsx            # Tool selection
│   │   ├── CommandBar.tsx         # AI command input
│   │   ├── PresenceBadge.tsx      # Active users count
│   │   ├── ShareButton.tsx        # Copy URL
│   │   ├── Cursor.tsx             # Remote cursor
│   │   └── shapes/
│   │       ├── Rectangle.tsx      # Konva Rect wrapper
│   │       ├── Circle.tsx         # Konva Circle wrapper
│   │       └── Text.tsx           # Konva Text wrapper
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useCanvas.ts           # Canvas state, viewport
│   │   ├── useTools.ts            # Active tool, shortcuts
│   │   ├── useSelection.ts        # Selected objects
│   │   └── useAI.ts               # AI command execution
│   │
│   ├── lib/                       # Utilities, configs
│   │   ├── liveblocks.ts          # Liveblocks client setup
│   │   ├── firebase.ts            # Firebase auth setup
│   │   ├── ai.ts                  # Claude API wrapper
│   │   └── utils.ts               # Utility functions
│   │
│   └── types/                     # TypeScript types
│       ├── canvas.ts              # Canvas types
│       ├── liveblocks.ts          # Liveblocks types
│       └── ai.ts                  # AI types
│
├── public/                        # Static assets
│   └── icons/                     # Tool icons, cursor icons
│
├── .cursor/                       # Cursor IDE rules
│   └── rules/
│       └── bmad/
│
├── .env.local                     # Environment variables (gitignored)
├── .env.example                   # Example env file
├── .eslintrc.json                 # ESLint config
├── .gitignore                     # Git ignore rules
├── next.config.ts                 # Next.js config
├── package.json                   # Dependencies
├── postcss.config.mjs             # PostCSS config
├── tailwind.config.ts             # Tailwind config
├── tsconfig.json                  # TypeScript config
└── README.md                      # Project readme
```

---

## Key Directories Explained

### `/src/app` - Next.js App Router

**Purpose:** Application routes and server-side code

```
app/
├── layout.tsx         # Root layout (providers, fonts)
├── page.tsx           # Home page (redirect to /canvas/demo)
├── canvas/[roomId]/   # Dynamic canvas route
└── api/               # API routes (serverless functions)
```

**Naming conventions:**
- `layout.tsx` - Wraps child pages
- `page.tsx` - Route component
- `[param]/` - Dynamic route segment
- `route.ts` - API route handler

---

### `/src/components` - React Components

**Purpose:** Reusable UI components

**Organization:**
```
components/
├── Canvas.tsx              # Large, complex component
├── Toolbar.tsx             # Medium component
├── CommandBar.tsx          # Medium component
└── shapes/                 # Grouped by feature
    ├── Rectangle.tsx
    ├── Circle.tsx
    └── Text.tsx
```

**Rules:**
- One component per file
- PascalCase naming
- Co-locate related components in folders
- All components are `'use client'` (Konva requirement)

---

### `/src/hooks` - Custom Hooks

**Purpose:** Reusable React hooks

**Naming:** Always prefix with `use`

```typescript
// hooks/useCanvas.ts
export function useCanvas() {
  // Hook logic
  return { viewport, pan, zoom };
}

// Usage in component
import { useCanvas } from '@/hooks/useCanvas';
const { viewport } = useCanvas();
```

---

### `/src/lib` - Utilities & Configs

**Purpose:** Non-React utilities, third-party configs

**Examples:**
```
lib/
├── liveblocks.ts      # Liveblocks client + room context
├── firebase.ts        # Firebase app + auth
├── ai.ts              # Claude API wrapper
└── utils.ts           # Pure functions (clampPosition, etc.)
```

**Rules:**
- Pure functions only (no React hooks)
- Reusable across components
- Well-typed, documented

---

### `/src/types` - TypeScript Types

**Purpose:** Shared type definitions

**Organization:**
```
types/
├── canvas.ts          # CanvasObject, Tool, Viewport
├── liveblocks.ts      # Presence, Storage types
└── ai.ts              # FunctionCall, AICommand
```

**Import pattern:**
```typescript
import type { CanvasObject } from '@/types/canvas';
```

---

### `/docs` - Planning Documents

**Purpose:** BMAD planning artifacts

**Structure:**
```
docs/
├── prd/               # Sharded PRD (7 files)
├── architecture/      # Sharded architecture (10 files)
├── stories/           # User stories (created during dev)
├── research/          # Market analysis
├── prd.md             # Full PRD (reference)
├── architecture.md    # Full arch (reference)
└── scope-final.md
```

**Usage:**
- Dev agent loads from `architecture/`
- SM agent reads from `prd/`
- Stories created in `stories/`

---

## File Naming Conventions

### Components
```
✅ Canvas.tsx           # PascalCase
✅ CommandBar.tsx       # PascalCase, no separators
✅ PresenceBadge.tsx    # PascalCase compound words
```

### Hooks
```
✅ useCanvas.ts         # camelCase with 'use' prefix
✅ useTools.ts
✅ useSelection.ts
```

### Utilities
```
✅ liveblocks.ts        # camelCase
✅ firebase.ts
✅ utils.ts
```

### Types
```
✅ canvas.ts            # camelCase
✅ liveblocks.ts
```

### Routes
```
✅ page.tsx             # Next.js convention
✅ layout.tsx
✅ route.ts             # API routes
✅ [roomId]/            # Dynamic segments in brackets
```

---

## Import Path Aliases

### Configured in `tsconfig.json`
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Usage Examples
```typescript
// ✅ GOOD - Absolute imports
import { Canvas } from '@/components/Canvas';
import { useCanvas } from '@/hooks/useCanvas';
import { clampPosition } from '@/lib/utils';
import type { CanvasObject } from '@/types/canvas';

// ❌ BAD - Relative imports
import { Canvas } from '../../components/Canvas';
import { useCanvas } from '../hooks/useCanvas';
```

---

## Asset Organization

### Public Directory
```
public/
├── icons/
│   ├── select.svg
│   ├── rectangle.svg
│   ├── circle.svg
│   └── text.svg
└── favicon.ico
```

**Usage:**
```typescript
// In component
<img src="/icons/rectangle.svg" alt="Rectangle tool" />
```

---

## Configuration Files

### Root Level
```
.eslintrc.json         # ESLint rules
.gitignore             # Git ignore patterns
next.config.ts         # Next.js configuration
package.json           # Dependencies & scripts
postcss.config.mjs     # PostCSS plugins
tailwind.config.ts     # Tailwind customization
tsconfig.json          # TypeScript compiler options
```

### Environment Files
```
.env.local             # Local development (gitignored)
.env.example           # Template (committed)
```

---

## Generated Directories (Gitignored)

```
.next/                 # Next.js build output
node_modules/          # npm packages
.vercel/               # Vercel deployment cache
```

---

## Story Files (Created During Development)

```
docs/stories/
├── story-01-canvas-setup.md
├── story-02-pan-zoom.md
├── story-03-rectangle-tool.md
├── story-04-circle-tool.md
├── story-05-text-tool.md
├── story-06-liveblocks-room.md
├── story-07-object-sync.md
├── story-08-multiplayer-cursors.md
├── story-09-presence-badge.md
├── story-10-selection.md
├── story-11-move-resize.md
├── story-12-delete.md
├── story-13-firebase-auth.md
├── story-14-ai-api.md
├── story-15-command-bar.md
├── story-16-create-shapes.md
├── story-17-arrange-grid.md
├── story-18-login-form.md
├── story-19-toolbar-polish.md
├── story-20-share-button.md
└── story-21-deploy.md
```

**Created by:** Scrum Master agent during development

---

## Build Output

### Development
```bash
npm run dev
# Runs on http://localhost:3000
# Hot reload enabled
```

### Production
```bash
npm run build
# Outputs to .next/
# Optimized for deployment
```

---

## Related Documents

- **Coding Standards:** See `coding-standards.md`
- **Tech Stack:** See `tech-stack.md`
- **Component Structure:** See `component-structure.md`