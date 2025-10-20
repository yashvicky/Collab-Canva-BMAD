# Epic 1: Canvas Infrastructure

**Goal:** Build the foundational canvas with smooth pan/zoom

**Priority:** P0 (Critical)  
**Estimated Time:** 2.5 hours  
**Dependencies:** None (foundational)

---

## Overview

This epic establishes the core canvas infrastructure using Konva.js. The focus is on creating a large, performant workspace with smooth pan and zoom capabilities that maintain 60 FPS even with 500+ objects.

**Technical Foundation:**
- Next.js App Router page component
- Konva Stage and Layer
- Stage-level transforms for GPU-accelerated pan/zoom
- ViewportRetry state management

---

## Stories

### Story 1.1: Basic Canvas Setup

**As a user**  
I want to see a large, scrollable canvas  
So that I can design without space constraints

**Acceptance Criteria:**
- [ ] Canvas renders 20000×20000px workspace
- [ ] Initial view centered at (10000, 10000)
- [ ] Konva Stage initialized
- [ ] Single Layer created
- [ ] 60 FPS maintained

**Technical Specifications:**
```typescript
// Canvas component
'use client';
import { Stage, Layer } from 'react-konva';

export function Canvas() {
  const CANVAS_SIZE = 20000;
  const stageRef = useRef<Konva.Stage>(null);
  
  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      x={-CANVAS_SIZE / 2}
      y={-CANVAS_SIZE / 2}
    >
      <Layer>
        {/* Shapes will go here */}
      </Layer>
    </Stage>
  );
}
```

**Reference:**
- figma-clone: `src/components/Canvas.tsx` (Stage setup)
- Konva docs: Basic stage setup

**Tasks:**
1. [ ] Create `src/components/Canvas.tsx` with Stage
2. [ ] Set up viewport state hook
3. [ ] Configure canvas bounds (20000×20000)
4. [ ] Center initial viewport
5. [ ] Verify 60 FPS with empty canvas

**Testing:**
- Open canvas, verify no console errors
- Check Chrome DevTools Performance tab for 60 FPS
- Verify canvas renders at specified size

**Estimated Time:** 1.5 hours

---

### Story 1.2: Pan & Zoom

**As a user**  
I want to pan and zoom the canvas smoothly  
So that I can navigate large designs easily

**Acceptance Criteria:**
- [ ] Space+drag pans camera
- [ ] Wheel zooms toward cursor
- [ ] Zoom clamped to 0.25x - 4x
- [ ] Stage-level transforms (GPU-accelerated)
- [ ] 60 FPS during all movements

**Technical Specifications:**
```typescript
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
  
  const oldScale = stage.scaleX();
  const delta = e.evt.deltaY * -0.001;
  const newScale = Math.max(0.25, Math.min(4, oldScale * (1 + delta)));
  
  // Zoom toward cursor (Figma pattern)
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
```

**Reference:**
- figma-clone: `src/components/Canvas.tsx` (pan/zoom handlers)
- Konva examples: Zoom to cursor

**Tasks:**
1. [ ] Implement pan handler (Space + drag)
2. [ ] Implement zoom handler (wheel)
3. [ ] Add zoom-to-cursor math (Figma pattern)
4. [ ] Clamp zoom to 0.25x - 4x range