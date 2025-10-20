# Performance Architecture
# CollabCanvas - Performance Architecture

**Date:** October 19, 2025  
**Status:** Approved for Development

---

## Performance Targets (from PRD)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Frame Rate** | 60 FPS | Chrome DevTools Performance profiler |
| **Object Sync Latency** | < 100ms | Network tab timestamps |
| **Cursor Sync Latency** | < 50ms | Network tab timestamps |
| **AI Command Execution** | < 2s | Stopwatch/manual testing |
| **Initial Load** | < 2s | Lighthouse |
| **Room Join** | < 1s | Manual testing |
| **500 Objects Render** | < 1s | Manual testing |
| **Concurrent Users** | 5+ | No degradation |

---

## Canvas Rendering Performance

### Target: 60 FPS (16.67ms per frame)

### Strategy 1: Stage-Level Transforms (GPU-Accelerated)

**Pattern from figma-clone:**
```typescript
// ✅ GOOD - Transform entire stage (GPU-accelerated)
stage.x(cameraX);
stage.y(cameraY);
stage.scale({ x: zoom, y: zoom });

// ❌ BAD - Transform each shape individually (CPU-bound)
shapes.forEach(shape => {
  shape.x(shape.x() * zoom + cameraX);
  shape.y(shape.y() * zoom + cameraY);
});
```

**Why this works:**
- Single GPU operation vs 500+ CPU operations
- No per-shape calculations
- CSS transform-like performance
- Konva handles optimization internally

**Performance gain:** 10-20x faster for pan/zoom

---

### Strategy 2: Selective Updates (No Full Re-render)

**Pattern from figma-clone:**
```typescript
const shapeRefs = useRef<Map<string, Konva.Shape>>(new Map());

// Update only changed properties
useEffect(() => {
  objects?.forEach((obj, id) => {
    const shape = shapeRefs.current.get(id);
    if (shape) {
      // Only update if value changed
      if (shape.x() !== obj.x) shape.x(obj.x);
      if (shape.y() !== obj.y) shape.y(obj.y);
      if (shape.width() !== obj.width) shape.width(obj.width);
      if (shape.height() !== obj.height) shape.height(obj.height);
    }
  });
  
  layer.batchDraw(); // Single re-render
}, [objects]);
```

**Why this works:**
- No React re-render cascade
- Direct Konva API calls (faster)
- Batch draw (single canvas paint)
- Change detection prevents unnecessary updates

**Performance gain:** 5-10x faster than full re-render

---

### Strategy 3: Memory Management

```typescript
// Cleanup deleted shapes
useEffect(() => {
  const currentIds = new Set(objects?.keys() || []);
  
  shapeRefs.current.forEach((shape, id) => {
    if (!currentIds.has(id)) {
      shape.destroy();         // Free Konva memory
      shapeRefs.current.delete(id); // Remove ref
    }
  });
}, [objects]);
```

**Why this works:**
- Prevents memory leaks
- Maintains consistent performance over time
- No canvas bloat

**Performance impact:** Prevents FPS degradation over time

---

### Strategy 4: Single Layer Architecture

```typescript
<Stage>
  <Layer>
    {/* All shapes in one layer */}
  </Layer>
</Stage>
```

**Why single layer:**
- Simpler state management
- No layer ordering overhead
- Single draw call per frame
- Sufficient for 500+ objects

**Alternative (if needed):**
- Add second layer only for UI elements (cursors, selection)
- Keep shapes in bottom layer

---

## Network Performance

### Target: < 100ms object sync, < 50ms cursor sync

### Strategy 1: Throttling High-Frequency Updates

```typescript
import { throttle } from 'lodash';

// Object updates: 30 FPS (33ms)
const throttledObjectUpdate = useMemo(
  () => throttle((id: string, x: number, y: number) => {
    updateObject(id, { x, y });
  }, 33), // 30 FPS
  [updateObject]
);

// Cursor updates: 30 FPS (33ms)
const throttledCursorUpdate = useMemo(
  () => throttle((x: number, y: number) => {
    updateMyPresence({ cursor: { x, y } });
  }, 33), // 30 FPS
  [updateMyPresence]
);
```

