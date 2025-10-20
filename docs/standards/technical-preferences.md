# Technical Preferences

## Technology Stack (LOCKED for CollabCanvas Challenge)

### Frontend Framework
- **Next.js 15** (App Router, React Server Components)
- **React 19** (latest)
- **TypeScript** (strict mode, no `any` types)

### Styling
- **Tailwind CSS 3.4+** (utility-first)
- Custom brand colors: `#4C5FD5` (brand), `#3C4CB0` (brand-dark)

### Real-Time Collaboration
- **Liveblocks 2.11+** (for real-time sync, presence, storage)
- Use Lson storage (not Y.js) for this project
- Cursor positions: < 50ms sync target
- Object changes: < 100ms sync target

### Canvas Rendering
- **Konva 9.3+** with **react-konva 18.2+**
- Client-side only (no SSR for canvas)
- 60 FPS target for all interactions
- Support 500+ objects without degradation

### Authentication
- **Firebase 11.0+** (anonymous auth for MVP)
- Simple user identification (name/ID)

### Deployment
- **Vercel** (target platform)
- Environment variables via `.env.local`

## Coding Standards

### File Organization
- Components: `/src/components/`
- Lib/utils: `/src/lib/`
- App Router: `/src/app/`
- Types: colocated with components or `/src/types/`

### TypeScript Rules
- NO `any` types (use `unknown` if needed)
- Explicit return types on functions
- Strict null checks
- Use `type` over `interface` for consistency

### React Patterns
- Server Components by default
- Client Components: explicit `'use client'` directive
- Hooks: custom hooks in `/src/hooks/`
- No prop drilling: use context for deep trees

### Import Style
- Use `@/` path alias
- Type imports: `import type { ... }`
- Absolute imports preferred

## Anti-Patterns to Avoid

### Real-Time Sync
- ❌ DO NOT use localStorage/sessionStorage (not supported in artifacts)
- ❌ DO NOT use Liveblocks Y.js (use Lson storage)
- ❌ DO NOT over-broadcast (debounce cursor updates)

### Canvas Rendering
- ❌ DO NOT render Konva server-side
- ❌ DO NOT put business logic in canvas components
- ❌ DO NOT block the main thread (use RAF for animations)

### Performance
- ❌ DO NOT re-render entire canvas on small changes
- ❌ DO NOT create objects in render functions
- ❌ DO NOT skip memoization for expensive calculations

## Challenge Constraints

### MVP Requirements (24 hours - HARD GATE)
- Basic canvas with pan/zoom
- One shape type minimum (rectangle, circle, or text)
- Create and move objects
- Real-time sync between 2+ users
- Multiplayer cursors with name labels
- Presence awareness (who's online)
- User authentication
- Deployed and publicly accessible

### Performance Targets
- 60 FPS during all interactions
- < 100ms object sync
- < 50ms cursor sync
- 500+ objects without FPS drops
- 5+ concurrent users without degradation

### AI Agent Requirements (Post-MVP)
- 6+ distinct commands minimum
- Function calling (not prompt-based)
- Creation, manipulation, and layout commands
- Complex commands (e.g., "create login form")