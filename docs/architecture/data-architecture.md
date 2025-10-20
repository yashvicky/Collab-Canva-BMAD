# Data Architecture
# CollabCanvas - Data Architecture

**Date:** October 19, 2025  
**Status:** Approved for Development

---

## Liveblocks Storage Schema

### Storage Root Type
```typescript
type Storage = {
  objects: LiveMap<string, LiveObject<CanvasObject>>;
};
```

### Canvas Object Schema
```typescript
type CanvasObject = {
  id: string;              // nanoid() - e.g., "vX7kR2pQ"
  type: 'rect' | 'circle' | 'text';
  x: number;               // Canvas position (0-20000)
  y: number;
  width: number;
  height: number;
  fill: string;            // Hex color: "#4F46E5"
  zIndex: number;          // Timestamp: Date.now()
  text?: string;           // For text objects only
  fontSize?: number;       // For text (16px default)
};
```

**Key Design Decisions:**
- ✅ LiveMap for O(1) lookups by ID
- ✅ LiveObject for individual property mutations
- ✅ nanoid() for shorter IDs (11 chars vs UUID 36 chars)
- ✅ zIndex as timestamp (simple ordering)

---

## Storage Operations

### Create Object
```typescript
import { nanoid } from 'nanoid';

const createObject = useMutation(
  ({ storage }, obj: CanvasObject) => {
    storage.get('objects').set(obj.id, new LiveObject(obj));
  },
  []
);

// Usage (with optimistic UI)
const handleCreate = useCallback(() => {
  const id = nanoid(); // Pre-generate UUID
  const newObject: CanvasObject = {
    id,
    type: 'rect',
    x: 100,
    y: 100,
    width: 160,
    height: 100,
    fill: '#4F46E5',
    zIndex: Date.now(),
  };
  
  createObject(newObject); // Mutation happens immediately
}, [createObject]);
```

### Update Object
```typescript
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

// Usage (throttled for drag)
const throttledUpdate = useMemo(
  () => throttle((id: string, x: number, y: number) => {
    updateObject(id, { x, y });
  }, 33), // 30 FPS
  [updateObject]
);
```

### Delete Object
```typescript
const deleteObject = useMutation(
  ({ storage }, id: string) => {
    storage.get('objects').delete(id);
  },
  []
);
```

### Read Storage
```typescript
const objects = useStorage((root) => root.objects);

// Convert to array for rendering
const objectsArray = useMemo(
  () => Array.from(objects?.entries() || []),
  [objects]
);
```

---

## Presence State Schema

### Presence Type
```typescript
type Presence = {
  cursor: { x: number; y: number } | null;
  userName: string;       // "User-Kx7n"
  userColor: string;      // "#4F46E5"
};
```

### Update Presence
```typescript
const updateMyPresence = useUpdateMyPresence();

// Throttled cursor update (30 FPS)
const throttledCursorUpdate = useMemo(
  () => throttle((x: number, y: number) => {
    updateMyPresence({ cursor: { x, y } });
  }, 33), // 30 FPS
  [updateMyPresence]
);

// Hide cursor when leaving canvas
const handleMouseLeave = useCallback(() => {
  updateMyPresence({ cursor: null });
}, [updateMyPresence]);
```

### Read Others' Presence
```typescript
const others = useOthers();

// Render remote cursors
const remoteCursors = others.map((user) => ({
  id: user.connectionId,
  cursor: user.presence.cursor,
  userName: user.presence.userName,
  userColor: user.presence.userColor,
}));
```

---

## Liveblocks Client Setup

### lib/liveblocks.ts
```typescript
import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';
import type { LiveMap, LiveObject } from '@liveblocks/client';

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
  throttle: 33, // 30 FPS (matches our spec)
});

// Type definitions
type Storage = {
  objects: LiveMap<string, LiveObject<CanvasObject>>;
};

type Presence = {
  cursor: { x: number; y: number } | null;
  userName: string;
  userColor: string;
};

// Create room context with types
export const {
  RoomProvider,
  useStorage,
  useMutation,
  useOthers,
  useUpdateMyPresence,
} = createRoomContext<Presence, Storage>(client);
```

---

## Room Setup

### app/canvas/[roomId]/page.tsx
```typescript
'use client';

import { RoomProvider } from '@/lib/liveblocks';
import { LiveMap } from '@liveblocks/client';
import { Canvas } from '@/components/Canvas';

export default function CanvasPage({ 
  params 
}: { 
  params: { roomId: string } 
}) {
  return (
    <RoomProvider
      id={params.roomId}
      initialPresence={{
        cursor: null,
        userName: '', // Set after Firebase auth
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

---

## Firebase Auth Data

### User Structure
```typescript
// Firebase anonymous auth
import { getAuth, signInAnonymously } from 'firebase/auth';

