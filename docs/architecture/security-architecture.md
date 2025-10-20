# Security Architecture
# CollabCanvas - Security Architecture

**Date:** October 19, 2025  
**Status:** Approved for Development

---

## Security Principles

1. **API Key Protection:** Secrets never exposed to client
2. **Input Validation:** All user input validated and sanitized
3. **Defense in Depth:** Multiple layers of protection
4. **Least Privilege:** Services have minimal required permissions

---

## API Key Protection

### Critical: Server-Side Only

**Rule:** Secret keys MUST NEVER be exposed to the client browser.

### Keys Classification

| Key | Type | Location | Exposed to Client? |
|-----|------|----------|-------------------|
| `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY` | Public | Client | ✅ Yes (safe) |
| `LIVEBLOCKS_SECRET_KEY` | Secret | Server | ❌ NO |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public | Client | ✅ Yes (safe) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Public | Client | ✅ Yes (safe) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Public | Client | ✅ Yes (safe) |
| `ANTHROPIC_API_KEY` | Secret | Server | ❌ NO |

---

### Environment Variable Security

**File: `.env.local` (NEVER commit)**

```bash
# ✅ Safe to expose (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_xxxxx
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=collab-canva.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=collab-canva

# ❌ NEVER expose (no NEXT_PUBLIC_ prefix)
LIVEBLOCKS_SECRET_KEY=sk_dev_xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

**Why `NEXT_PUBLIC_` prefix is safe:**
- Next.js only bundles `NEXT_PUBLIC_*` variables into client
- Non-prefixed variables are server-side only
- Automatic protection by framework

---

### .gitignore Configuration

**File: `.gitignore`**

```
# Environment variables (CRITICAL)
.env.local
.env*.local

# Vercel
.vercel

# Build outputs
.next/
out/
build/

# Dependencies
node_modules/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

**Verify:**
```bash
# Check if .env.local is ignored
git status

# Should NOT show .env.local
# If it does, remove it:
git rm --cached .env.local
```

---

### Server-Side API Route Pattern

**✅ CORRECT - Server-side usage:**

```typescript
// app/api/ai/canvas/route.ts
import Anthropic from '@anthropic-ai/sdk';

// This runs on SERVER only
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!, // No NEXT_PUBLIC_ = server-only
});

export async function POST(req: Request) {
  // Server-side code
  const message = await anthropic.messages.create({...});
  return Response.json({ functionCalls });
}
```

**❌ WRONG - Client-side exposure:**

```typescript
// components/Canvas.tsx
'use client';

// This runs in BROWSER - NEVER do this!
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!, // EXPOSED TO BROWSER!
});
```

---

### Vercel Environment Variables

**Setup in Vercel Dashboard:**

1. Go to Project Settings → Environment Variables
2. Add each variable:
   - `LIVEBLOCKS_SECRET_KEY`: Production value
   - `ANTHROPIC_API_KEY`: Production value
   - `NEXT_PUBLIC_*`: Can be same as local

**Automatic deployment:**
- Vercel injects env vars at build time
- Server-only vars never sent to client
- Automatic separation maintained

---

## Input Validation

### AI Command Validation

**File: `app/api/ai/canvas/route.ts`**

