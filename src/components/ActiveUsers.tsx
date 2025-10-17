'use client';

import { useMemo } from "react";

type PresenceUser = {
  id: string;
  name: string;
  color: string;
};

export default function ActiveUsers() {
  const users = useMemo<PresenceUser[]>(
    () => [
      { id: "self", name: "You", color: "#4C5FD5" },
      { id: "guest-1", name: "Guest", color: "#F97316" }
    ],
    []
  );

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
      <div className="flex items-center -space-x-2">
        {users.map((user) => (
          <span
            key={user.id}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white"
            style={{ backgroundColor: user.color }}
          >
            {user.name.slice(0, 2).toUpperCase()}
          </span>
        ))}
      </div>
      <span className="text-xs font-medium text-slate-600">{users.length} active</span>
    </div>
  );
}
