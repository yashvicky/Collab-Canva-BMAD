import dynamic from "next/dynamic";
import { Suspense } from "react";

import ActiveUsers from "@/components/ActiveUsers";
import Toolbar from "@/components/Toolbar";

const KonvaCanvas = dynamic(() => import("@/components/KonvaCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white">
      <p className="text-sm text-slate-500">Preparing canvas...</p>
    </div>
  )
});

export default function HomePage() {
  return (
    <div className="flex h-full flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Toolbar />
        <ActiveUsers />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
              Loading canvas...
            </div>
          }
        >
          <KonvaCanvas />
        </Suspense>
      </div>
    </div>
  );
}
