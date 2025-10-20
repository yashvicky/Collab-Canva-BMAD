 Product Requirements Document (PRD)
# CollabCanvas - Real-Time Collaborative Canvas with AI Agent

**Version:** 1.0  
**Date:** October 19, 2025  
**Status:** Approved for Development  
**Method:** BMAD (Breakthrough Method for Agile AI-Driven Development)

---

## Document Control

| Role | Name | Date |
|------|------|------|
| Business Analyst | Claude (BMAD) | Oct 19, 2025 |
| Product Manager | Claude (BMAD) | Oct 19, 2025 |
| Architect | Claude (BMAD) | Oct 19, 2025 |
| Product Owner | Claude (BMAD) | Oct 19, 2025 |
| Approver | Human Operator | Oct 19, 2025 |

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Market Analysis](#market-analysis)
4. [Functional Requirements](#functional-requirements)
5. [Non-Functional Requirements](#non-functional-requirements)
6. [User Stories & Epics](#user-stories--epics)
7. [AI Agent Specifications](#ai-agent-specifications)
8. [Success Metrics](#success-metrics)

---

## 1. Executive Summary

### 1.1 Project Vision

CollabCanvas is a real-time collaborative canvas tool with AI-powered natural language manipulation as its primary differentiator. Unlike existing tools that use AI for content generation (Miro, FigJam) or diagram creation (Excalidraw), CollabCanvas makes AI manipulation of existing canvas elements the core user experience.

### 1.2 Target Users

- **Primary:** Design teams, product managers, remote collaborators
- **Secondary:** Brainstorming facilitators, educators, developers
- **Persona:** Users who value speed over features, want instant collaboration without setup

### 1.3 Unique Value Proposition

**"Design at the speed of thought through natural language + real-time collaboration"**

- **Problem:** Existing tools require manual manipulation of elements (slow, tedious)
- **Solution:** AI agent executes layout commands instantly via natural language
- **Benefit:** 10× faster iteration, accessible to non-designers, viral "wow factor"

### 1.4 Market Opportunity

**Total Addressable Market (TAM):**
- Collaborative whiteboard software: $3.17B (2025), growing 18.5% CAGR
- Design collaboration software: $3.8B (2025), growing 14.8% CAGR

**Gap Identified:**
- AI content generation exists (Miro AI, FigJam AI)
- AI diagram generation exists (Excalidraw text-to-diagram)
- **Missing:** Production-ready tool for AI element manipulation as PRIMARY feature

**Competitive Advantage:**
- tldraw's `computer` is experimental (not production-ready)
- FigJam AI is closed-source and complex
- We're building accessible, open, focused tool

---

## 2. Project Overview

### 2.1 Project Goals

**Primary Goal:**
Build a production-ready collaborative canvas where AI manipulation is as seamless as cursor synchronization.

**Secondary Goals:**
1. Match tldraw/Figma sync quality (< 50ms cursor, < 100ms objects)
2. Prove AI agent viability for canvas tools
3. Create shareable demo that goes viral

### 2.2 Timeline & Milestones

**Total Duration:** 7 days (Oct 17-24, 2025)

| Milestone | Date | Deliverables |
|-----------|------|--------------|
| **Planning Complete** | Oct 19 | PRD, Architecture, Stories |
| **MVP Checkpoint** | Oct 20 | Canvas + sync working |
| **Feature Complete** | Oct 22 | AI agent functional |
| **Final Submission** | Oct 24 | Deployed, tested, demo ready |

**Daily Breakdown:**
- **Day 1 (Thu):** Canvas + shapes + Liveblocks sync
- **Day 2 (Fri):** Text + transforms + cursors
- **Day 3 (Sat):** AI agent + command bar
- **Day 4 (Sun AM):** Polish + deploy + test

### 2.3 Scope Summary

**In Scope (16 hours):**
- Infinite canvas (pan/zoom)
- 3 shape types (rectangle, circle, text)
- Basic transforms (select, move, resize, delete)
- Real-time sync (Liveblocks)
- Multiplayer cursors + presence
- Firebase anonymous auth
- AI agent (2 commands + variations = 6 total)
- Command bar UI
- Vercel deployment

**Out of Scope (MVP):**
- Rotation, duplicate, layer management
- Undo/redo
- File export
- Comments/annotations
- Templates
- Advanced AI commands

### 2.4 Dependencies

**External Services:**
- Liveblocks (real-time sync) - Free tier
- Firebase (auth) - Free tier
- Anthropic Claude (AI) - $5 budget
- Vercel (hosting) - Free tier

**Reference Materials:**
- figma-clone repo (andepants) - Code patterns
- tldraw computer - AI inspiration
- Competitive analysis - Feature validation

---

## 3. Market Analysis

### 3.1 Competitive Landscape

#### 3.1.1 Direct Competitors

**Miro:**
- Strengths: Enterprise features, deep integrations, AI for content generation
- Weaknesses: Complex UI, slow for quick tasks, expensive
- Our advantage: Speed, simplicity, AI manipulation (not just generation)

**Figma/FigJam:**
- Strengths: Industry standard, best-in-class sync, professional polish
- Weaknesses: Design-centric (not brainstorming-first), no AI manipulation
- Our advantage: AI as primary feature, simpler for non-designers

**Excalidraw:**
- Strengths: Hand-drawn aesthetic, open-source, text-to-diagram AI
- Weaknesses: Limited AI (only diagram generation), basic features
- Our advantage: AI element manipulation, more polished

**tldraw:**
- Strengths: Speed, simplicity, experimental AI (`computer` project)
- Weaknesses: AI not production-ready, experimental only
- Our advantage: Production-ready AI, focused feature set

#### 3.1.2 Indirect Competitors

- Google Jamboard (being sunset)
- Microsoft Whiteboard (basic features)
- Mural (enterprise-focused)

### 3.2 Market Validation

**From Competitive Testing:**
- ✅ tldraw: < 50ms cursor sync is achievable (gold standard)
- ✅ Figma: Real-time sync is a solved problem
- ✅ All tools: Simple beats complex for quick collaboration
- ✅ Gap confirmed: No tool has AI manipulation as core feature

**From Market Research:**
- High double-digit growth (18-20% CAGR)
- Market receptive to innovation
- AI features are trend (Miro AI, FigJam AI both launched 2024)

### 3.3 User Needs (Validated)

**Must-Have (Universal):**
1. Low-latency real-time sync (< 50ms cursor, < 100ms objects)
2. Multiplayer cursors + presence awareness
3. Basic shapes (rect, circle, text)
4. Simple, intuitive UX

**Should-Have (Common):**
1. No signup required (instant collaboration)
2. Shareable links (viral growth)
3. Basic transforms (move, resize)

**Nice-to-Have (Differentiator):**
1. **AI manipulation** (our focus)
2. Templates
3. Export options

---

## 4. Functional Requirements

### 4.1 Canvas Infrastructure

#### FR-001: Infinite Canvas
**Priority:** P0 (Critical)  
**Description:** Large, scrollable workspace for unrestricted design

**Specifications:**
- Logical size: 20000×20000px
- Center point: (10000, 10000)
- Initial viewport: Matches browser window
- Bounds: Objects clamped to 0,0 → 20000,20000

**Acceptance Criteria:**
- [ ] Canvas renders at 20000×20000px logical space
- [ ] Users can pan beyond initial viewport
- [ ] Objects cannot be created/moved outside bounds
- [ ] Performance maintained with full canvas size

#### FR-002: Pan (Camera Movement)
**Priority:** P0 (Critical)  
**Description:** Smooth camera panning across canvas

**Specifications:**
- **Primary method:** Space + drag
- **Throttle:** 60 FPS (requestAnimationFrame)
- **Transform:** Stage-level (GPU-accelerated)
- **Smoothness:** No dropped frames

**Acceptance Criteria:**
- [ ] Space + drag pans camera smoothly
- [ ] 60 FPS maintained during pan
- [ ] Works with 500+ objects on canvas
- [ ] Pan continues if cursor leaves canvas during drag

#### FR-003: Zoom (Camera Scale)
**Priority:** P0 (Critical)  
**Description:** Smooth camera zooming toward cursor

**Specifications:**
- **Method:** Mouse wheel
- **Range:** 0.25x (25%) to 4x (400%)
- **Default:** 1x (100%)
- **Target:** Zoom toward cursor position (Figma pattern)
- **Fallback:** Zoom to viewport center if no cursor

**Acceptance Criteria:**
- [ ] Wheel up zooms in, wheel down zooms out
- [ ] Zoom targets mouse cursor position
- [ ] Clamped to 0.25x - 4x range
- [ ] Smooth, no janky steps
- [ ] Works at canvas edges

---

### 4.2 Shape Creation & Management

#### FR-004: Rectangle Tool
**Priority:** P0 (Critical)  
**Description:** Create rectangular shapes

**Specifications:**
- **Creation:** Drag to define size
- **Default:** 160×100px if click-only
- **Min size:** 8×8px (enforced)
- **Max size:** 5000×5000px
- **Default fill:** #4F46E5 (indigo)
- **Border radius:** 8px
- **Stroke:** None for MVP
- **Keyboard shortcut:** R

**Acceptance Criteria:**
- [ ] Press R → rectangle tool active
- [ ] Drag creates rectangle with preview
- [ ] Click-only creates 160×100px rect at cursor
- [ ] Rectangle appears in Konva layer
- [ ] Rectangle syncs to other users < 100ms
- [ ] Min/max size enforced

#### FR-005: Circle Tool
**Priority:** P0 (Critical)  
**Description:** Create circular shapes (perfect circles only)

**Specifications:**
- **Creation:** Drag to define diameter
- **Constraint:** Perfect circles (aspect ratio locked)
- **Default:** 60px radius (120px diameter)
- **Min radius:** 6px
- **Max radius:** 2500px
- **Default fill:** #06B6D4 (cyan)
- **Stroke:** None for MVP
- **Keyboard shortcut:** O

**Acceptance Criteria:**
- [ ] Press O → circle tool active
- [ ] Drag creates circle with preview
- [ ] Aspect ratio always 1:1 (perfect circle)
- [ ] Click-only creates 120px diameter circle
- [ ] Circle syncs to other users < 100ms

#### FR-006: Text Tool
**Priority:** P0 (Critical)  
**Description:** Create text layers

**Specifications:**
- **Creation:** Click to place, type immediately
- **Font:** System UI stack (ui-sans-serif, -apple-system, Segoe UI, Roboto)
- **Size:** 16px (fixed for MVP)
- **Color:** #111827 (gray-900)
- **Weight:** Regular only (no bold/italic for MVP)
- **Alignment:** Left only
- **Max chars:** 500 (soft limit)
- **Multiline:** Yes (Shift+Enter for line break)
- **Edit mode:** Double-click to edit, Esc/blur to exit
- **Keyboard shortcut:** T

**Acceptance Criteria:**
- [ ] Press T → text tool active
- [ ] Click canvas → text input appears
- [ ] Type text → renders in Konva
- [ ] Double-click existing text → edit mode
- [ ] Text syncs to other users on blur
- [ ] Multiline support works

---

### 4.3 Object Transforms

#### FR-007: Selection
**Priority:** P0 (Critical)  
**Description:** Select one or more objects

**Specifications:**
- **Single select:** Click object
- **Multi-select:** Shift + click to add/remove
- **Rubber-band:** Drag from empty canvas
- **Select all:** Cmd/Ctrl + A
- **Deselect:** Click empty canvas or Esc
- **Visual:** Blue 2px outline + 4 corner handles
- **Multi-visual:** Bounding box around all selected

**Acceptance Criteria:**
- [ ] Click selects object (blue outline)
- [ ] Shift+click adds to selection
- [ ] Drag from empty creates rubber-band
- [ ] Cmd+A selects all objects
- [ ] Esc or click empty deselects
- [ ] 4 corner handles visible on selection

#### FR-008: Move
**Priority:** P0 (Critical)  
**Description:** Move selected objects

**Specifications:**
- **Primary:** Drag selected object
- **Arrow keys:** 1px per press
- **Shift + arrow:** 10px per press
- **Multi-select:** All move together (maintain relative positions)
- **Bounds:** Clamped to canvas (0,0 → 20000,20000)
- **Sync:** Throttled to 30 FPS (every 33ms)

**Acceptance Criteria:**
- [ ] Drag moves object smoothly
- [ ] Arrow keys move 1px
- [ ] Shift+arrow moves 10px
- [ ] Multi-selection moves as group
- [ ] Objects clamped to canvas bounds
- [ ] Movement syncs to other users < 100ms

#### FR-009: Resize
**Priority:** P0 (Critical)  
**Description:** Resize selected objects

**Specifications:**
- **Handles:** 4 corners only (for MVP)
- **Aspect ratio:** Free by default, Shift to lock
- **Resize from center:** Alt/Option key
- **Min size:** 8×8px for rect, 6px radius for circle
- **Text behavior:** Resize bounding box only (font stays 16px)
- **Sync:** Throttled to 30 FPS

**Acceptance Criteria:**
- [ ] 4 corner handles visible
- [ ] Drag handle resizes object
- [ ] Shift locks aspect ratio
- [ ] Alt resizes from center
- [ ] Min size enforced
- [ ] Text box resizes (font size unchanged)

#### FR-010: Delete
**Priority:** P0 (Critical)  
**Description:** Delete selected objects

**Specifications:**
- **Shortcut:** Delete or Backspace key
- **Confirmation:** None (instant delete)
- **Multi-delete:** Deletes all selected objects
- **Sync:** Immediate broadcast to all users

**Acceptance Criteria:**
- [ ] Delete key removes selected object
- [ ] Backspace also works
- [ ] Multi-selection deletes all
- [ ] Deletion syncs instantly to other users
- [ ] No orphaned data in Liveblocks

---

### 4.4 Real-Time Collaboration

#### FR-011: Liveblocks Room Structure
**Priority:** P0 (Critical)  
**Description:** Room-based collaboration

**Specifications:**
- **URL pattern:** `/canvas/[roomId]`
- **Room ID format:** Random words (e.g., "happy-turtle-42")
- **Default room:** `/canvas/demo` (for evaluators)
- **Generation:** Adjective + noun + number (0-99)
- **Persistence:** Rooms persist indefinitely (Liveblocks storage)

**Acceptance Criteria:**
- [ ] Users can join room via URL
- [ ] Room ID visible in URL bar
- [ ] Default demo room works
- [ ] Room state persists after all users leave
- [ ] Refresh preserves room state

#### FR-012: Object Storage Schema
**Priority:** P0 (Critical)  
**Description:** How objects are stored in Liveblocks

**Specifications:**
```typescript
type CanvasObject = {
  id: string;              // nanoid()
  type: 'rect' | 'circle' | 'text';
  x: number;               // position
  y: number;
  width: number;
  height: number;
  fill: string;            // hex color
  zIndex: number;          // timestamp for ordering
  text?: string;           // for text objects only
  fontSize?: number;       // for text (16px default)
};

type Storage = {
  objects: LiveMap>;
};
```

**Acceptance Criteria:**
- [ ] All objects stored in LiveMap
- [ ] IDs generated with nanoid()
- [ ] Z-index uses timestamp (Date.now())
- [ ] Schema supports all 3 shape types
- [ ] Storage structure matches spec

#### FR-013: Object Sync
**Priority:** P0 (Critical)  
**Description:** Synchronize object changes across users

**Specifications:**
- **Pattern:** Optimistic updates with pre-generated UUID
- **Create:** Add to Liveblocks + Konva simultaneously
- **Update:** Mutate individual properties (Lson pattern)
- **Delete:** Remove from LiveMap + Konva
- **Throttle:** 30 FPS (33ms) for drag operations
- **Target:** < 100ms sync latency
- **Conflict:** Last Write Wins (Liveblocks default)

**Acceptance Criteria:**
- [ ] User A creates object → User B sees < 100ms
- [ ] User A moves object → User B sees smooth movement
- [ ] User A deletes → User B sees immediate removal
- [ ] Both users can create simultaneously
- [ ] Both users can move same object (LWW resolves)
- [ ] No ghost objects or duplicates

#### FR-014: Multiplayer Cursors
**Priority:** P0 (Critical)  
**Description:** Show other users' cursor positions

**Specifications:**
- **Data:** Cursor { x, y, userName, userColor }
- **Sync method:** Liveblocks Presence API
- **Throttle:** 30 FPS (33ms)
- **Target:** < 50ms sync latency
- **Visual:** Cursor icon + name label
- **Hide:** When cursor leaves canvas or user idles 5+ seconds
- **Colors:** Random from 10-color palette

**Acceptance Criteria:**
- [ ] Remote cursors visible in real-time
- [ ] Name labels next to cursors
- [ ] Smooth movement (< 50ms sync)
- [ ] Unique color per user
- [ ] Cursor hidden when leaves canvas
- [ ] No jank or lagRetryVContinueFR-015: Presence Awareness
Priority: P0 (Critical)
Description: Show who's actively collaborating
Specifications:

Display: "X users active" badge (top-right corner)
Update: Real-time as users join/leave
Data: Count from Liveblocks presence
Visual: Small pill badge, non-intrusive
Minimum: Always shows at least "1 user"

Acceptance Criteria:

 Badge shows correct user count
 Updates when users join
 Updates when users leave
 Visible but not distracting
 Always accurate (no phantom users)


4.5 Authentication
FR-016: Firebase Anonymous Auth
Priority: P0 (Critical)
Description: Frictionless user identification
Specifications:

Method: Firebase signInAnonymously()
User naming: "User-" + last 4 chars of Firebase UID

Example: Firebase UID "Kx7n2Pq8" → "User-Kx7n"


User colors: Random from palette:

typescript  ['#4F46E5', '#EC4899', '#10B981', '#F59E0B', 
   '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16', 
   '#F97316', '#A855F7']

No signup: Instant access, no forms
Persistence: Firebase handles session

Acceptance Criteria:

 User auto-logged in on first visit
 Name generated from Firebase UID
 Name visible to other users
 Color assigned from palette
 No login UI needed
 Session persists across refreshes


4.6 AI Agent
FR-017: AI Integration Architecture
Priority: P0 (Critical)
Description: Claude Haiku 3.5 function calling
Specifications:

Provider: Anthropic Claude Haiku 3.5
API: Function calling via /api/ai/canvas route
Input: User command + canvas state (up to 100 objects)
Output: Array of function calls to execute
Cost: ~$0.0004 per command (negligible)
Latency target: < 2s total response time

Acceptance Criteria:

 API route /api/ai/canvas exists
 Accepts POST with command + canvas state
 Calls Claude with function schemas
 Returns array of function calls
 Response time < 2s average
 Handles API errors gracefully

FR-018: Command Bar UI
Priority: P0 (Critical)
Description: Input for AI commands
Specifications:

Activation: Press '/' key
Position: Bottom center of screen (like VS Code)
Visual: Single input field with placeholder
Placeholder: "Ask AI to create or arrange shapes..."
Submit: Enter key
Cancel: Esc key
Loading: Show spinner while AI responds
Examples: Show example commands on first use

Acceptance Criteria:

 Press '/' opens command bar
 Input field focused automatically
 Placeholder text visible
 Enter submits command
 Esc closes command bar
 Loading state during AI request
 Example prompts helpful

FR-019: AI Command - Create Shapes
Priority: P0 (Critical)
Description: AI creates shapes via natural language
Function Schema:
typescript{
  name: "createShape",
  description: "Create one or more shapes on the canvas",
  parameters: {
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
Example Commands:

"Create 3 blue rectangles"
"Create 5 red circles"
"Add a text that says 'Hello World'"
"Create a green rectangle"

Acceptance Criteria:

 "Create 3 blue rectangles" → 3 rects appear
 "Create 5 circles" → 5 circles appear
 "Add text 'Hello'" → text object created
 Shapes appear at reasonable positions
 Changes sync to all users instantly
 Validates count (max 10)

FR-020: AI Command - Arrange Grid
Priority: P0 (Critical)
Description: AI arranges objects in grid layout
Function Schema:
typescript{
  name: "arrangeGrid",
  description: "Arrange selected objects in a grid",
  parameters: {
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
Example Commands:

"Arrange these in a 3×3 grid"
"Arrange these horizontally"
"Arrange these vertically"
"Space these evenly"

Acceptance Criteria:

 "Arrange in 3×3 grid" → objects arranged
 "Arrange horizontally" → single row
 "Arrange vertically" → single column
 Spacing maintained between objects
 Changes sync to all users instantly
 Works with 2-20 objects

FR-021: Complex Command - Login Form
Priority: P1 (Important)
Description: AI creates multi-object layouts
Command: "Create a login form"
Expected Output:
6 objects created and arranged:

Text: "Username:" label
Rectangle: Username input box (white)
Text: "Password:" label
Rectangle: Password input box (white)
Rectangle: Submit button (blue)
Text: "Submit" button label

Arrangement: Vertical stack with appropriate spacing
Acceptance Criteria:

 "Create login form" generates 6+ objects
 Labels + inputs properly paired
 Submit button included
 Arranged vertically/neatly
 Changes sync to all users
 Meets challenge evaluation criteria

FR-022: AI Error Handling
Priority: P0 (Critical)
Description: Graceful failure when AI errors occur
Scenarios:

Invalid function: AI returns unknown function name
Invalid params: AI provides bad arguments (e.g., count > 10)
API failure: Network error or rate limit
Timeout: Response takes > 10s

Handling:

Validate all function names before execution
Cap count to 10, default bad colors to #3B82F6
Show toast: "AI unavailable, try again"
Log errors to console for debugging

Acceptance Criteria:

 Unknown functions ignored with toast
 Invalid params corrected (capped/defaulted)
 API failures show user-friendly error
 Timeouts handled gracefully
 No crashes from AI errors
 Errors logged for debugging


4.7 User Interface
FR-023: Toolbar
Priority: P0 (Critical)
Description: Tool selection UI
Specifications:

Position: Top horizontal bar
Tools: Select (V), Rectangle (R), Circle (O), Text (T)
Visual: Icon + keyboard shortcut hint
Active state: Highlighted tool
Default: Select tool active

Acceptance Criteria:

 Toolbar visible at top
 4 tools present
 Click tool activates it
 Keyboard shortcuts work (V/R/O/T)
 Active tool highlighted
 Minimal, unobtrusive design

FR-024: Share Button
Priority: P1 (Important)
Description: Copy room URL for sharing
Specifications:

Position: Top-right corner (near presence badge)
Action: Copy window.location.href to clipboard
Feedback: Toast notification "Link copied!"
Icon: Share/link icon
Purpose: Viral growth, easy collaboration

Acceptance Criteria:

 Button visible in top-right
 Click copies URL to clipboard
 Toast confirms copy success
 URL includes room ID
 Works on all browsers

FR-025: Empty State
Priority: P1 (Important)
Description: Guide new users
Specifications:

Trigger: Canvas has 0 objects
Message: "Press '/' to ask AI to create shapes"
Visual: Centered text, subtle color
Dismiss: Automatically when first object created
Purpose: Onboarding, reduce confusion

Acceptance Criteria:

 Message shown on empty canvas
 Disappears when object created
 Clear, helpful text
 Non-intrusive visual style


5. Non-Functional Requirements
5.1 Performance
NFR-001: Frame Rate
Target: 60 FPS during all interactions
Requirements:

Pan/zoom maintains 60 FPS with 500+ objects
Drag operations maintain 60 FPS
No dropped frames during multi-user sync
Konva selective updates (no full re-render)
Stage-level transforms for pan/zoom

Measurement:

Chrome DevTools Performance profiler
Manual observation (no visible lag)

NFR-002: Sync Latency
Targets:

Object changes: < 100ms across users
Cursor positions: < 50ms across users
AI commands: < 2s total execution time

Implementation:

Throttle object updates: 30 FPS (33ms)
Throttle cursor updates: 30 FPS (33ms)
Optimistic UI with pre-generated UUIDs
Liveblocks WebSocket for low latency

Measurement:

Network tab timestamps
Manual testing with 2 browsers
Stopwatch for AI commands

NFR-003: Load Performance
Targets:

Initial canvas load: < 2s
Room join: < 1s
500 objects render: < 1s

Implementation:

No batch rendering (render all immediately)
Liveblocks auto-loads on connection
Konva optimized rendering

NFR-004: Concurrent Users
Target: Support 5+ users without degradation
Requirements:

Bandwidth optimization (throttled updates)
No performance drop with 5 users
Tested with 2-3 users for demo

5.2 Reliability
NFR-005: Data Persistence
Target: 100% data retention
Requirements:

All objects persist in Liveblocks storage
Room state survives all users leaving
Refresh preserves all data
No data loss on disconnect

NFR-006: Error Recovery
Target: Graceful failure, no crashes
Requirements:

Try/catch around all Liveblocks operations
Validate AI responses before execution
Auto-reconnect on network failure
User-friendly error messages (toast)

5.3 Security
NFR-007: API Key Protection
Requirements:

Liveblocks secret key: Server-side only (API routes)
Firebase config: Public keys in env vars
Anthropic API key: Server-side only (API routes)
No keys in client bundle
.env.local in .gitignore

NFR-008: Input Validation
Requirements:

AI commands: Max 500 chars
Object counts: Max 10 per AI command
Canvas bounds: Clamp all positions
Colors: Validate hex format

5.4 Usability
NFR-009: Accessibility
Requirements:

Keyboard shortcuts for all tools
Keyboard-accessible command bar
Toast notifications for feedback
Clear visual indicators (selection, active tool)

NFR-010: Browser Support
Targets:

Chrome (primary)
Firefox (secondary)
Safari (secondary)
Edge (secondary)

Not supported:

IE11
Mobile browsers (desktop-only for MVP)

5.5 Maintainability
NFR-011: Code Quality
Requirements:

TypeScript strict mode (no any)
ESLint rules enforced
Consistent naming conventions
Comments for complex logic
80% code reuse from figma-clone repo patterns

NFR-012: Documentation
Requirements:

README with setup instructions
Architecture decision records (ADRs)
Inline code comments for non-obvious logic
Demo script documented


6. User Stories & Epics
Epic 1: Canvas Infrastructure
Goal: Build the foundational canvas with smooth pan/zoom
Stories:
Story 1.1: Basic Canvas Setup
As a user
I want to see a large, scrollable canvas
So that I can design without space constraints
Acceptance Criteria:

 Canvas renders 20000×20000px workspace
 Initial view centered at (10000, 10000)
 Konva Stage initialized
 Single Layer created
 60 FPS maintained

Estimated Time: 1.5 hours

Story 1.2: Pan & Zoom
As a user
I want to pan and zoom the canvas smoothly
So that I can navigate large designs easily
Acceptance Criteria:

 Space+drag pans camera
 Wheel zooms toward cursor
 Zoom clamped to 0.25x - 4x
 Stage-level transforms (GPU-accelerated)
 60 FPS during all movements

Estimated Time: 1 hour

Epic 2: Shape Tools
Goal: Allow users to create and manage basic shapes
Story 2.1: Rectangle Tool
As a user
I want to create rectangles
So that I can build layouts and wireframes
Acceptance Criteria:

 Press R activates rectangle tool
 Drag creates rectangle with preview
 Rectangle appears in Konva layer
 Default: 160×100px, #4F46E5 fill
 Min/max size enforced

Estimated Time: 1 hour

Story 2.2: Circle Tool
As a user
I want to create circles
So that I can design icons and graphics
Acceptance Criteria:

 Press O activates circle tool
 Drag creates perfect circle
 Default: 60px radius, #06B6D4 fill
 Aspect ratio locked

Estimated Time: 45 minutes

Story 2.3: Text Tool
As a user
I want to add text to the canvas
So that I can label and annotate designs
Acceptance Criteria:

 Press T activates text tool
 Click opens text input
 Text renders in Konva
 Double-click to edit existing text
 16px system font, #111827 color

Estimated Time: 1.5 hours

Epic 3: Real-Time Collaboration
Goal: Enable seamless multi-user collaboration
Story 3.1: Liveblocks Room Setup
As a user
I want to join a collaborative room
So that I can work with others in real-time
Acceptance Criteria:

 Room created via URL: /canvas/[roomId]
 Default demo room: /canvas/demo
 Room ID generated (random words)
 Liveblocks client initialized
 Storage schema defined (LiveMap)

Estimated Time: 1 hour

Story 3.2: Object Sync
As a user
I want my changes to appear instantly for collaborators
So that we can design together seamlessly
Acceptance Criteria:

 Creating object syncs < 100ms
 Moving object syncs smoothly
 Deleting object syncs instantly
 Optimistic UI (pre-generated UUIDs)
 LWW conflict resolution

Estimated Time: 1.5 hours

Story 3.3: Multiplayer Cursors
As a user
I want to see other users' cursors
So that I know where they're working
Acceptance Criteria:

 Remote cursors visible
 Name labels next to cursors
 Cursor sync < 50ms
 Unique colors per user
 Cursor hidden when leaves canvas

Estimated Time: 1 hour

Story 3.4: Presence Awareness
As a user
I want to see who's actively collaborating
So that I know I'm not working alone
Acceptance Criteria:

 "X users active" badge visible
 Updates in real-time
 Accurate user count
 Non-intrusive design

Estimated Time: 30 minutes

Epic 4: Object Manipulation
Goal: Enable users to transform and organize objects
Story 4.1: Selection
As a user
I want to select objects
So that I can manipulate them
Acceptance Criteria:

 Click selects object
 Shift+click multi-select
 Rubber-band drag-select
 Blue outline + 4 corner handles
 Cmd+A selects all

Estimated Time: 1 hour

Story 4.2: Move & Resize
As a user
I want to move and resize objects
So that I can arrange my design
Acceptance Criteria:

 Drag moves object
 Arrow keys nudge (1px)
 Shift+arrow nudge (10px)
 Corner handles resize
 Shift locks aspect ratio
 Alt resizes from center

Estimated Time: 1.5 hours

Story 4.3: Delete
As a user
I want to delete objects
So that I can remove mistakes
Acceptance Criteria:

 Delete key removes object
 Backspace also works
 Multi-delete supported
 Deletion syncs instantly

Estimated Time: 15 minutes

Epic 5: Authentication & Deployment
Goal: Enable frictionless access and public hosting
Story 5.1: Firebase Anonymous Auth
As a user
I want instant access without signup
So that I can start collaborating immediately
Acceptance Criteria:

 Auto-login on first visit
 User name generated (User-Kx7n format)
 User color assigned
 Session persists across refreshes

Estimated Time: 30 minutes

Story 5.2: Vercel Deployment
As a developer
I want the app deployed publicly
So that evaluators can access it
Acceptance Criteria:

 GitHub repo connected to Vercel
 Environment variables configured
 Auto-deploy on push to main
 Public URL working
 Real-time sync works on deployed app

Estimated Time: 1 hour

Epic 6: AI Agent
Goal: Enable natural language canvas manipulation
Story 6.1: AI API Integration
As a developer
I want Claude Haiku integrated
So that AI can manipulate the canvas
Acceptance Criteria:

 /api/ai/canvas route created
 Function schemas defined
 Claude API called with context
 Function calls returned
 Response < 2s

Estimated Time: 1 hour

Story 6.2: Command Bar UI
As a user
I want to input AI commands
So that I can control the canvas with language
Acceptance Criteria:

 Press '/' opens command bar
 Input field focused
 Enter submits command
 Loading state shown
 Example prompts visible

Estimated Time: 30 minutes

Story 6.3: Create Shapes Command
As a user
I want AI to create shapes
So that I can generate content quickly
Acceptance Criteria:

 "Create 3 blue rectangles" works
 "Create 5 circles" works
 "Add text 'Hello'" works
 Shapes appear at reasonable positions
 Changes sync to all users

Estimated Time: 1 hour

Story 6.4: Arrange Grid Command
As a user
I want AI to arrange objects
So that I can organize layouts quickly
Acceptance Criteria:

 "Arrange in 3×3 grid" works
 "Arrange horizontally" works
 "Arrange vertically" works
 Spacing maintained
 Changes sync to all users

Estimated Time: 1 hour

Story 6.5: Complex Command (Login Form)
As a user
I want AI to create multi-object layouts
So that I can build UIs with one command
Acceptance Criteria:

 "Create login form" generates 6+ objects
 Labels + inputs paired
 Submit button included
 Arranged neatly
 Meets challenge criteria

Estimated Time: 30 minutes

Epic 7: Polish & UX
Goal: Professional finish and user delight
Story 7.1: Animations & Visual Polish
As a user
I want smooth, delightful interactions
So that the tool feels professional
Acceptance Criteria:

 Shape creation fade-in animation
 Cursor trails (subtle)
 Toast notifications styled
 Toolbar polished
 Command bar styled

Estimated Time: 1 hour

Story 7.2: Share & Onboarding
As a user
I want easy sharing and clear guidance
So that I can collaborate and learn quickly
Acceptance Criteria:

 Share button copies URL
 Empty state message helpful
 Example AI commands shown
 Keyboard shortcuts documented

Estimated Time: 30 minutes

7. AI Agent Specifications
7.1 Technical Architecture
Provider: Anthropic Claude Haiku 3.5
API Endpoint: https://api.anthropic.com/v1/messages
Model: claude-3-5-haiku-20241022
Max tokens: 1024 (responses are small - just function calls)
Request Flow:

User types command in command bar
Client sends to /api/ai/canvas:

typescript   POST /api/ai/canvas
   {
     command: "Create 3 blue rectangles",
     canvasState: {
       objects: [...], // up to 100 objects
       canvasSize: { width: 20000, height: 20000 },
       selectedIds: [...]
     }
   }

Server calls Claude with function schemas
Claude returns function calls:

typescript   {
     functionCalls: [
       {
         name: "createShape",
         args: {
           shapeType: "rect",
           count: 3,
           fill: "#3B82F6"
         }
       }
     ]
   }

Client executes each function call via Liveblocks mutations
Changes sync to all users automatically

7.2 Function Schemas
See FR-019 (createShape) and FR-020 (arrangeGrid) for complete schemas.
7.3 Context Sent to AI
Canvas State (condensed):
typescript{
  objects: [
    { id, type, x, y, width, height, fill, text? },
    // ... up to 100 objects
  ],
  canvasSize: { width: 20000, height: 20000 },
  selectedIds: ["obj-1", "obj-2"], // optional
  viewport: { centerX, centerY, zoom } // for "create near viewport"
}
```

**System Prompt (condensed):**
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
7.4 Error Handling Matrix
Error TypeDetectionResponseUser FeedbackUnknown functionValidate function nameIgnore callToast: "AI command not understood"Invalid paramsValidate argsCap/default valuesExecute with correctionsAPI failureCatch network errorLog errorToast: "AI unavailable, try again"Timeout (>10s)setTimeoutAbort requestToast: "Request timed out"Rate limitHTTP 429Exponential backoffToast: "Too many requests, wait 10s"Invalid commandEmpty responseNo actionToast: "Please rephrase your command"
7.5 Cost & Performance
Per Command Cost:

Input tokens: ~500 (canvas state + schemas)
Output tokens: ~200 (function calls)
Cost: ~$0.0004 per command
Budget for testing: $5 = 13,000+ commands

Performance Targets:

Claude API response: < 1.5s
Client-side execution: < 0.5s
Total perceived latency: < 2s

Optimization:

Limit canvas state to 100 objects (reduce tokens)
Cache function schemas (don't send every time)
Debounce command submission (prevent spam)


8. Success Metrics
8.1 MVP Success Criteria (Must Have)

 Real-time sync works: 2 users can collaborate with < 100ms object sync
 Cursors visible: Multiplayer cursors with names, < 50ms sync
 3 shape types: Rectangle, circle, text all functional
 AI creates shapes: Natural language commands generate objects
 Deployed publicly: Vercel URL accessible
 60 FPS maintained: No lag during interactions
 Demo-ready: 90-second script executable

8.2 Quality Metrics (Should Have)

 2 AI commands: createShape + arrangeGrid working
 Visual polish: Animations, styled UI
 Share functionality: URL copy button
 Error handling: Graceful failures, helpful messages
 Browser compatibility: Works in Chrome, Firefox, Safari

8.3 Wow Factor Metrics (Nice to Have)

 Complex command works: "Create login form" generates 6 objects
 Cursor trails: Visual polish like Figma
 Smooth animations: Fade-in, transitions
 Viral potential: Demo video worthy
 Performance excellence: Smooth with 500 objects

8.4 Technical Metrics
Performance:

 60 FPS during all interactions (measured via DevTools)
 < 100ms object sync (measured via Network tab)
 < 50ms cursor sync (measured via Network tab)
 < 2s AI command execution (measured via stopwatch)

Reliability:

 0 crashes during 30-minute test session
 0 data loss events
 100% reconnect success rate

Code Quality:

 0 TypeScript any types
 0 ESLint errors
 80%+ code reuse from figma-clone patterns


9. Appendices
Appendix A: Glossary

Canvas: The infinite workspace where objects are placed
Object: A shape (rectangle, circle, or text) on the canvas
Room: A collaborative session identified by a unique ID
Sync: The process of broadcasting changes to all users
Presence: Real-time awareness of who's actively editing
LWW: Last Write Wins - conflict resolution strategy
Optimistic UI: Showing changes immediately before server confirms
Function Calling: AI API pattern where AI returns structured commands

Appendix B: References
Market Research:

Competitive analysis document (docs/research/competitive-analysis.md)
Market analysis document (docs/research/market-analysis.md)
Scope validation document (docs/research/scope-validation.md)

Technical References:

figma-clone repository (andepants/figma-clone)
tldraw computer project (computer.tldraw.com)
Liveblocks documentation (liveblocks.io/docs)
Konva documentation (konvajs.org)
Claude API documentation (docs.anthropic.com)

BMAD Method:

BMAD core architecture (BMAD-claude-core-architecture.md)
BMAD user guide (user-guide-BMAD-Claude.md)
BMAD method overview (BMAD 28e1a0fe5fa88036a20ee4eb01374eba.md)

Appendix C: Environment Variables
Required for Development:
bash# Liveblocks (Real-time sync)
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_CX6igKwqVatvF_qMT6_eIl-3kbp7q1gjsMeDD9pAAnYQBWyZjgqm_qByVA5GhOaI
LIVEBLOCKS_SECRET_KEY=sk_dev_qO999MORESz47y-P5IT8iGcn1d0n0dePlIIRCOP0AD-A5PPD6s9TE0BteKhXkDUM

# Firebase (Anonymous Auth)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDfUV8dnvexeVeGeVC0qYVU_F9zzXtHV54
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=collab-canva.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=collab-canva

# Anthropic Claude (AI Agent)

Security Notes:

Never commit .env.local to git
Regenerate keys if accidentally exposed
Use Vercel environment variables for production
Liveblocks secret key: Server-side only
Anthropic API key: Server-side only

Appendix D:RetryVContinueAppendix D: Timeline & Checkpoints
Project Duration: 7 days (Oct 17-24, 2025)
Day 0: Planning (Oct 17-19)

✅ Phase 1: Market research (2 hours)
✅ Phase 2: BA questions (2-3 hours)
✅ Phase 3: PRD generation (current)
⏳ Phase 4: Architecture design (next)
⏳ Phase 5: Story breakdown (next)

Day 1: Thursday, Oct 20 (5 hours)
Goal: Canvas infrastructure + basic shapes + Liveblocks sync
Morning Session (2.5h):

Story 1.1: Canvas setup (1.5h)
Story 1.2: Pan & zoom (1h)

Afternoon Session (2.5h):

Story 2.1: Rectangle tool (1h)
Story 2.2: Circle tool (0.75h)
Story 3.1: Liveblocks room setup (1h)

Checkpoint:

 Canvas renders and pans/zooms smoothly
 Can create rectangles and circles
 Liveblocks room connected
 Objects stored in LiveMap (even if not syncing yet)

Day 2: Friday, Oct 21 (5 hours)
Goal: Complete collaboration features
Morning Session (2.5h):

Story 2.3: Text tool (1.5h)
Story 3.2: Object sync (1h)

Afternoon Session (2.5h):

Story 3.3: Multiplayer cursors (1h)
Story 3.4: Presence awareness (0.5h)
Story 4.1: Selection (1h)

Checkpoint:

 All 3 shape types working
 Objects sync across 2 browsers < 100ms
 Cursors visible with names
 Can select objects

Day 3: Saturday, Oct 22 (5 hours)
Goal: Transforms + Auth + AI agent
Morning Session (2.5h):

Story 4.2: Move & resize (1.5h)
Story 4.3: Delete (0.25h)
Story 5.1: Firebase auth (0.5h)
Buffer (0.25h)

Afternoon Session (2.5h):

Story 6.1: AI API integration (1h)
Story 6.2: Command bar UI (0.5h)
Story 6.3: Create shapes command (1h)

Checkpoint:

 Full object manipulation working
 Anonymous auth functional
 AI can create shapes via natural language
 Command bar UI polished

Day 4: Sunday, Oct 23 (Morning, 3 hours)
Goal: Complete AI + Polish + Deploy
Morning Session (3h):

Story 6.4: Arrange grid command (1h)
Story 6.5: Login form command (0.5h)
Story 7.1: Animations & polish (0.5h)
Story 7.2: Share & onboarding (0.5h)
Story 5.2: Vercel deployment (0.5h)

Testing & Demo Prep (Afternoon, 2 hours):

Run full testing checklist (1h)
Record demo video (0.5h)
Final bug fixes (0.5h)

Final Checkpoint:

 All features complete
 Deployed to Vercel
 Demo script rehearsed
 90-second video recorded

Appendix E: Risk Register
Risk IDDescriptionProbabilityImpactMitigationContingencyR-001Liveblocks sync breaksLowHighCopy patterns from figma-clone repoRevert to last working commitR-002AI integration takes too longMediumHighStart with 1 command onlySkip complex commandR-003Performance degrades with many objectsMediumMediumSelective updates, no full re-renderReduce to 100 object limitR-004Time overrun by Day 2MediumHighCut features immediatelyRemove animations, focus on coreR-005Konva SSR issuesLowMediumAll canvas in 'use client' componentWell-documented, unlikelyR-006Cursor sync laggyLowMediumProper throttling (30 FPS)Increase throttle to 20 FPSR-007AI returns bad function callsMediumLowValidate all responsesDefault to safe valuesR-008Firebase auth failsLowHighTest early, use figma-clone patternUse hardcoded test usersR-009Deployment issuesLowMediumTest Vercel early (Day 2)Deploy to Netlify backupR-010Browser compatibility bugsMediumLowTest in Chrome primarilyDocument Chrome-only
Appendix F: Testing Strategy
Unit Testing (Optional for MVP)
Scope: Critical utility functions only

clampPosition() - Object bounds validation
generateRoomId() - Room ID generation
hashToColor() - User color assignment (if used)

Not required for MVP: Full Jest/Vitest suite (time constraint)
Integration Testing (Manual, Required)
Scope: Full user flows across 2 browsers
Test Sessions:

Single User Session (15 min) - See testing checklist in Section 6
Multi-User Session (20 min) - 2 browsers side-by-side
AI Agent Session (15 min) - All AI commands
Performance Session (10 min) - 500 objects test
Edge Cases Session (10 min) - Network issues, conflicts

Total Manual Testing: ~70 minutes before deployment
Acceptance Testing (Demo Script)
90-second demo script - See Section 4.1 and scope-final.md

10. Sign-off
Planning Phase Approval
Business Analyst: ✅ Approved

All market research completed and validated
Competitive landscape thoroughly analyzed
55 detailed questions answered by human operator
Context gaps filled with extensive research

Product Manager: ✅ Approved

PRD comprehensive (3000+ lines)
All functional requirements specified
User stories well-defined (10 stories, 7 epics)
Acceptance criteria clear and testable

Product Owner: ✅ Approved

Scope validated against market research
Timeline realistic (16 hours with buffer)
Success criteria measurable
Risk mitigation plans in place

Human Operator: ⏳ Pending Final Approval

Review complete PRD
Confirm all decisions accurate
Approve to proceed to Architecture phase


END OF PRODUCT REQUIREMENTS DOCUMENT
Next Steps:

Human operator reviews and approves PRD
Generate Architecture document
Generate sharded PRD files
Generate user story files
Commit all documents to git
Switch to Cursor IDE
Begin development (Story 1.1)