**Why 30 FPS:**
- Balances smoothness vs bandwidth
- Exceeds target (< 100ms = 10 FPS minimum)
- Proven in figma-clone repo
- Human perception: 24 FPS = smooth

**Bandwidth savings:**
- Without throttle: 60 updates/sec = 3.6K updates/min
- With throttle: 30 updates/sec = 1.8K updates/min
- **50% reduction**

---

### Strategy 2: Optimistic UI (Pre-generated UUIDs)

```typescript
// ✅ GOOD - Optimistic update
const handleCreate = useCallback(() => {
  const id = nanoid(); // Pre-generate UUID
  
  const newObject = { id, ...data };
  
  // Both happen simultaneously
  renderShapeLocally(newObject);  // Konva (0ms perceived latency)
  createObject(newObject);         // Liveblocks mutation
}, [createObject]);

// ❌ BAD - Wait for server
const handleCreate = useCallback(async () => {
  const newObject = await createObjectOnServer(data); // Wait 100ms
  renderShapeLocally(newObject); // Then render
}, []);
```

**Why this works:**
- 0ms perceived latency (instant feedback)
- Pre-generated UUID prevents conflicts
- Liveblocks handles sync in background

**Performance gain:** Instant vs 100ms delay = infinitely faster

---

### Strategy 3: Payload Optimization

```typescript
// ✅ GOOD - Send only changed properties
updateObject(id, { x: newX, y: newY });

// ❌ BAD - Send entire object
updateObject(id, { ...entireObject });
```

**Payload size comparison:**
```
Changed properties: ~50 bytes
Entire object:      ~200 bytes
Savings:            75% reduction
```

---

### Strategy 4: Liveblocks Configuration

```typescript
const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
  throttle: 33, // 30 FPS (built-in throttling)
});
```

**Why this works:**
- Liveblocks batches updates automatically
- WebSocket for low latency
- Auto-reconnect on network issues

---

## AI Performance

### Target: < 2s total execution time

### Latency Breakdown

```
Total target: < 2s

1. Client → Server:     ~50ms   (Next.js API route)
2. Server → Claude:     ~100ms  (Network)
3. Claude processing:   ~1000ms (AI inference)
4. Claude → Server:     ~100ms  (Network)
5. Function execution:  ~300ms  (Canvas mutations)
6. Liveblocks sync:     ~100ms  (Broadcast)

Total: ~1,650ms ✓ (within target)
```

---

### Strategy 1: Limit Canvas State Size

```typescript
// Send max 100 objects to Claude
const canvasState = {
  objects: objects.slice(0, 100).map(obj => ({
    id: obj.id,
    type: obj.type,
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
    fill: obj.fill,
  })),
  // ... rest
};
```

**Why limit to 100:**
- Reduces token count (faster inference)
- Sufficient context for most commands
- Cost savings

**Token comparison:**
```
100 objects: ~4,000 tokens (~1.2s inference)
500 objects: ~20,000 tokens (~2.5s inference)
```

---

### Strategy 2: Function Schema Caching

```typescript
// Define schemas once (module level)
const tools = [
  { name: 'createShape', ...schema },
  { name: 'arrangeGrid', ...schema },
];

// Reuse in every request
await anthropic.messages.create({
  tools, // Same reference
  ...
});
```

**Why cache:**
- No re-parsing schemas
- Faster API calls
- Consistent across requests

---

### Strategy 3: Debounce Command Submission

```typescript
const debouncedSubmit = useMemo(
  () => debounce((command: string) => {
    executeAICommand(command);
  }, 500), // Wait 500ms after last keystroke
  []
);
```

**Why debounce:**
- Prevents spam (user typing)
- Reduces API calls
- Better UX (wait for complete command)

---

## Load Performance

### Target: < 2s initial load

### Strategy 1: Code Splitting (Automatic)

```typescript
// Next.js automatically splits:
- Each route into separate bundle
- Each page component
- node_modules into shared chunks
```

