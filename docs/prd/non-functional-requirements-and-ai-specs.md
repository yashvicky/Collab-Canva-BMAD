# Non-Functional Requirements & AI Specifications

This file combines NFRs and AI specifications from the main PRD.

---

## Non-Functional Requirements

### NFR-001: Frame Rate
**Target:** 60 FPS during all interactions

**Requirements:**
- Pan/zoom maintains 60 FPS with 500+ objects
- Drag operations maintain 60 FPS
- No dropped frames during multi-user sync
- Konva selective updates (no full re-render)
- Stage-level transforms for pan/zoom

**Measurement:**
- Chrome DevTools Performance profiler
- Manual observation (no visible lag)

---

### NFR-002: Sync Latency
**Targets:**
- Object changes: < 100ms across users
- Cursor positions: < 50ms across users
- AI commands: < 2s total execution time

**Implementation:**
- Throttle object updates: 30 FPS (33ms)
- Throttle cursor updates: 30 FPS (33ms)
- Optimistic UI with pre-generated UUIDs
- Liveblocks WebSocket for low latency

**Measurement:**
- Network tab timestamps
- Manual testing with 2 browsers
- Stopwatch for AI commands

---

### NFR-003: Load Performance
**Targets:**
- Initial canvas load: < 2s
- Room join: < 1s
- 500 objects render: < 1s

**Implementation:**
- Liveblocks auto-loads on connection
- Konva optimized rendering
- No blocking operations

---

### NFR-004: Concurrent Users
**Target:** Support 5+ users without degradation

**Requirements:**
- Bandwidth optimization (throttled updates)
- No performance drop with 5 users
- Tested with 2-3 users for demo

---

### NFR-005: Data Persistence
**Target:** 100% data retention

**Requirements:**
- All objects persist in Liveblocks storage
- Room state survives all users leaving
- Refresh preserves all data
- No data loss on disconnect

---

### NFR-006: Error Recovery
**Target:** Graceful failure, no crashes

**Requirements:**
- Try/catch around all Liveblocks operations
- Validate AI responses before execution
- Auto-reconnect on network failure
- User-friendly error messages (toast)

---

### NFR-007: API Key Protection
**Requirements:**
- Liveblocks secret key: Server-side only (API routes)
- Firebase config: Public keys in env vars
- Anthropic API key: Server-side only (API routes)
- No keys in client bundle
- .env.local in .gitignore

---

### NFR-008: Input Validation
**Requirements:**
- AI commands: Max 500 chars
- Object counts: Max 10 per AI command
- Canvas bounds: Clamp all positions
- Colors: Validate hex format

---

### NFR-009: Accessibility
**Requirements:**
- Keyboard shortcuts for all tools
- Keyboard-accessible command bar
- Toast notifications for feedback
- Clear visual indicators

---

### NFR-010: Browser Support
**Targets:**
- Chrome (primary)
- Firefox (secondary)
- Safari (secondary)
- Edge (secondary)

**Not supported:**
- IE11
- Mobile browsers (desktop-only for MVP)

---

### NFR-011: Code Quality
**Requirements:**
- TypeScript strict mode (no any)
- ESLint rules enforced
- Consistent naming conventions
- Comments for complex logic
- 80% code reuse from figma-clone patterns

---

### NFR-012: Documentation
**Requirements:**
- README with setup instructions
- Architecture decision records (ADRs)
- Inline code comments
- Demo script documented

---

## AI Agent Specifications

### AI Technical Architecture

**Provider:** Anthropic Claude Haiku 3.5  
**API Endpoint:** https://api.anthropic.com/v1/messages  
**Model:** claude-3-5-haiku-20241022  
**Max tokens:** 1024

**Request Flow:**
1. User types command in command bar
2. Client sends to /api/ai/canvas with command + canvas state
3. Server calls Claude with function schemas
4. Claude returns function calls
5. Client executes each function via Liveblocks mutations
6. Changes sync to all users automatically

---

### Function Schemas

#### createShape Function
```typescript
{
  name: "createShape",
  description: "Create one or more shapes on the canvas",
  input_schema: {
    type: "object",
    properties: {
      shapeType: {
        type: "string",
        enum: ["rect", "circle", "text"],
        description: "Type of shape to create"
      },
      count: {
        type: "number",
        description: "Number of shapes (1-10)",
        minimum: 1,
        maximum: 10
      },
      fill: {
        type: "string",
        description: "Hex color code"
      },
      text: {
        type: "string",
        description: "Text content (if shapeType is 'text')"
      },
      position: {
        type: "object",
        properties: {
          x: { type: "number" },
          y: { type: "number" }
        },
        description: "Optional position, defaults to center"
      }
    },
    required: ["shapeType", "count", "fill"]
  }
}
```

**Example Commands:**
- "Create 3 blue rectangles"
- "Create 5 red circles"
- "Add a text that says 'Hello World'"
- "Create a green rectangle"

---

