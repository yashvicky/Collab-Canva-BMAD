# Epic 2: Shape Tools

**Goal:** Allow users to create and manage basic shapes

**Priority:** P0 (Critical)  
**Estimated Time:** 3.25 hours  
**Dependencies:** Epic 1 (Canvas Infrastructure)

---

## Overview

This epic implements the three core shape types: rectangles, circles, and text. Each tool must support drag-to-create with preview, default styling, and keyboard shortcuts.

**Technical Foundation:**
- Konva shape components (Rect, Circle, Text)
- Tool state management
- Shape preview during creation
- Local state before Liveblocks sync (added in Epic 3)

---

## Stories

### Story 2.1: Rectangle Tool

**As a user**  
I want to create rectangles  
So that I can build layouts and wireframes

**Acceptance Criteria:**
- [ ] Press R activates rectangle tool
- [ ] Drag creates rectangle with preview
- [ ] Rectangle appears in Konva layer
- [ ] Default: 160×100px, #4F46E5 fill
- [ ] Min/max size enforced

**Technical Specifications:**
```typescript
// Rectangle shape component
import { Rect } from 'react-konva';

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

// Rectangle tool handler
const handleRectangleDrag = useCallback((e: KonvaEventObject) => {
  const stage = stageRef.current;
  const pos = stage.getPointerPosition();
  
  // Calculate size from drag
  const width = Math.abs(pos.x - startPos.x);
  const height = Math.abs(pos.y - startPos.y);
  
  // Enforce min/max
  const clampedWidth = Math.max(8, Math.min(5000, width));
  const clampedHeight = Math.max(8, Math.min(5000, height));
  
  setPreviewRect({ 
    x: Math.min(startPos.x, pos.x),
    y: Math.min(startPos.y, pos.y),
    width: clampedWidth, 
    height: clampedHeight 
  });
}, [startPos]);
```

**Reference:**
- figma-clone: Shape creation patterns
- Konva: Rect component

**Tasks:**
1. [ ] Create `src/components/shapes/Rectangle.tsx`
2. [ ] Add rectangle tool to toolbar
3. [ ] Implement drag-to-create handler
4. [ ] Show preview during drag
5. [ ] Create object on mouse up
6. [ ] Add keyboard shortcut (R)
7. [ ] Enforce min 8×8px, max 5000×5000px
8. [ ] Default fill #4F46E5, radius 8px
9. [ ] Store in local state (array)

**Testing:**
- Press R, verify tool activates
- Drag to create rectangle
- Click only should create 160×100px default
- Verify min/max size enforcement
- Test rapid creation (10+ rectangles)

**Estimated Time:** 1 hour

---

### Story 2.2: Circle Tool

**As a user**  
I want to create circles  
So that I can design icons and graphics

**Acceptance Criteria:**
- [ ] Press O activates circle tool
- [ ] Drag creates perfect circle
- [ ] Default: 60px radius, #06B6D4 fill
- [ ] Aspect ratio locked

**Technical Specifications:**
```typescript
// Circle shape component
import { Circle } from 'react-konva';

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

// Circle tool handler (locks aspect ratio)
const handleCircleDrag = useCallback((e: KonvaEventObject) => {
  const stage = stageRef.current;
  const pos = stage.getPointerPosition();
  
  // Calculate diameter (locked aspect ratio)
  const dx = pos.x - startPos.x;
  const dy = pos.y - startPos.y;
  const diameter = Math.sqrt(dx * dx + dy * dy) * 2;
  
  // Enforce min/max radius
  const clampedDiameter = Math.max(12, Math.min(5000, diameter));
  
  setPreviewCircle({
    x: startPos.x,
    y: startPos.y,
    width: clampedDiameter,
    height: clampedDiameter // Always equal (perfect circle)
  });
}, [startPos]);
```

**Reference:**
- Konva: Circle component
- figma-clone: Shape creation patterns

**Tasks:**
1. [ ] Create `src/components/shapes/Circle.tsx`
2. [ ] Add circle tool to toolbar
3. [ ] Implement drag-to-create with locked aspect
4. [ ] Show preview during drag
5. [ ] Create object on mouse up
6. [ ] Add keyboard shortcut (O)
7. [ ] Enforce min 6px radius, max 2500px
8. [ ] Default fill #06B6D4
9. [ ] Store in local state

