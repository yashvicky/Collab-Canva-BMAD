# Collab Canva BMAD

Collaboration-first whiteboard MVP built with Next.js 15, React 19, Tailwind CSS, Firebase Auth, and Liveblocks realtime storage.

## Getting Started

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and provide Firebase + Liveblocks keys.
3. Run the dev server: `npm run dev`
4. Visit `http://localhost:3000` to try the canvas.

## Scripts

- `npm run dev` – start the Next.js development server.
- `npm run lint` – run ESLint using the project config.
- `npm run typecheck` – ensure TypeScript types are sound.
- `npm run build` – production build (also runs during CI).
- `npm run start` – run the compiled production server.

## Project Structure

- `src/app` – App Router entry points (`layout.tsx`, `page.tsx`).
- `src/components` – UI components including Konva canvas and toolbars.
- `src/lib` – Firebase and Liveblocks client configuration.
- `docs` – architecture notes, requirements, QA plans, and standards.

## Additional Notes

Tailwind CSS powers layout utilities; heavier Konva canvas logic should live in client components under `src/components`. Liveblocks powers realtime collaboration; ensure the public API key is only used for development.
