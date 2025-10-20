# Coding Standards
# CollabCanvas - Coding Standards

**Date:** October 19, 2025  
**Status:** Approved for Development

---

## TypeScript Standards

### Strict Rules

```typescript
// ✅ GOOD - Explicit types
function createObject(x: number, y: number): CanvasObject {
  return {
    id: nanoid(),
    type: 'rect',
    x,
    y,
    width: 160,
    height: 100,
    fill: '#4F46E5',
    zIndex: Date.now(),
  };
}

// ✅ GOOD - Type imports with 'type' keyword
import type { CanvasObject } from '@/types/canvas';
import type { Tool } from '@/types/canvas';

// ✅ GOOD - Union types for variants
type ShapeType = 'rect' | 'circle' | 'text';
type Tool = 'select' | 'rect' | 'circle' | 'text';

// ❌ BAD - NEVER USE 'any'
function badFunction(data: any) { } // ERROR

// ❌ BAD - No implicit any
function badFunction2(data) { } // ERROR

// ❌ BAD - No non-null assertions without comment
const obj = objects.get(id)!; // ERROR - use if check instead

// ✅ GOOD - Check before using
const obj = objects.get(id);
if (obj) {
  obj.set('x', newX);
}
```

---

## Type Organization

### types/canvas.ts
```typescript
export type CanvasObject = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  zIndex: number;
  text?: string;
  fontSize?: number;
};

export type ShapeType = 'rect' | 'circle' | 'text';

export type Tool = 'select' | 'rect' | 'circle' | 'text';

export type Viewport = {
  x: number;
  y: number;
  zoom: number;
};
```

---

## React Patterns

### Server vs Client Components

```typescript
// ✅ Server Component (default)
// app/page.tsx
export default function HomePage() {
  return <div>Landing page</div>;
}

// ✅ Client Component (explicit directive)
// components/Canvas.tsx
'use client';

import { Stage, Layer } from 'react-konva';

export function Canvas() {
  // Uses browser APIs, state, effects
  return <Stage>...</Stage>;
}
```

**Rules:**
- Server Components by default
- Add 'use client' only when needed:
  - Browser APIs (window, document)
  - React hooks (useState, useEffect)
  - Event handlers (onClick, onDrag)
  - Third-party libraries using hooks

---

### Hook Patterns

```typescript
// ✅ GOOD - Custom hooks with clear names
export function useCanvas() {
  const [viewport, setViewport] = useState<Viewport>({
    x: 0,
    y: 0,
    zoom: 1,
  });
  
  const pan = useCallback((dx: number, dy: number) => {
    setViewport((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  }, []);
  
  return { viewport, pan };
}

// ✅ GOOD - Memoized expensive computations
const sortedObjects = useMemo(
  () => objects.sort((a, b) => a.zIndex - b.zIndex),
  [objects]
);

// ✅ GOOD - Throttled callbacks
const throttledUpdate = useMemo(
  () => throttle((id: string, x: number, y: number) => {
    updateObject(id, { x, y });
  }, 33), // 30 FPS
  [updateObject]
);

// ❌ BAD - Missing dependencies
const handleClick = useCallback(() => {
  console.log(activeTool); // Uses activeTool but not in deps
}, []); // ERROR - add activeTool to deps
```

---

### Component Structure

```typescript
// ✅ GOOD - Consistent component structure

'use client';

// 1. Imports (grouped: React, external, internal, types)
import { useCallback, useMemo, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import { useStorage, useMutation } from '@liveblocks/react';
import { Canvas } from '@/components/Canvas';
import type { CanvasObject } from '@/types/canvas';

// 2. Types/Interfaces (local to component)
interface CanvasProps {
  roomId: string;
}

// 3. Component
export function Canvas({ roomId }: CanvasProps) {
  // 3a. Hooks (state, context, custom hooks)
  const objects = useStorage((root) => root.objects);
  const [tool, setTool] = useState<Tool>('select');
  
  // 3b. Refs
  const stageRef = useRef<Konva.Stage>(null);
  
  // 3c. Callbacks (memoized)
  const handleZoom = useCallback((e: KonvaEventObject<WheelEvent>) => {
    // Implementation
  }, []);
  
  // 3d. Computed values (memoized)
  const sortedObjects = useMemo(
    () => Array.from(objects?.entries() || []),
    [objects]
  );
  
  // 3e. Effects (minimal, only when necessary)
  useEffect(() => {
    // Setup/cleanup
  }, []);
  
  // 3f. Render
  return (
    <Stage ref={stageRef} onWheel={handleZoom}>
      <Layer>
        {sortedObjects.map(([id, obj]) => (
          <ShapeRenderer key={id} object={obj} />
        ))}
      </Layer>
    </Stage>
  );
}
```

---

## File Naming Conventions

```
✅ GOOD
components/Canvas.tsx          // PascalCase for components
lib/liveblocks.ts              // camelCase for utilities
hooks/useCanvas.ts             // camelCase with 'use' prefix
types/canvas.ts                // camelCase for type files
app/canvas/[roomId]/page.tsx   // Next.js conventions

❌ BAD
components/canvas.tsx          // Should be PascalCase
lib/Liveblocks.ts              // Should be camelCase
hooks/Canvas.ts                // Missing 'use' prefix
types/Canvas.ts                // Should be camelCase
```

---

## Import Organization