**Testing:**
- Press O, verify tool activates
- Drag to create circle
- Verify aspect ratio always 1:1
- Click only should create 120px diameter
- Test min/max radius enforcement

**Estimated Time:** 45 minutes

---

### Story 2.3: Text Tool

**As a user**  
I want to add text to the canvas  
So that I can label and annotate designs

**Acceptance Criteria:**
- [ ] Press T activates text tool
- [ ] Click opens text input
- [ ] Text renders in Konva
- [ ] Double-click to edit existing text
- [ ] 16px system font, #111827 color

**Technical Specifications:**
```typescript
// Text shape component
import { Text } from 'react-konva';

export function TextShape({ object }: { object: CanvasObject }) {
  const textRef = useRef<Konva.Text>(null);
  
  return (
    <Text
      ref={textRef}
      x={object.x}
      y={object.y}
      text={object.text}
      fontSize={object.fontSize || 16}
      fontFamily="ui-sans-serif, -apple-system, system-ui"
      fill={object.fill || '#111827'}
      width={object.width}
      onDblClick={() => {
        // Enter edit mode
        setEditingText(object.id);
      }}
    />
  );
}

// Text edit mode (HTML input overlay)
function TextEditor({ object, onComplete }: TextEditorProps) {
  const [text, setText] = useState(object.text || '');
  
  return (
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => onComplete(text)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          onComplete(text);
        }
        if (e.key === 'Escape') {
          onComplete(object.text); // Cancel
        }
      }}
      autoFocus
      style={{
        position: 'absolute',
        left: object.x,
        top: object.y,
        fontSize: 16,
        fontFamily: 'ui-sans-serif, -apple-system, system-ui',
        border: '2px solid #3B82F6',
        padding: '4px',
        resize: 'none',
        minWidth: 200,
      }}
    />
  );
}
```

**Reference:**
- Konva: Text component, text editing example
- figma-clone: Text handling patterns

**Tasks:**
1. [ ] Create `src/components/shapes/Text.tsx`
2. [ ] Add text tool to toolbar
3. [ ] Implement click-to-place text
4. [ ] Create HTML textarea overlay for editing
5. [ ] Handle multiline (Shift+Enter)
6. [ ] Implement double-click to edit existing
7. [ ] Add keyboard shortcut (T)
8. [ ] Default: 16px, #111827 color
9. [ ] Max 500 chars (soft limit)
10. [ ] Store in local state

**Testing:**
- Press T, verify tool activates
- Click canvas, input should appear
- Type text, press Enter to confirm
- Double-click existing text to edit
- Test multiline with Shift+Enter
- Esc should cancel edit

**Estimated Time:** 1.5 hours

---

## Definition of Done

- [ ] All 3 shape types functional
- [ ] Keyboard shortcuts work (R, O, T)
- [ ] Drag-to-create with preview
- [ ] Click-to-create with defaults
- [ ] Text edit mode works
- [ ] Min/max size constraints enforced
- [ ] Shapes render in Konva layer
- [ ] 60 FPS maintained with 100+ shapes
- [ ] Code follows architecture standards
- [ ] No console errors

---

## Dependencies for Next Epic

Epic 3 (Real-Time Collaboration) requires:
- Shapes stored in state (array)
- Shape creation handlers working
- Shape rendering functional
- Ready to integrate with Liveblocks storage

---

## Notes

**Performance Considerations:**
- Keep preview lightweight (single shape)
- Use requestAnimationFrame for drag updates
- Test with 100+ shapes for performance

**State Management:**
For now, store shapes in local state:
```typescript
const [objects, setObjects] = useState<CanvasObject[]>([]);
```

Epic 3 will replace this with Liveblocks storage.

**Common Issues:**
- Text input not focused: Use autoFocus prop
- Preview flickers: Throttle drag updates
- Double-click fires click: Use onDblClick, check timing
- Text wrapping: Set width on Text component