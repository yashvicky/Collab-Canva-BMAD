'use client';

import { useMemo, useState } from "react";
import { Circle, Layer, Rect, Stage, Text } from "react-konva";

type Shape = {
  id: string;
  fill: string;
  kind: "circle" | "rect";
  x: number;
  y: number;
};

const INITIAL_SHAPES: Shape[] = [
  { id: "rect-1", kind: "rect", x: 140, y: 80, fill: "#4C5FD5" },
  { id: "circle-1", kind: "circle", x: 320, y: 220, fill: "#7C3AED" }
];

export default function KonvaCanvas() {
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

  const shapes = useMemo(() => INITIAL_SHAPES, []);

  return (
    <Stage
      className="flex-1"
      width={1000}
      height={640}
      scaleX={stageScale}
      scaleY={stageScale}
      x={stagePosition.x}
      y={stagePosition.y}
      draggable
      onDragEnd={(event) => {
        setStagePosition({
          x: event.target.x(),
          y: event.target.y()
        });
      }}
      onWheel={(event) => {
        event.evt.preventDefault();
        const scaleBy = 1.05;
        const direction = event.evt.deltaY > 0 ? 1 : -1;
        const newScale = direction > 0 ? stageScale / scaleBy : stageScale * scaleBy;
        setStageScale(Math.min(Math.max(newScale, 0.6), 2));
      }}
    >
      <Layer>
        <Text
          text="Drop in shapes to start collaborating!"
          fontSize={18}
          fill="#475569"
          x={32}
          y={24}
        />
        {shapes.map((shape) => {
          if (shape.kind === "rect") {
            return (
              <Rect
                key={shape.id}
                x={shape.x}
                y={shape.y}
                width={160}
                height={120}
                fill={shape.fill}
                cornerRadius={12}
                draggable
                shadowBlur={10}
              />
            );
          }

          return (
            <Circle
              key={shape.id}
              x={shape.x}
              y={shape.y}
              radius={70}
              fill={shape.fill}
              draggable
              shadowBlur={10}
            />
          );
        })}
      </Layer>
    </Stage>
  );
}