**Bundle sizes (estimated):**
```
Framework:        ~100KB (React, Next.js)
Liveblocks:       ~50KB
Konva:            ~150KB
Firebase:         ~40KB
Main app code:    ~50KB
Total:            ~390KB gzipped
```

**Load time on 3G:** ~1.3s ✓

---

### Strategy 2: Lazy Load Non-Critical

```typescript
// Command bar (only load when user presses '/')
const CommandBar = dynamic(() => import('@/components/CommandBar'), {
  loading: () => null,
});
```

---

### Strategy 3: Vercel Edge Network

- Global CDN
- 99.99% uptime
- Automatic caching
- No configuration needed

---

## Measurement & Monitoring

### Development Tools

**Chrome DevTools Performance:**
```
1. Open DevTools
2. Performance tab
3. Record
4. Interact with canvas (pan, zoom, create shapes)
5. Stop
6. Check FPS (should be ~60)
7. Check frame times (should be < 16.67ms)
```

**Network Tab:**
```
1. Open DevTools
2. Network tab
3. Filter: WS (WebSocket)
4. Create/move object
5. Check timing (should be < 100ms)
```

---

### Production Monitoring

**Vercel Analytics (free tier):**
- Page load times
- Core Web Vitals
- Real user monitoring

**Manual Testing Checklist:**
- [ ] 60 FPS during pan/zoom (DevTools)
- [ ] < 100ms object sync (2 browser test)
- [ ] < 50ms cursor sync (2 browser test)
- [ ] < 2s AI commands (stopwatch)
- [ ] No lag with 500+ objects
- [ ] No lag with 5+ users

---

## Performance Degradation Scenarios

### Scenario 1: Many Objects (1000+)

**Symptoms:**
- FPS drops below 60
- Sluggish pan/zoom

**Solution:**
```typescript
// Virtualization (if needed)
const visibleObjects = objects.filter(obj => {
  return isInViewport(obj, viewport);
});

// Only render visible objects
{visibleObjects.map(obj => <Shape />)}
```

---

### Scenario 2: High Network Latency

**Symptoms:**
- Sync > 100ms
- Cursors laggy

**Solution:**
- Already using optimistic UI (instant feedback)
- Already throttling (30 FPS max)
- No further optimization needed

---

### Scenario 3: Many Concurrent Users (10+)

**Symptoms:**
- Bandwidth issues
- FPS drops

**Solution:**
```typescript
// Increase throttle (reduce update frequency)
const throttle = concurrentUsers > 10 ? 50 : 33; // 20 FPS vs 30 FPS
```

---

## Performance Anti-Patterns (Avoid)

### ❌ Full React Re-render
```typescript
// BAD - Triggers full re-render
const [objects, setObjects] = useState<CanvasObject[]>([]);
setObjects([...objects, newObject]);
```

### ❌ Individual Shape Transforms
```typescript
// BAD - CPU-bound, slow
shapes.forEach(shape => {
  shape.x(shape.x() * zoom);
  shape.y(shape.y() * zoom);
});
```

### ❌ No Throttling
```typescript
// BAD - Floods network
onMouseMove={(e) => {
  updateObject(id, { x: e.clientX, y: e.clientY }); // 60+ times per second
}}
```

### ❌ Blocking Operations
```typescript
// BAD - Blocks UI thread
const result = expensiveCalculation(); // Synchronous
setState(result);
```

---

## Performance Checklist

### Before Deployment
- [ ] Test with 500 objects: FPS ≥ 60
- [ ] Test with 5 users: No degradation
- [ ] Object sync < 100ms (2 browser test)
- [ ] Cursor sync < 50ms (2 browser test)
- [ ] AI commands < 2s (10 test commands)
- [ ] No memory leaks (24 hour soak test)
- [ ] Lighthouse score > 90

### During Development
- [ ] Use Chrome Performance profiler regularly
- [ ] Check Network tab for sync latency
- [ ] Test on slower machine (if available)
- [ ] Test on slower network (throttle to 3G)

---

## Related Documents

- **Coding Standards:** See `coding-standards.md`
- **ADR-0001:** Liveblocks performance rationale
- **ADR-0002:** Konva performance rationale
- **Component Structure:** See `component-structure.md`