```typescript
export async function POST(req: Request) {
  try {
    const { command, canvasState } = await req.json();
    
    // 1. Validate command length
    if (!command || typeof command !== 'string') {
      return Response.json(
        { error: 'Invalid command' },
        { status: 400 }
      );
    }
    
    if (command.length > 500) {
      return Response.json(
        { error: 'Command too long (max 500 chars)' },
        { status: 400 }
      );
    }
    
    // 2. Validate canvas state
    if (!canvasState || typeof canvasState !== 'object') {
      return Response.json(
        { error: 'Invalid canvas state' },
        { status: 400 }
      );
    }
    
    // 3. Limit object count
    if (canvasState.objects && canvasState.objects.length > 100) {
      canvasState.objects = canvasState.objects.slice(0, 100);
    }
    
    // 4. Call AI
    const message = await anthropic.messages.create({...});
    
    // 5. Validate function calls
    const functionCalls = message.content
      .filter((block) => block.type === 'tool_use')
      .map((block) => ({
        name: block.name,
        args: block.input,
      }))
      .filter(validateFunctionCall); // Validate each call
    
    return Response.json({ functionCalls });
  } catch (error) {
    console.error('AI API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### Function Call Validation

```typescript
function validateFunctionCall(call: FunctionCall): boolean {
  // 1. Validate function name (whitelist)
  const validFunctions = ['createShape', 'arrangeGrid'];
  if (!validFunctions.includes(call.name)) {
    console.warn('Unknown function:', call.name);
    return false;
  }
  
  // 2. Validate function arguments
  if (call.name === 'createShape') {
    // Cap count to maximum
    if (typeof call.args.count !== 'number' || call.args.count > 10) {
      call.args.count = Math.min(call.args.count, 10);
    }
    
    // Validate color (hex format)
    if (!isValidColor(call.args.fill)) {
      call.args.fill = '#3B82F6'; // Default color
    }
    
    // Validate shape type
    const validTypes = ['rect', 'circle', 'text'];
    if (!validTypes.includes(call.args.shapeType)) {
      return false;
    }
  }
  
  if (call.name === 'arrangeGrid') {
    // Validate rows/cols
    if (typeof call.args.rows !== 'number' || call.args.rows < 1) {
      return false;
    }
    if (typeof call.args.cols !== 'number' || call.args.cols < 1) {
      return false;
    }
    
    // Validate object IDs
    if (!Array.isArray(call.args.objectIds)) {
      return false;
    }
  }
  
  return true;
}

function isValidColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}
```

---

### Canvas Bounds Validation

```typescript
// lib/utils.ts
export function clampPosition(
  x: number,
  y: number,
  width: number,
  height: number
): { x: number; y: number } {
  const CANVAS_SIZE = 20000;
  
  return {
    x: Math.max(0, Math.min(CANVAS_SIZE - width, x)),
    y: Math.max(0, Math.min(CANVAS_SIZE - height, y)),
  };
}

// Usage in mutations
const createObject = useMutation(
  ({ storage }, obj: CanvasObject) => {
    // Clamp position before storing
    const { x, y } = clampPosition(obj.x, obj.y, obj.width, obj.height);
    
    storage.get('objects').set(obj.id, new LiveObject({
      ...obj,
      x,
      y,
    }));
  },
  []
);
```

---

## Liveblocks Security

### Public vs Secret Keys

**Public Key (Client-safe):**
```typescript
// Used in browser
const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});
```

**Why public key is safe:**
- Read-only access to rooms user joins
- Cannot access other users' rooms
- Cannot create/delete rooms programmatically
- Rate-limited by Liveblocks

**Secret Key (Server-only):**
- Used for server-side operations only
- Can create/delete rooms
- Can access all rooms
- NEVER expose to client

**Our usage:** Public key only (client-side)

---

### Room Access Control

**Current (MVP):** Open rooms
- Anyone with URL can join
- Acceptable for demo/testing
- No sensitive data

**Future (if needed):** Liveblocks access tokens
```typescript
// Server-side: Generate token for specific user/room
import { Liveblocks } from '@liveblocks/node';

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

const session = liveblocks.prepareSession(userId, {
  userInfo: { name: userName },
});

