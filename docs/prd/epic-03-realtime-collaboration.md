# Epic 3: Real-Time Collaboration

**Goal:** Enable seamless multi-user collaboration

**Priority:** P0 (Critical)  
**Estimated Time:** 4 hours  
**Dependencies:** Epic 1 (Canvas), Epic 2 (Shapes)

---

## Overview

This epic integrates Liveblocks for real-time synchronization. It replaces local state with Liveblocks storage, implements multiplayer cursors, and adds presence awareness.

**Technical Foundation:**
- Liveblocks client with Lson storage
- RoomProvider wrapping canvas page
- LiveMap for object storage
- Presence API for cursors

---

## Stories

### Story 3.1: Liveblocks Room Setup

**As a user**  
I want to join a collaborative room  
So that I can work with others in real-time

**Acceptance Criteria:**
- [ ] Room created via URL: /canvas/[roomId]
- [ ] Default demo room: /canvas/demo
- [ ] Room ID generated (random words)
- [ ] Liveblocks client initialized
- [ ] Storage schema defined (LiveMap)

**Technical Specifications:**
```typescript
// lib/liveblocks.ts
import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
  throttle: 33, // 30 FPS
});

type Storage = {
  objects: LiveMap<string, LiveObject<CanvasObject>>;
};

type Presence = {
  cursor: { x: number; y: number } | null;
  userName: string;
  userColor: string;
};

export const {
  RoomProvider,
  useStorage,
  useMutation,
  useOthers,
  useUpdateMyPresence,
} = createRoomContext<Presence, Storage>(client);

// app/canvas/[roomId]/page.tsx
export default function CanvasPage({ params }: { params: { roomId: string } }) {
  return (
    <RoomProvider
      id={params.roomId}
      initialPresence={{
        cursor: null,
        userName: '',
        userColor: '',
      }}
      initialStorage={{
        objects: new LiveMap(),
      }}
    >
      <Canvas />
    </RoomProvider>
  );
}
```

**Tasks:**
1. [ ] Install @liveblocks/client, @liveblocks/react
2. [ ] Create lib/liveblocks.ts with client
3. [ ] Define Storage and Presence types
4. [ ] Create RoomProvider in canvas/[roomId]/page.tsx
5. [ ] Generate room IDs (adjective-noun-number)
6. [ ] Test connection with 2 browser tabs

**Estimated Time:** 1 hour

---

### Story 3.2: Object Sync

**As a user**  
I want my changes to appear instantly for collaborators  
So that we can design together seamlessly

**Acceptance Criteria:**
- [ ] Creating object syncs < 100ms
- [ ] Moving object syncs smoothly
- [ ] Deleting object syncs instantly
- [ ] Optimistic UI (pre-generated UUIDs)
- [ ] LWW conflict resolution

**Technical Specifications:**
```typescript
// Mutations
const createObject = useMutation(
  ({ storage }, obj: CanvasObject) => {
    storage.get('objects').set(obj.id, new LiveObject(obj));
  },
  []
);

const updateObject = useMutation(
  ({ storage }, id: string, updates: Partial<CanvasObject>) => {
    const obj = storage.get('objects').get(id);
    if (obj) {
      Object.entries(updates).forEach(([key, value]) => {
        obj.set(key as keyof CanvasObject, value);
      });
    }
  },
  []
);

const deleteObject = useMutation(
  ({ storage }, id: string) => {
    storage.get('objects').delete(id);
  },
  []
);

// Read storage
const objects = useStorage((root) => root.objects);

// Optimistic create (from figma-clone pattern)
const handleCreate = useCallback(() => {
  const id = nanoid(); // Pre-generate UUID
  const newObj = { id, ...shapeData };
  
  createObject(newObj); // Mutation happens immediately
}, [createObject]);

// Throttled update for drag
const throttledUpdate = useMemo(
  () => throttle((id: string, x: number, y: number) => {
    updateObject(id, { x, y });
  }, 33), // 30 FPS
  [updateObject]
);
```

**Tasks:**
1. [ ] Replace local state with useStorage hook
2. [ ] Create useMutation hooks (create, update, delete)
3. [ ] Update shape creation to use Liveblocks
4. [ ] Implement optimistic UI pattern
5. [ ] Throttle drag updates to 30 FPS
6. [ ] Test sync with 2 browsers
7. [ ] Measure sync latency (< 100ms)

