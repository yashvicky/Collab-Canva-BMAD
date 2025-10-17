# Technical Preferences

## Runtime & Framework
- **Next.js 15 (App Router), TypeScript strict mode**
- **React 19** with client components where needed (Konva + presence UI).
- **Tailwind CSS** for UI scaffolding; keep styles composable and utility-first.

## Realtime & State
- **Liveblocks** for:
  - Storage (`LiveList` / `LsonObject` records) to sync shapes
  - Presence (cursor, name)
  - **Dev:** `publicApiKey`.
  - **Prod:** `authEndpoint` + server secret; associate user identity.
- **Local UI state:** `useState`/`useMemo` only; no global client store unless required.

## Canvas & Drawing
- **react-konva** for shapes; avoid server imports of Konva (client-only).
- Drawing primitives: `Rect`, `Circle`, `Text`, labels.
- Pan/zoom at **Stage** level; shapes are **draggable** with transform-aware presence.

## Auth
- **Firebase Auth** (anonymous for MVP).
- Later phases: named accounts (Google sign-in), map Firebase UID → Liveblocks identity.

## Project Discipline
- **ESLint + Prettier + TypeScript strict**
- **Husky + lint-staged**: block bad commits.
- **Commitlint**: Conventional Commits.
- **CI**: `pnpm/ npm ci`, `next build`, and typecheck.

## Testing
- **MVP:** smoke tests + typecheck + ESLint on CI.
- **Early:** unit tests around shape mutations and presence mapping.
- **Final:** e2e happy-path drag/zoom.

## Accessibility & Perf
- Keyboard focus for toolbar buttons.
- Avoid wasteful re-renders (memoize heavy lists).
- Use **dynamic import** for Konva page if needed to dodge SSR.

## Deployment
- **Vercel** connected to GitHub.
- Env vars stored in Vercel.
- Preview deployments for PRs.

## Anti-Patterns (Do not)
- Export server-only Konva APIs to SSR.
- Mix Liveblocks public key in production.
- Add state libraries (Redux/Zustand) unless strictly required.
- Commit `.env.local` or service secrets.
