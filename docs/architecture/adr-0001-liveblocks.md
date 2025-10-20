# ADR-0001: Real-Time Sync with Liveblocks

**Date:** 2025-10-19  
**Status:** Accepted  
**Decision Makers:** Architect, Product Owner

---

## Context

CollabCanvas requires real-time synchronization for collaborative canvas editing. Multiple users need to see each other's changes instantly (< 100ms for objects, < 50ms for cursors) while maintaining 60 FPS performance.

### Requirements
- Real-time object sync (< 100ms latency)
- Real-time cursor tracking (< 50ms latency)
- Presence awareness (who's online)
- Data persistence (survives all users leaving)
- Conflict resolution (multiple users editing)
- 5+ concurrent users support
- Simple integration (limited development time)

### Options Considered

1. **Liveblocks** (managed service)
2. **Socket.io** (custom server)
3. **Supabase Realtime**
4. **Firebase Realtime Database**
5. **Y.js + Custom Backend**

---

## Decision

**Use Liveblocks with Lson storage** (NOT Y.js)

---

## Rationale

### Why Liveblocks

✅ **Purpose-built for collaborative apps**
- Designed specifically for real-time collaboration
- Built-in presence, storage, and conflict resolution
- Optimized for low-latency sync

✅ **Proven in production**
- Used successfully in figma-clone repo (andepants)
- 80% code reuse opportunity from reference repo
- Production-tested patterns available
- Saves 3-5 hours development time

✅ **Built-in features**
- WebSocket with auto-reconnect
- Presence API (cursors, online users)
- Storage API (persistent state)
- Conflict resolution (Last Write Wins)
- No server required (serverless)

✅ **Performance**
- < 100ms sync latency proven in competitive testing
- < 50ms cursor sync achievable
- Handles 5+ concurrent users easily
- Efficient bandwidth usage (throttled updates)

✅ **Free tier sufficient**
- 100 MAU (Monthly Active Users)
- Unlimited rooms
- Persistent storage included
- No credit card required for development

✅ **Developer experience**
- React hooks (useStorage, useMutation, useOthers)
- TypeScript support
- Excellent documentation
- Simple API

---

### Why Lson over Y.js

✅ **Simpler API**
```typescript
// Lson (simple)
const updateObject = useMutation(({ storage }, id, x, y) => {
  const obj = storage.get('objects').get(id);
  obj.set('x', x);
  obj.set('y', y);
}, []);

// Y.js (complex)
const yMap = yDoc.getMap('objects');
const yObj = yMap.get(id);
yObj.set('x', x);
yDoc.transact(() => {
  // More complex logic
});
```

✅ **No CRDT complexity needed**
- Our use case: Canvas with Last Write Wins
- Y.js: CRDT for text editing (overkill for shapes)
- Lson: Simple mutations, predictable behavior

✅ **Proven in figma-clone**
- Reference repo uses Lson successfully
- Can copy patterns directly
- Already validated for canvas use case

✅ **Last Write Wins acceptable**
- Documented in PRD as acceptable strategy
- Simple conflict resolution
- No merge conflicts to resolve

---

### Why NOT Socket.io

❌ **Requires custom server**
- Must build and maintain WebSocket server
- Deployment complexity (server + client)
- Costs 4-6 hours extra development time

❌ **No built-in storage**
- Must implement persistence layer
- Must handle reconnection state
- Must implement presence manually

❌ **Must implement conflict resolution**
- Manual conflict handling
- Complex edge cases (disconnects, race conditions)
- More code to maintain

---

### Why NOT Supabase Realtime

❌ **Not optimized for high-frequency updates**
- Built for database changes (slower)
- Cursor updates would be too slow
- HTTP polling vs WebSocket (higher latency)

❌ **More complex state management**
- SQL-based (need to map to canvas objects)
- Triggers and functions required
- More moving parts

---

### Why NOT Firebase Realtime Database

❌ **Higher latency**
- Optimized for mobile (not canvas collaboration)
- Cursor sync would exceed 50ms target
- Less predictable performance

❌ **More complex queries**
- JSON tree structure
- Harder to model canvas objects
- Less intuitive API for our use case

---

## Implementation

### Client Setup

**File:** `lib/liveblocks.ts`

```typescript
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
```

### Room Structure

**URL pattern:** `/canvas/[roomId]`  
**Room ID format:** Random words (adjective-noun-number)  
**Example:** `/canvas/happy-turtle-42`

### Storage Schema

```typescript
type CanvasObject = {
  id: string;              // nanoid()
  type: 'rect' | 'circle' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  zIndex: number;
  text?: string;
  fontSize?: number;
};
```

### Mutation Pattern (Optimistic UI)

```typescript
const createObject = useMutation(
  ({ storage }, obj: CanvasObject) => {
    storage.get('objects').set(obj.id, new LiveObject(obj));
  },
  []
);

// Usage with pre-generated UUID
const id = nanoid();
const newObject = { id, ...data };
createObject(newObject); // Instant local render
```

### Throttling Strategy

```typescript
// Object updates: 30 FPS (33ms)
const throttledUpdate = throttle((id, x, y) => {
  updateObject(id, { x, y });
}, 33);

// Cursor updates: 30 FPS (33ms)
const throttledCursor = throttle((x, y) => {
  updateMyPresence({ cursor: { x, y } });
}, 33);
```

---

## Consequences

### Positive

✅ **Faster development**
- 3-5 hours saved by copying figma-clone patterns
- No server to build or maintain
- Built-in features (presence, storage, sync)

✅ **Battle-tested reliability**
- Proven in production applications
- Auto-reconnect handled by Liveblocks
- 99.9% uptime SLA

✅ **Meets performance targets**
- < 100ms object sync ✓
- < 50ms cursor sync ✓
- 60 FPS maintained ✓

✅ **Simple codebase**
- Less code to write and maintain
- Clear separation of concerns
- Easy to debug

---

### Negative

⚠️ **Vendor lock-in**
- Dependent on Liveblocks service
- Migration would require significant refactoring
- Must trust third-party service

⚠️ **Free tier limit**
- 100 MAU limit on free tier
- Must upgrade if exceeds limit
- Cost: $99/month for next tier

⚠️ **Less control**
- Cannot customize sync algorithm
- Cannot optimize for specific use cases
- Limited to Liveblocks features

---

### Mitigation

✅ **Free tier sufficient for MVP/demo**
- 100 MAU more than enough for challenge
- Can evaluate alternatives post-MVP
- Pay-as-you-go pricing available

✅ **Can migrate later if needed**
- Abstract Liveblocks behind interface
- Socket.io fallback possible
- Data export available

✅ **Liveblocks reliable**
- 99.9% uptime SLA
- Used by production apps
- Active development and support

---

## Alternatives Revisited

If Liveblocks becomes unsuitable (cost, vendor lock-in), alternatives:

1. **Socket.io + Redis**
   - Full control, self-hosted
   - Cost: Development time + hosting

2. **Supabase Realtime + Postgres**
   - Self-hosted option available
   - Cost: Database hosting

3. **PartyKit**
   - Similar to Liveblocks, newer
   - Cost: Similar pricing model

---

## References

- **Liveblocks docs:** https://liveblocks.io/docs
- **figma-clone repo:** https://github.com/andepants/figma-clone
- **Competitive analysis:** docs/research/competitive-analysis.md
- **PRD requirements:** docs/prd/functional-requirements.md (FR-011 through FR-015)

---

## Review Schedule

**Next review:** After MVP deployment  
**Criteria for change:**
- Cost exceeds budget
- Performance issues discovered
- Feature limitations encountered
- Better alternative emerges