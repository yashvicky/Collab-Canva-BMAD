# Epics 4-7: Remaining Implementation

This file contains the remaining epics for quick reference during development.

---

# Epic 4: Object Manipulation

**Goal:** Enable users to transform and organize objects  
**Priority:** P0 (Critical)  
**Estimated Time:** 2.75 hours

## Story 4.1: Selection (1 hour)
- Click to select, Shift+click multi-select
- Rubber-band drag selection
- Blue outline + 4 corner handles
- Cmd+A select all, Esc deselect

## Story 4.2: Move & Resize (1.5 hours)
- Drag to move, arrow keys nudge (1px/10px with Shift)
- 4 corner handles resize
- Shift locks aspect ratio, Alt resizes from center
- Clamp to canvas bounds

## Story 4.3: Delete (15 minutes)
- Delete/Backspace removes selected
- Multi-delete supported
- Instant sync to all users

---

# Epic 5: Authentication & Deployment

**Goal:** Enable frictionless access and public hosting  
**Priority:** P0 (Critical)  
**Estimated Time:** 1.5 hours

## Story 5.1: Firebase Anonymous Auth (30 minutes)
```typescript
import { getAuth, signInAnonymously } from 'firebase/auth';

const auth = getAuth();
const user = await signInAnonymously(auth);
const userName = `User-${user.uid.slice(-4)}`;
const userColor = USER_COLORS[Math.floor(Math.random() * 10)];

updateMyPresence({ userName, userColor });
```

## Story 5.2: Vercel Deployment (1 hour)
- Connect GitHub repo to Vercel
- Configure environment variables
- Test deployed app with real-time sync
- Verify public URL works

---

# Epic 6: AI Agent

**Goal:** Enable natural language canvas manipulation  
**Priority:** P0 (Critical)  
**Estimated Time:** 4 hours

## Story 6.1: AI API Integration (1 hour)
```typescript
// app/api/ai/canvas/route.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: Request) {
  const { command, canvasState } = await req.json();
  
  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1024,
    tools: [createShapeTool, arrangeGridTool],
    messages: [{
      role: 'user',
      content: `Canvas: ${JSON.stringify(canvasState)}\n\nCommand: "${command}"`
    }]
  });
  
  const functionCalls = message.content
    .filter(block => block.type === 'tool_use')
    .map(block => ({ name: block.name, args: block.input }));
  
  return Response.json({ functionCalls });
}
```

## Story 6.2: Command Bar UI (30 minutes)
- Press '/' to open
- Bottom-center input field
- Enter submits, Esc cancels
- Loading spinner during AI request

## Story 6.3: Create Shapes Command (1 hour)
Function schema:
```typescript
{
  name: "createShape",
  parameters: {
    shapeType: "rect" | "circle" | "text",
    count: number (1-10),
    fill: string,
    text?: string
  }
}
```

Examples:
- "Create 3 blue rectangles"
- "Add text 'Hello World'"

## Story 6.4: Arrange Grid Command (1 hour)
Function schema:
```typescript
{
  name: "arrangeGrid",
  parameters: {
    objectIds: string[],
    rows: number,
    cols: number,
    spacing: number
  }
}
```

Examples:
- "Arrange in 3×3 grid"
- "Arrange horizontally"

## Story 6.5: Complex Command - Login Form (30 minutes)
"Create a login form" should generate:
1. Username label (text)
2. Username input (white rectangle)
3. Password label (text)
4. Password input (white rectangle)
5. Submit button (blue rectangle)
6. Submit label (text on button)

---

# Epic 7: Polish & UX

**Goal:** Professional finish and user delight  
**Priority:** P1 (Important)  
**Estimated Time:** 1.5 hours

## Story 7.1: Animations & Visual Polish (1 hour)
- Shape creation fade-in
- Toast notifications styled
- Toolbar polished
- Command bar styled

## Story 7.2: Share & Onboarding (30 minutes)
- Share button copies URL
- Empty state: "Press '/' to ask AI"
- Example commands shown
- Keyboard shortcuts documented

---

## Story Priority Order for Development

Based on 15 hours available:

### Day 1 (5 hours)
1. Epic 1: Canvas Infrastructure (2.5h)
2. Epic 2: Shape Tools - Stories 2.1, 2.2 (1.75h)
3. Epic 3: Real-Time - Story 3.1 (1h) - START

### Day 2 (5 hours)
4. Epic 3: Real-Time - Stories 3.2, 3.3, 3.4 (3h)
5. Epic 2: Shape Tools - Story 2.3 (1.5h)
6. Epic 4: Object Manipulation - Story 4.1 (1h) - START

### Day 3 (5 hours)
7. Epic 4: Object Manipulation - Stories 4.2, 4.3 (1.75h)
8. Epic 5: Auth & Deploy (1.5h)
9. Epic 6: AI Agent - Stories 6.1, 6.2, 6.3 (2.5h)

### Day 4 (Buffer if needed)
10. Epic 6: AI Agent - Stories 6.4, 6.5 (1.5h)
11. Epic 7: Polish (1h)
12. Testing & Bug Fixes (remaining time)

---

## Quick Reference: Key Files

```
src/
├── app/
│   ├── canvas/[roomId]/page.tsx    # RoomProvider
│   └── api/ai/canvas/route.ts      # AI endpoint
├── components/
│   ├── Canvas.tsx                  # Main canvas
│   ├── Toolbar.tsx                 # Tool selection
│   ├── CommandBar.tsx              # AI input
│   └── shapes/
│       ├── Rectangle.tsx
│       ├── Circle.tsx
│       └── Text.tsx
├── lib/
│   ├── liveblocks.ts               # Client setup
│   ├── firebase.ts                 # Auth setup
│   └── utils.ts                    # Helpers
└── types/
    └── canvas.ts                   # CanvasObject type
```

---

## Testing Checklist

### Single User
- [ ] Canvas pans and zooms smoothly
- [ ] Can create all 3 shape types
- [ ] Can select and move objects
- [ ] Can resize objects
- [ ] Can delete objects
- [ ] 60 FPS maintained

### Multi-User (2 browsers)
- [ ] Objects sync < 100ms
- [ ] Cursors sync < 50ms
- [ ] Both can create simultaneously
- [ ] Both can move same object (LWW)
- [ ] Presence badge accurate

### AI Agent
- [ ] Command bar opens with '/'
- [ ] "Create 3 rectangles" works
- [ ] "Arrange in grid" works
- [ ] "Create login form" works
- [ ] All commands sync to users
- [ ] Response time < 2s

### Deployment
- [ ] Deployed to Vercel
- [ ] Public URL accessible
- [ ] Real-time sync works
- [ ] AI commands work
- [ ] No console errors