```typescript
// ✅ GOOD - Organized imports

// 1. React
import { useState, useCallback, useMemo } from 'react';

// 2. Next.js
import { useRouter } from 'next/navigation';

// 3. External libraries (alphabetical)
import { nanoid } from 'nanoid';
import { Stage, Layer } from 'react-konva';
import { throttle } from 'lodash';

// 4. Liveblocks (grouped together)
import { useStorage, useMutation } from '@liveblocks/react';

// 5. Internal components
import { Canvas } from '@/components/Canvas';
import { Toolbar } from '@/components/Toolbar';

// 6. Internal utilities
import { clampPosition } from '@/lib/utils';

// 7. Types (always last, with 'type' keyword)
import type { CanvasObject } from '@/types/canvas';
import type { Tool } from '@/types/canvas';
```

---

## Error Handling

```typescript
// ✅ GOOD - Try/catch around Liveblocks operations

const updateObject = useMutation(
  ({ storage }, id: string, updates: Partial<CanvasObject>) => {
    try {
      const obj = storage.get('objects').get(id);
      if (!obj) {
        console.warn(`Object ${id} not found`);
        return;
      }
      
      Object.entries(updates).forEach(([key, value]) => {
        obj.set(key as keyof CanvasObject, value);
      });
    } catch (error) {
      console.error('Failed to update object:', error);
      toast.error('Failed to update object');
    }
  },
  []
);

// ✅ GOOD - Validate AI responses

function validateFunctionCall(call: FunctionCall): boolean {
  const validFunctions = ['createShape', 'arrangeGrid'];
  
  if (!validFunctions.includes(call.name)) {
    console.warn('Unknown function:', call.name);
    return false;
  }
  
  if (call.name === 'createShape') {
    // Cap count to max
    if (call.args.count > 10) {
      console.warn('Count exceeds max, capping to 10');
      call.args.count = 10;
    }
    
    // Validate color
    if (!isValidColor(call.args.fill)) {
      console.warn('Invalid color, using default');
      call.args.fill = '#3B82F6';
    }
  }
  
  return true;
}
```

---

## Performance Patterns

```typescript
// ✅ GOOD - Throttle high-frequency updates

import { throttle } from 'lodash';

const throttledCursorUpdate = useMemo(
  () => throttle((x: number, y: number) => {
    updateMyPresence({ cursor: { x, y } });
  }, 33), // 30 FPS
  [updateMyPresence]
);

// ✅ GOOD - Selective Konva updates (from figma-clone)

const shapeRefs = useRef<Map<string, Konva.Shape>>(new Map());

// On object change, update only that shape
useEffect(() => {
  objects?.forEach((obj, id) => {
    const shape = shapeRefs.current.get(id);
    if (shape) {
      shape.x(obj.x);
      shape.y(obj.y);
      shape.width(obj.width);
      shape.height(obj.height);
    }
  });
  
  layer.batchDraw(); // Single re-render
}, [objects]);

// ✅ GOOD - Memory cleanup

useEffect(() => {
  // Track current object IDs
  const currentIds = new Set(objects?.keys() || []);
  
  // Remove shapes for deleted objects
  shapeRefs.current.forEach((shape, id) => {
    if (!currentIds.has(id)) {
      shape.destroy();
      shapeRefs.current.delete(id);
    }
  });
}, [objects]);
```

---

## Naming Conventions

### Variables
```typescript
// ✅ Descriptive, camelCase
const activeTool = 'select';
const selectedObjectIds = ['obj1', 'obj2'];
const isLoading = false;

// ❌ Abbreviations (unless widely known)
const obj = {}; // Bad - unless in loop
const usr = {}; // Bad
const cfg = {}; // Bad
```

### Functions
```typescript
// ✅ Verb + noun, camelCase
function createObject() {}
function updatePosition() {}
function handleMouseDown() {}

// ✅ Boolean functions: is/has/can prefix
function isValidColor(color: string): boolean {}
function hasSelection(): boolean {}
function canDelete(): boolean {}
```

### Constants
```typescript
// ✅ UPPER_SNAKE_CASE for true constants
const MAX_OBJECTS = 500;
const CANVAS_SIZE = 20000;
const USER_COLORS = [...];

// ✅ camelCase for config objects
const defaultViewport = { x: 0, y: 0, zoom: 1 };
```

---

## Comments

```typescript
// ✅ GOOD - Comments for WHY, not WHAT

// Zoom toward cursor (Figma pattern)
const mousePointTo = {
  x: (pointer.x - stage.x()) / oldScale,
  y: (pointer.y - stage.y()) / oldScale,
};

// Throttle to 30 FPS to balance smoothness vs bandwidth
const throttledUpdate = throttle(updateObject, 33);

// ❌ BAD - Obvious comments

// Set x to 100
const x = 100;

// Loop through objects
objects.forEach((obj) => {});
```

---

## Code Formatting

### Indentation
- 2 spaces (not tabs)
- Configured in `.editorconfig`

### Line Length
- Max 100 characters
- Break long lines logically

### Semicolons
- Always use semicolons
- Configured in ESLint

### Quotes
- Single quotes for strings
- Double quotes for JSX attributes

```typescript
// ✅ GOOD
const message = 'Hello';
<div className="container">

// ❌ BAD
const message = "Hello";
<div className='container'>
```

---

## ESLint Rules

```json
{
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

---

## Git Commit Messages

```
✅ GOOD
feat: add rectangle tool with drag-to-create
fix: correct cursor sync latency issue
refactor: extract viewport logic to custom hook
docs: update architecture with Konva patterns

❌ BAD
updated stuff
fixed bug
changes
wip
```

**Format:** `type: description`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance

---

## Related Documents

- **Component Structure:** See `component-structure.md`
- **Tech Stack:** See `tech-stack.md`
- **Project Structure:** See `project-structure.md`