session.allow(roomId, session.FULL_ACCESS);
const token = await session.authorize();
```

---

## Firebase Security

### Why Public Keys Are Safe

```typescript
// These are PUBLIC and SAFE to expose:
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
```

**Why safe:**
1. **Firebase Security Rules protect data** (not API keys)
2. **API key only identifies project** (not authentication)
3. **Cannot be used maliciously** without Security Rules bypass
4. **Designed to be public** by Firebase

**From Firebase docs:**
> "Unlike how API keys are typically used, API keys for Firebase services are not used to control access to backend resources. They only identify your Firebase project on the Google servers."

---

### Anonymous Auth Security

**Current (MVP):** No additional security needed
- Anonymous users cannot access database (we only use auth)
- Liveblocks handles room access
- No sensitive data stored

**Future (if database added):**
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anonymous users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Public rooms (anyone can read/write)
    match /rooms/{roomId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Rate Limiting

### Anthropic API

**Free tier limits:**
- 5 requests/minute
- 100 requests/day

**Handling:**
```typescript
export async function POST(req: Request) {
  try {
    const message = await anthropic.messages.create({...});
    return Response.json({ functionCalls });
  } catch (error) {
    if (error.status === 429) {
      // Rate limit hit
      return Response.json(
        { error: 'Too many requests, please wait' },
        { status: 429 }
      );
    }
    throw error;
  }
}
```

**Client-side handling:**
```typescript
const handleSubmit = async () => {
  try {
    const response = await fetch('/api/ai/canvas', {...});
    
    if (response.status === 429) {
      toast.error('Too many requests, please wait 10 seconds');
      return;
    }
    
    const data = await response.json();
    // Execute function calls
  } catch (error) {
    toast.error('AI unavailable, try again');
  }
};
```

---

### Liveblocks

**Rate limits (free tier):**
- WebSocket connections: Unlimited
- API calls: Reasonable use
- Storage operations: Unlimited

**Our usage:** Well within limits (30 FPS throttle)

---

## Error Handling Security

### Never Expose Internal Details

**❌ BAD - Exposes internals:**
```typescript
catch (error) {
  return Response.json({
    error: error.message, // Might contain sensitive info
    stack: error.stack,   // Exposes code structure
  });
}
```

**✅ GOOD - Generic messages:**
```typescript
catch (error) {
  console.error('AI error:', error); // Log server-side only
  
  return Response.json({
    error: 'AI unavailable, please try again', // Generic user message
  }, { status: 500 });
}
```

---

## Security Checklist

### Before Deployment

- [ ] `.env.local` in `.gitignore`
- [ ] No secret keys in code
- [ ] All API routes validate input
- [ ] Error messages don't expose internals
- [ ] CORS not overly permissive
- [ ] Rate limiting handled
- [ ] Test with malicious input

### Git Hygiene

```bash
# Check for secrets in history
git log -p | grep -i "api_key\|secret\|password"

# If secrets found, contact support to rotate keys immediately
```

### Environment Variables

```bash
# ✅ Production checklist
- [ ] LIVEBLOCKS_SECRET_KEY set in Vercel
- [ ] ANTHROPIC_API_KEY set in Vercel
- [ ] NEXT_PUBLIC_* vars set in Vercel
- [ ] No .env.local in git history
- [ ] All keys rotated if ever exposed
```

---

## Common Security Mistakes (Avoid)

### ❌ Committing .env.local
```bash
# If you accidentally commit:
git rm --cached .env.local
git commit -m "Remove env file"
git push

# Then ROTATE ALL KEYS immediately
```

### ❌ Client-side API calls
```typescript
// WRONG - Exposes API key
'use client';
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // In browser!
});
```

### ❌ No input validation
```typescript
// WRONG - Accepts any input
export async function POST(req: Request) {
  const { command } = await req.json();
  // No validation!
  const result = await ai.execute(command);
}
```

### ❌ Verbose error messages
```typescript
// WRONG - Exposes internals
catch (error) {
  return Response.json({ error: error.stack });
}
```

---

## Incident Response

### If API Key Exposed

**Immediate actions:**

1. **Rotate key immediately**
   - Anthropic: Generate new key in console
   - Liveblocks: Generate new key in dashboard
   - Firebase: Regenerate key in console

2. **Update environment variables**
   - Local: `.env.local`
   - Vercel: Dashboard → Environment Variables

3. **Redeploy**
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

4. **Monitor usage**
   - Check for unexpected API calls
   - Review logs for suspicious activity

---

## Security Resources

- **Next.js Security:** https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- **Vercel Security:** https://vercel.com/docs/security
- **Firebase Security:** https://firebase.google.com/docs/rules
- **Liveblocks Security:** https://liveblocks.io/docs/platform/security

---

## Related Documents

- **Tech Stack:** See `tech-stack.md`
- **ADR-0003:** AI integration security
- **ADR-0004:** Firebase auth security