'use client';

import { useState } from "react";

const TOOLS = [
  { id: "select", label: "Select" },
  { id: "rect", label: "Rectangle" },
  { id: "circle", label: "Circle" },
  { id: "text", label: "Text" }
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

export default function Toolbar() {
  const [activeTool, setActiveTool] = useState<ToolId>("select");

  return (
    <nav aria-label="Canvas tools" className="flex items-center gap-2">
      {TOOLS.map((tool) => {
        const isActive = tool.id === activeTool;

        return (
          <button
            key={tool.id}
            type="button"
            onClick={() => setActiveTool(tool.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "border-brand bg-brand text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand hover:text-brand"
            }`}
          >
            {tool.label}
          </button>
        );
      })}
    </nav>
  );
}