**Estimated Time:** 1.5 hours

---

### Story 3.3: Multiplayer Cursors

**As a user**  
I want to see other users' cursors  
So that I know where they're working

**Acceptance Criteria:**
- [ ] Remote cursors visible
- [ ] Name labels next to cursors
- [ ] Cursor sync < 50ms
- [ ] Unique colors per user
- [ ] Cursor hidden when leaves canvas

**Technical Specifications:**
```typescript
// Update my cursor
const updateMyPresence = useUpdateMyPresence();

const handleMouseMove = useCallback((e: KonvaEventObject) => {
  const stage = stageRef.current;
  const pos = stage.getPointerPosition();
  
  // Transform to canvas coordinates (account for zoom/pan)
  const transform = stage.getAbsoluteTransform().copy().invert();
  const canvasPos = transform.point(pos);
  
  throttledCursorUpdate(canvasPos.x, canvasPos.y);
}, []);

const throttledCursorUpdate = useMemo(
  () => throttle((x: number, y: number) => {
    updateMyPresence({ cursor: { x, y } });
  }, 33), // 30 FPS
  [updateMyPresence]
);

// Render other cursors
const others = useOthers();

return (
  <>
    {others.map((user) => (
      user.presence.cursor && (
        <Cursor
          key={user.connectionId}
          x={user.presence.cursor.x}
          y={user.presence.cursor.y}
          name={user.presence.userName}
          color={user.presence.userColor}
        />
      )
    ))}
  </>
);
```

**Tasks:**
1. [ ] Create Cursor component
2. [ ] Update presence on mouse move (throttled)
3. [ ] Transform cursor coords (account for zoom/pan)
4. [ ] Render remote cursors
5. [ ] Add name labels
6. [ ] Hide cursor on mouse leave
7. [ ] Test with 3+ users

**Estimated Time:** 1 hour

---

### Story 3.4: Presence Awareness

**As a user**  
I want to see who's actively collaborating  
So that I know I'm not working alone

**Acceptance Criteria:**
- [ ] "X users active" badge visible
- [ ] Updates in real-time
- [ ] Accurate user count
- [ ] Non-intrusive design

**Technical Specifications:**
```typescript
// PresenceBadge component
export function PresenceBadge() {
  const others = useOthers();
  const userCount = others.length + 1; // +1 for self
  
  return (
    <div className="fixed top-4 right-4 bg-white rounded-full px-4 py-2 shadow-md">
      <span className="text-sm font-medium">
        {userCount} {userCount === 1 ? 'user' : 'users'} active
      </span>
    </div>
  );
}
```

**Tasks:**
1. [ ] Create PresenceBadge component
2. [ ] Use useOthers() hook
3. [ ] Calculate count (others.length + 1)
4. [ ] Style badge (top-right, non-intrusive)
5. [ ] Test with users joining/leaving

**Estimated Time:** 30 minutes

---

## Definition of Done

- [ ] Liveblocks room functional
- [ ] Objects sync < 100ms across users
- [ ] Cursors sync < 50ms
- [ ] Presence badge shows correct count
- [ ] Optimistic UI implemented
- [ ] Tested with 2-3 users simultaneously
- [ ] No ghost objects or duplicates
- [ ] Code follows architecture patterns

---

## Dependencies for Next Epic

Epic 4 (Object Manipulation) requires:
- Liveblocks storage working
- Object sync functional
- Mutation hooks available

---

## Notes

**Reference Pattern (figma-clone):**
Copy Liveblocks integration patterns directly from figma-clone repo.

**Performance:**
- Throttle cursor updates: 30 FPS (33ms)
- Throttle object drag updates: 30 FPS (33ms)
- Use optimistic UI for instant feedback

**Testing:**
- Open 2 browser tabs side-by-side
- Create shapes in one, verify they appear in other
- Move cursor, verify it appears in other tab
- Measure sync latency with Network tab

**Common Issues:**
- Cursors disappear: Check coordinate transformation
- Sync lag: Verify throttle settings (33ms)
- Objects duplicate: Ensure UUIDs pre-generated