const auth = getAuth();
const userCredential = await signInAnonymously(auth);

// Generate user data
const userId = userCredential.user.uid; // "Kx7n2Pq8WtR3..."
const userName = `User-${userId.slice(-4)}`; // "User-tR3..."
const userColor = USER_COLORS[Math.floor(Math.random() * 10)];

// Set in Liveblocks presence
updateMyPresence({ userName, userColor });
```

### User Color Palette
```typescript
export const USER_COLORS = [
  '#4F46E5', // indigo
  '#EC4899', // pink
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EF4444', // red
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#A855F7', // purple
];
```

---

## Data Flow Patterns

### Optimistic Updates
```typescript
// Pattern: Pre-generate ID, mutate immediately
const handleCreateShape = useCallback(() => {
  const id = nanoid(); // Generate before mutation
  
  const newShape: CanvasObject = {
    id,
    type: activeTool,
    x: mousePos.x,
    y: mousePos.y,
    width: 160,
    height: 100,
    fill: getDefaultColor(activeTool),
    zIndex: Date.now(),
  };
  
  // Both happen simultaneously
  createObject(newShape);        // Liveblocks mutation
  renderShapeLocally(newShape);  // Konva render
  
  // Result: 0ms perceived latency
}, [activeTool, mousePos, createObject]);
```

### Conflict Resolution
**Strategy:** Last Write Wins (LWW)
- Liveblocks default behavior
- Acceptable for MVP (documented in PRD)
- Simple, no complex CRDT logic needed

**Example:**
```
Time 0:  Object at (100, 100)
Time 1:  User A moves to (200, 100)
Time 1:  User B moves to (100, 200) (simultaneous)
Result:  Whichever arrives last wins
```

### Throttling Strategy
```typescript
// Cursor updates: 30 FPS (33ms)
const throttledCursor = throttle((x, y) => {
  updateMyPresence({ cursor: { x, y } });
}, 33);

// Object drag updates: 30 FPS (33ms)
const throttledDrag = throttle((id, x, y) => {
  updateObject(id, { x, y });
}, 33);

// Why 30 FPS?
// - Balances smoothness vs bandwidth
// - Exceeds target (< 100ms = 10 FPS minimum)
// - Proven in figma-clone repo
```

---

## Data Persistence

### Room Persistence
- **Storage:** All objects persist in Liveblocks cloud
- **Duration:** Indefinite (free tier)
- **Behavior:** Room survives all users leaving
- **On reconnect:** Full state reloaded automatically

### User Session Persistence
- **Firebase:** Session persists across page refreshes
- **Duration:** Until user clears cookies/storage
- **Anonymous UID:** Consistent until cleared

---

## Performance Considerations

### Memory Management
```typescript
// Cleanup deleted shapes
useEffect(() => {
  const currentIds = new Set(objects?.keys() || []);
  
  // Remove Konva shapes for deleted objects
  shapeRefs.current.forEach((shape, id) => {
    if (!currentIds.has(id)) {
      shape.destroy();         // Free Konva memory
      shapeRefs.current.delete(id); // Remove ref
    }
  });
}, [objects]);
```

### Selective Updates
```typescript
// Don't re-render everything
const shapeRefs = useRef<Map<string, Konva.Shape>>(new Map());

// Update only changed properties
useEffect(() => {
  objects?.forEach((obj, id) => {
    const shape = shapeRefs.current.get(id);
    if (shape) {
      // Selective property updates
      if (shape.x() !== obj.x) shape.x(obj.x);
      if (shape.y() !== obj.y) shape.y(obj.y);
      if (shape.width() !== obj.width) shape.width(obj.width);
      if (shape.height() !== obj.height) shape.height(obj.height);
    }
  });
  
  layer.batchDraw(); // Single draw call
}, [objects]);
```

---

## Error Handling

### Liveblocks Errors
```typescript
const createObject = useMutation(
  ({ storage }, obj: CanvasObject) => {
    try {
      storage.get('objects').set(obj.id, new LiveObject(obj));
    } catch (error) {
      console.error('Failed to create object:', error);
      toast.error('Failed to create object');
    }
  },
  []
);
```

### Disconnection Handling
```typescript
// Liveblocks auto-reconnects
// Status exposed via hooks
const status = useStatus();

if (status === 'disconnected') {
  // Show reconnecting toast
  toast('Reconnecting...', { duration: Infinity });
}

if (status === 'connected') {
  // Dismiss toast
  toast.dismiss();
}
```

---

## Related Documents

- **Component Structure:** See `component-structure.md`
- **Coding Standards:** See `coding-standards.md`
- **ADR-0001:** See `adr-0001-liveblocks.md` for sync decision rationale