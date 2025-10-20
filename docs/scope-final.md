# Final Scope - Locked for Development

**Date:** October 20, 2025  
**Status:** ✅ APPROVED by Product Owner  
**Method:** BMAD

---

## MVP Scope (Must Have - P0)

### Epic 1: Canvas Infrastructure
- [x] Basic canvas (20000×20000px)
- [x] Pan (Space + drag, 60 FPS)
- [x] Zoom (wheel, toward cursor, 0.25x-4x)

### Epic 2: Shape Tools
- [x] Rectangle tool (R key, drag-to-create)
- [x] Circle tool (O key, perfect circles)
- [x] Text tool (T key, click-to-place, double-click edit)

### Epic 3: Real-Time Collaboration
- [x] Liveblocks room setup (/canvas/[roomId])
- [x] Object sync (< 100ms)
- [x] Multiplayer cursors (< 50ms)
- [x] Presence awareness badge

### Epic 4: Object Manipulation
- [x] Selection (click, Shift+click, Cmd+A)
- [x] Move (drag, arrow keys)
- [x] Resize (4 corner handles, Shift locks aspect)
- [x] Delete (Delete/Backspace)

### Epic 5: Authentication & Deployment
- [x] Firebase anonymous auth (User-XXXX names)
- [x] Vercel deployment (public URL)

### Epic 6: AI Agent
- [x] AI API integration (Claude Haiku 3.5)
- [x] Command bar UI (press '/')
- [x] createShape command ("Create 3 blue rectangles")
- [x] arrangeGrid command ("Arrange in 3×3 grid")
- [x] Login form command ("Create a login form")

### Epic 7: UI Polish
- [x] Toolbar (V, R, O, T tools, polished design)
- [x] Share button (copy URL to clipboard)

---

## Out of Scope (Post-MVP)

### Not Included:
- ❌ Rotation, duplicate, layer management
- ❌ Undo/redo
- ❌ File export (PNG, PDF)
- ❌ Comments/annotations
- ❌ Templates
- ❌ Advanced AI commands beyond 3
- ❌ Rubber-band drag selection
- ❌ Empty state message
- ❌ Animations/transitions

---

## Success Criteria

### MVP Checklist:
- [ ] Canvas renders and pans/zooms smoothly (60 FPS)
- [ ] All 3 shape types work (Rect, Circle, Text)
- [ ] Real-time sync < 100ms (tested with 2 browsers)
- [ ] Cursors sync < 50ms
- [ ] Can select, move, resize, delete objects
- [ ] Firebase auth works (anonymous)
- [ ] AI creates shapes via natural language
- [ ] AI arranges objects in grid
- [ ] AI creates login form (5-6 objects)
- [ ] Command bar opens with '/'
- [ ] Share button copies URL
- [ ] Deployed to Vercel (public URL)
- [ ] No console errors
- [ ] Works in Chrome, Firefox

---

## Technical Specifications

### Performance Targets:
- 60 FPS during all interactions
- < 100ms object sync latency
- < 50ms cursor sync latency
- < 2s AI command execution
- Support 500+ objects
- Support 5+ concurrent users

### Technology Stack:
- Next.js 15 (App Router)
- React 19
- TypeScript (strict mode)
- Tailwind CSS
- Konva.js (canvas rendering)
- Liveblocks (real-time sync)
- Firebase (anonymous auth)
- Anthropic Claude Haiku 3.5 (AI)
- Vercel (deployment)

---

## Development Order

### Day 1: Foundation
1. Story 1.1: Canvas Setup (1.5h)
2. Story 1.2: Pan & Zoom (1h)
3. Story 2.1: Rectangle Tool (1h)
4. Story 2.2: Circle Tool (0.75h)
5. Story 3.1: Liveblocks Room (1h)

### Day 2: Collaboration
6. Story 3.2: Object Sync (1.5h)
7. Story 3.3: Multiplayer Cursors (1h)
8. Story 3.4: Presence Badge (0.5h)
9. Story 2.3: Text Tool (1.5h)
10. Story 4.1: Selection (1h)

### Day 3: AI & Deploy
11. Story 4.2: Move & Resize (1.5h)
12. Story 4.3: Delete (0.25h)
13. Story 5.1: Firebase Auth (0.5h)
14. Story 6.1-6.5: AI Agent (3.5h)
15. Story 7: UI Polish (0.75h)
16. Story 5.2: Deploy (0.5h)

---

## Risk Mitigation

### Known Risks:
1. **Konva SSR issues** → Use 'use client' directive
2. **Liveblocks sync lag** → Throttle to 30 FPS, optimistic UI
3. **AI errors** → Validate all responses, default bad values
4. **Text editing complexity** → Use HTML overlay, keep simple

### Contingency Plan:
- If behind schedule: Cut text tool or login form command
- If AI integration difficult: Focus on 2 commands (create + arrange)
- If performance issues: Reduce max objects to 100

---

## Approval

**Product Owner:** ✅ APPROVED  
**Technical Lead:** ✅ APPROVED  
**Date:** October 20, 2025

**Scope is LOCKED. Development begins immediately.**

---

## Next Steps

1. Save this file to `docs/scope-final.md`
2. Commit to git
3. Begin Story 1.1: Canvas Setup
4. Follow BMAD development workflow (SM → Dev → QA → Commit)