#### arrangeGrid Function
```typescript
{
  name: "arrangeGrid",
  description: "Arrange selected objects in a grid",
  input_schema: {
    type: "object",
    properties: {
      objectIds: {
        type: "array",
        items: { type: "string" },
        description: "IDs of objects to arrange"
      },
      rows: {
        type: "number",
        description: "Number of rows",
        minimum: 1
      },
      cols: {
        type: "number",
        description: "Number of columns",
        minimum: 1
      },
      spacing: {
        type: "number",
        description: "Space between objects (px)",
        default: 50
      },
      startPosition: {
        type: "object",
        properties: {
          x: { type: "number" },
          y: { type: "number" }
        },
        description: "Top-left corner"
      }
    },
    required: ["objectIds", "rows", "cols"]
  }
}
```

**Example Commands:**
- "Arrange these in a 3×3 grid"
- "Arrange these horizontally"
- "Arrange these vertically"
- "Space these evenly"

---

### Context Sent to AI

**Canvas State (condensed):**
```typescript
{
  objects: [
    { id, type, x, y, width, height, fill, text? },
    // ... up to 100 objects
  ],
  canvasSize: { width: 20000, height: 20000 },
  selectedIds: ["obj-1", "obj-2"], // optional
  viewport: { centerX, centerY, zoom }
}
```

**System Prompt:**
```
You are an AI assistant that manipulates a collaborative canvas.
Users give commands like "Create 3 blue rectangles" or "Arrange these in a grid".
You respond with function calls that execute their intent.

Available functions:
1. createShape - Create shapes (rect, circle, text)
2. arrangeGrid - Arrange objects in a grid

Rules:
- Max 10 objects per createShape call
- Use reasonable default positions (near viewport center)
- Colors must be valid hex codes
- Be smart about spacing and arrangement
```

---

### Error Handling Matrix

| Error Type | Detection | Response | User Feedback |
|------------|-----------|----------|---------------|
| Unknown function | Validate name | Ignore call | Toast: "AI command not understood" |
| Invalid params | Validate args | Cap/default values | Execute with corrections |
| API failure | Catch network error | Log error | Toast: "AI unavailable, try again" |
| Timeout (>10s) | setTimeout | Abort request | Toast: "Request timed out" |
| Rate limit | HTTP 429 | Exponential backoff | Toast: "Too many requests, wait 10s" |
| Invalid command | Empty response | No action | Toast: "Please rephrase" |

---

### Cost & Performance

**Per Command Cost:**
- Input tokens: ~500 (canvas state + schemas)
- Output tokens: ~200 (function calls)
- Cost: ~$0.0004 per command
- Budget: $5 = 13,000+ commands

**Performance Targets:**
- Claude API response: < 1.5s
- Client-side execution: < 0.5s
- Total perceived latency: < 2s

**Optimization:**
- Limit canvas state to 100 objects (reduce tokens)
- Cache function schemas (don't send every time)
- Debounce command submission (prevent spam)

---

## Success Metrics

### MVP Success Criteria (Must Have)
- [ ] Real-time sync works: 2 users collaborate < 100ms object sync
- [ ] Cursors visible: Multiplayer cursors with names, < 50ms sync
- [ ] 3 shape types: Rectangle, circle, text all functional
- [ ] AI creates shapes: Natural language commands generate objects
- [ ] Deployed publicly: Vercel URL accessible
- [ ] 60 FPS maintained: No lag during interactions
- [ ] Demo-ready: 90-second script executable

---

### Quality Metrics (Should Have)
- [ ] 2 AI commands: createShape + arrangeGrid working
- [ ] Visual polish: Animations, styled UI
- [ ] Share functionality: URL copy button
- [ ] Error handling: Graceful failures, helpful messages
- [ ] Browser compatibility: Works in Chrome, Firefox, Safari

---

### Wow Factor Metrics (Nice to Have)
- [ ] Complex command works: "Create login form" generates 6 objects
- [ ] Cursor trails: Visual polish like Figma
- [ ] Smooth animations: Fade-in, transitions
- [ ] Viral potential: Demo video worthy
- [ ] Performance excellence: Smooth with 500 objects

---

### Technical Metrics

**Performance:**
- [ ] 60 FPS during all interactions (DevTools)
- [ ] < 100ms object sync (Network tab)
- [ ] < 50ms cursor sync (Network tab)
- [ ] < 2s AI command execution (stopwatch)

**Reliability:**
- [ ] 0 crashes during 30-minute test
- [ ] 0 data loss events
- [ ] 100% reconnect success rate

**Code Quality:**
- [ ] 0 TypeScript any types
- [ ] 0 ESLint errors
- [ ] 80%+ code reuse from figma-clone

---

## Environment Variables Required

```bash
# Liveblocks (Real-time sync)
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your_liveblocks_public_key_here
LIVEBLOCKS_SECRET_KEY=your_liveblocks_secret_key_here

# Firebase (Anonymous Auth)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=collab-canva.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=collab-canva

# Anthropic Claude (AI Agent)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Security Notes:**
- Never commit .env.local to git
- Regenerate keys if accidentally exposed
- Use Vercel environment variables for production
- Liveblocks secret key: Server-side only
- Anthropic API key: Server-side only