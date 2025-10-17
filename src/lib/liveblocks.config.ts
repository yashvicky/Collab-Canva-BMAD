import { createClient } from "@liveblocks/client";

const publicApiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

if (process.env.NODE_ENV === "development" && !publicApiKey) {
  // eslint-disable-next-line no-console
  console.warn("Liveblocks public API key missing. Add NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY to .env.local.");
}

export const liveblocksClient = createClient({
  publicApiKey: publicApiKey ?? ""
});
