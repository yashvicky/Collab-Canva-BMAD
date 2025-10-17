import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Collab Canva BMAD",
  description: "Realtime collaborative canvas powered by Liveblocks and Firebase."
};

type RootLayoutProps = {
  readonly children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-slate-50">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Collaboration Canvas</p>
              <h1 className="text-xl font-semibold text-slate-900">BMAD Team Whiteboard</h1>
            </div>
            <span className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
              Live Prototype
            </span>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-6 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white px-6 py-3 text-center text-xs text-slate-500">
          Built with Next.js 15, React 19, Liveblocks, and Firebase Auth.
        </footer>
      </body>
    </html>
  );
}
