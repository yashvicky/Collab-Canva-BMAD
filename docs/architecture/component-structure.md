# Component Architecture
# CollabCanvas - Component Structure

**Date:** October 19, 2025  
**Status:** Approved for Development

---

## Component Hierarchy

```
app/
├── layout.tsx (Root layout, providers)
├── page.tsx (Landing/redirect)
└── canvas/
    └── [roomId]/
        └── page.tsx (Canvas page, Liveblocks room)

components/
├── Canvas.tsx (Main Konva canvas, 'use client')
├── Toolbar.tsx (Tool selection)
├── CommandBar.tsx (AI input, '/' to activate)
├── PresenceBadge.tsx (Active users count)
├── ShareButton.tsx (Copy URL)
├── Cursor.tsx (Remote cursor rendering)
└── shapes/
    ├── Rectangle.tsx (Konva Rect)
    ├── Circle.tsx (Konva Circle)
    └── Text.tsx (Konva Text)

lib/
├── liveblocks.ts (Client setup, room config)
├── firebase.ts (Auth setup)
├── ai.ts (Claude API wrapper)
└── utils.ts (clampPosition, generateRoomId, etc.)

hooks/
├── useCanvas.ts (Canvas state, viewport)
├── useTools.ts (Active tool, shortcuts)
├── useSelection.ts (Selected objects)
└── useAI.ts (Command execution)

types/
├── canvas.ts (CanvasObject, Tool, etc.)
├── liveblocks.ts (Presence, Storage types)
└── ai.ts (FunctionCall, AICommand)
```

---

## Core Components (Detailed)

### Canvas.tsx (Main Component)

**Responsibility:** Render Konva canvas, manage viewport, sync with Liveblocks

**Pattern from figma-clone repo:**
```typescript
'use client';

import { Stage, Layer } from 'react-konva';
import { useStorage, useMutation } from '@liveblocks/react';

export function Canvas() {
  const objects = useStorage((root) => root.objects); // LiveMap
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  
  // Stage-level transforms for pan/zoom (GPU-accelerated)
  const stageRef = useRef<Konva.Stage>(null);
  
  // Selective updates (no full re-render)
  const shapeRefs = useRef<Map<string, Konva.Shape>>(new Map());
  
  // Pan handler (Space + drag)
  const handlePan = useCallback((e: KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage();
    setViewport({ 
      x: stage.x(), 
      y: stage.y(), 
      zoom: stage.scaleX() 
    });
  }, []);
  
  // Zoom handler (wheel, zoom toward cursor)
  const handleZoom = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    
    // Pattern from figma-clone: zoom toward cursor
    const oldScale = stage.scaleX();
    const newScale = Math.max(0.25, Math.min(4, oldScale * (1 + e.evt.deltaY * -0.001)));
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    
    stage.scale({ x: newScale, y: newScale });
    stage.position({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
    
    setViewport({ x: stage.x(), y: stage.y(), zoom: newScale });
  }, []);
  
  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      draggable // Space + drag for pan
      onWheel={handleZoom}
      x={viewport.x}
      y={viewport.y}
      scaleX={viewport.zoom}
      scaleY={viewport.zoom}
    >
      <Layer>
        {objects?.map((obj) => (
          <ShapeRenderer key={obj.id} object={obj} />
        ))}
        {/* Remote cursors */}
      </Layer>
    </Stage>
  );
}
```

**Key patterns:**
- ✅ Single Konva layer (performance)
- ✅ Stage-level transforms (smooth pan/zoom)
- ✅ Selective updates via refs (no re-render all shapes)
- ✅ Direct copy from figma-clone repo

---

### Toolbar.tsx

**Responsibility:** Tool selection UI

```typescript
'use client';

export function Toolbar() {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  
  const tools = [
    { id: 'select', label: 'Select', key: 'V' },
    { id: 'rect', label: 'Rectangle', key: 'R' },
    { id: 'circle', label: 'Circle', key: 'O' },
    { id: 'text', label: 'Text', key: 'T' },
  ];
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'v') setActiveTool('select');
      if (e.key === 'r') setActiveTool('rect');
      if (e.key === 'o') setActiveTool('circle');
      if (e.key === 't') setActiveTool('text');
    };
    
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);
  
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex gap-2">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(tool.id as Tool)}
          className={cn(
            "px-4 py-2 rounded",
            activeTool === tool.id ? "bg-brand text-white" : "hover:bg-gray-100"
          )}
        >
          {tool.label} ({tool.key})
        </button>
      ))}
    </div>
  );
}
```

---

### CommandBar.tsx

**Responsibility:** AI command input

```typescript
'use client';

export function CommandBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Open with '/' key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Call AI API
      const response = await fetch('/api/ai/canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, canvasState: getCanvasState() }),
      });
      
      const { functionCalls } = await response.json();
      
      // Execute function calls
      for (const call of functionCalls) {
        await executeFunctionCall(call);
      }
      
      setCommand('');
      setIsOpen(false);
    } catch (error) {
      console.error('AI error:', error);
      toast.error('AI unavailable, try again');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[600px]">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Ask AI to create or arrange shapes..."
          className="w-full px-4 py-3 rounded-lg shadow-lg border-2 border-brand"
          autoFocus
        />
        {isLoading && <div className="text-center mt-2">Loading...</div>}
      </form>
    </div>
  );
}
```

---

### Shape Components

#### Rectangle.tsx
```typescript
import { Rect } from 'react-konva';
import type { CanvasObject } from '@/types/canvas';

export function Rectangle({ object }: { object: CanvasObject }) {
  return (
    <Rect
      x={object.x}
      y={object.y}
      width={object.width}
      height={object.height}
      fill={object.fill}
      cornerRadius={8}
    />
  );
}
```

#### Circle.tsx
```typescript
import { Circle } from 'react-konva';
import type { CanvasObject } from '@/types/canvas';

export function CircleShape({ object }: { object: CanvasObject }) {
  return (
    <Circle
      x={object.x}
      y={object.y}
      radius={object.width / 2} // width = diameter
      fill={object.fill}
    />
  );
}
```

#### Text.tsx
```typescript
import { Text } from 'react-konva';
import type { CanvasObject } from '@/types/canvas';

export function TextShape({ object }: { object: CanvasObject }) {
  return (
    <Text
      x={object.x}
      y={object.y}
      text={object.text}
      fontSize={object.fontSize || 16}
      fontFamily="ui-sans-serif, -apple-system, system-ui"
      fill={object.fill || '#111827'}
      width={object.width}
    />
  );
}
```

---

## Custom Hooks

### useCanvas.ts
```typescript
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
  
  const zoom = useCallback((delta: number, point: { x: number; y: number }) => {
    setViewport((prev) => {
      const newZoom = Math.max(0.25, Math.min(4, prev.zoom * (1 + delta)));
      // Zoom toward point math...
      return { x: newX, y: newY, zoom: newZoom };
    });
  }, []);
  
  return { viewport, pan, zoom };
}
```

### useTools.ts
```typescript
export function useTools() {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'v') setActiveTool('select');
      if (key === 'r') setActiveTool('rect');
      if (key === 'o') setActiveTool('circle');
      if (key === 't') setActiveTool('text');
    };
    
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);
  
  return { activeTool, setActiveTool };
}
```

---

## Component Best Practices

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
  - Third-party libraries that use hooks

---

## Related Documents

- **Data Architecture:** See `data-architecture.md`
- **Coding Standards:** See `coding-standards.md`
- **Tech Stack:** See `tech-stack.md`