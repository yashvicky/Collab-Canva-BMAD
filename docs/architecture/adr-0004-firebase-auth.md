# ADR-0004: Firebase Anonymous Authentication

**Date:** 2025-10-19  
**Status:** Accepted  
**Decision Makers:** Architect, Product Owner

---

## Context

CollabCanvas requires user identification for real-time collaboration (showing user names next to cursors, presence awareness). However, requiring signup would create friction and slow down the demo/testing experience.

### Requirements
- Frictionless access (no signup forms)
- Unique user identification
- User names for multiplayer cursors
- User colors for visual distinction
- Session persistence across page refreshes
- Simple implementation (< 1 hour)

### Options Considered

1. **Firebase Anonymous Auth**
2. **Clerk**
3. **Auth0**
4. **NextAuth.js**
5. **Custom JWT system**

---

## Decision

**Use Firebase Anonymous Authentication**

---

## Rationale

### Why Firebase Anonymous Auth

✅ **Zero friction**
```typescript
// User flow:
1. Open app
2. Start collaborating immediately
   (No signup, no email, no password)

// Implementation:
const auth = getAuth();
await signInAnonymously(auth);
// Done! User has unique ID
```

✅ **Proven in figma-clone repo**
- Successfully used for canvas collaboration
- Code patterns available to copy
- 30 minutes implementation time
- Production-tested

✅ **Free tier unlimited**
```
Firebase Anonymous Auth pricing:
- Unlimited anonymous sign-ins: FREE
- No credit card required
- No user limits
- No API call limits
```

✅ **Reliable UID generation**
```typescript
const user = await signInAnonymously(auth);
const uid = user.uid; // "Kx7n2Pq8WtR3jY5m"
// Cryptographically secure
// Globally unique
// Persistent until cookies cleared
```

✅ **Simple SDK**
```typescript
// Entire implementation:
import { getAuth, signInAnonymously } from 'firebase/auth';

const auth = getAuth();
const userCredential = await signInAnonymously(auth);
const userName = `User-${userCredential.user.uid.slice(-4)}`;
```

✅ **Session persistence**
- Automatic session management
- Persists across page refreshes
- Stored in browser (IndexedDB)
- No manual token handling needed

---

### Why NOT Clerk

❌ **Requires signup flow**
- Email/password or social login
- Adds friction (unacceptable)
- More complex UI

❌ **Overkill for anonymous users**
- Built for authenticated users
- Features we don't need:
  - Organizations
  - User profiles
  - Email verification

❌ **More expensive**
```
Clerk pricing:
- Free tier: 10,000 MAU
- Pro tier: $25/month + $0.02/MAU

Firebase pricing:
- Anonymous: Unlimited FREE
```

---

### Why NOT Auth0

❌ **Similar to Clerk**
- Designed for authenticated users
- Requires signup flow
- Overkill for our use case

❌ **More complex setup**
- OAuth configuration
- Callback URLs
- More moving parts

❌ **Costs money**
```
Auth0 pricing:
- Free tier: 7,500 users
- Essentials: $35/month

Firebase: Unlimited FREE
```

---

### Why NOT NextAuth.js

❌ **Requires OAuth providers**
- Must configure Google/GitHub/etc.
- Still requires user to "sign in"
- Not truly anonymous

❌ **More implementation time**
- Configure providers
- Set up callbacks
- Handle sessions manually
- 2-3 hours vs 30 minutes

❌ **No built-in anonymous mode**
- Would need custom provider
- More complexity

---

### Why NOT Custom JWT

❌ **Must implement everything**
```
What you'd need to build:
1. Token generation (JWT library)
2. Token storage (localStorage/cookies)
3. Token refresh logic
4. Expiration handling
5. UID generation
6. Session management

Time: 2-3 hours
vs
Firebase: 30 minutes
```

❌ **Security concerns**
- Must handle JWT securely
- Must prevent token theft
- Must validate on server
- More attack surface

---

## Implementation

### Setup Firebase

**File:** `lib/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

---

### Anonymous Sign-In

**File:** `app/canvas/[roomId]/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUpdateMyPresence } from '@/lib/liveblocks';

export default function CanvasPage() {
  const updateMyPresence = useUpdateMyPresence();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    async function initAuth() {
      try {
        // Sign in anonymously
        const userCredential = await signInAnonymously(auth);
        const uid = userCredential.user.uid;
        
        // Generate user data
        const userName = `User-${uid.slice(-4)}`;
        const userColor = USER_COLORS[Math.floor(Math.random() * 10)];
        
        // Set in Liveblocks presence
        updateMyPresence({ userName, userColor });
        
        setIsReady(true);
      } catch (error) {
        console.error('Auth error:', error);
      }
    }
    
    initAuth();
  }, [updateMyPresence]);
  
  if (!isReady) {
    return <div>Loading...</div>;
  }
  
  return <Canvas />;
}
```

---

### User Name Generation

```typescript
// Pattern: "User-" + last 4 chars of Firebase UID

Firebase UID:     "Kx7n2Pq8WtR3jY5m"
User name:        "User-jY5m"

Benefits:
✅ Human-readable
✅ Short (9 chars)
✅ Unique (UID is unique)
✅ Anonymous (no PII)
```

---

### User Color Assignment

```typescript
export const USER_COLORS = [
  '#4F46E5', // indigo
  '#EC4899', // pink
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EF4444', // red
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#A855F7', // purple
];

// Random assignment
const userColor = USER_COLORS[Math.floor(Math.random() * 10)];
```

---

### Session Persistence

```typescript
// Firebase automatically handles persistence
// User stays logged in across:
✅ Page refreshes
✅ Browser restarts
✅ Tab closes/reopens

// Until:
❌ User clears browser data
❌ User explicitly signs out
❌ User uses incognito mode

// Checking auth state:
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    const userName = `User-${user.uid.slice(-4)}`;
  } else {
    // User signed out, sign in again
    signInAnonymously(auth);
  }
});
```

---

## Consequences

### Positive

✅ **Zero friction**
- Users start collaborating immediately
- No forms, no waiting
- Perfect for demos and testing

✅ **Fast implementation**
- 30 minutes total (proven in figma-clone)
- Simple, clean code
- Copy patterns directly

✅ **Free forever**
- Unlimited anonymous users
- No scaling costs
- No credit card needed

✅ **Reliable**
- Firebase 99.95% uptime SLA
- Automatic session management
- Proven in production

✅ **Simple code**
- Single function call
- Automatic persistence
- No token management

---

### Negative

⚠️ **Users can't "log back in"**
```
Scenario:
1. User opens app → Gets "User-jY5m"
2. User clears cookies
3. User reopens app → Gets new ID "User-aB3c"

Result: Cannot recover previous identity
```

**Acceptable for MVP:**
- Users don't expect persistence
- Canvas collaboration is ephemeral
- No user-generated content to save

⚠️ **New UID every clear cookies**
- Incognito mode = new user each time
- Privacy-focused users = frequent new IDs
- Acceptable trade-off

⚠️ **No user profiles**
- Cannot store preferences
- Cannot show user history
- Acceptable for MVP (not needed)

---

### Mitigation

✅ **For MVP, anonymous is perfect**
- Users don't need accounts
- Canvas state persists via Liveblocks (not tied to user)
- Name/color sufficient for collaboration

✅ **Can add proper auth later**
```
Migration path:
1. Keep anonymous auth
2. Add "Sign up" button (optional)
3. Link anonymous account to real account
4. Firebase supports this flow natively
```

✅ **Document limitations**
- Users understand sessions are temporary
- Clear in UI/messaging
- Not unexpected behavior

---

## Security Considerations

### Public API Keys (Safe)

```typescript
// These are PUBLIC and safe to expose:
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID

// Why safe?
✅ Firebase Security Rules protect data
✅ API key only identifies project
✅ Cannot be used maliciously
✅ Designed to be public
```

### Firebase Security Rules

```javascript
// Firestore rules (if we added database later):
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anonymous users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=collab-canva.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=collab-canva

# Note: All safe to expose (NEXT_PUBLIC_ prefix)
```

---

## Alternatives Revisited

If Firebase becomes unsuitable (privacy concerns, need persistent accounts):

1. **Add Email/Password Auth**
   - Firebase supports upgrading anonymous → email
   - Keep anonymous as default
   - Add "Create account" button
   - Link accounts natively

2. **Clerk/Auth0**
   - Add proper user management
   - Social login
   - User profiles
   - Only if needed (not for MVP)

3. **Custom UUID**
   - Generate UUID client-side (crypto.randomUUID())
   - Store in localStorage
   - No auth service needed
   - Loss: No session management across devices

---

## References

- **Firebase docs:** https://firebase.google.com/docs/auth/web/anonymous-auth
- **figma-clone repo:** Uses Firebase anonymous auth successfully
- **Firebase pricing:** https://firebase.google.com/pricing
- **PRD requirements:** docs/prd/functional-requirements.md (FR-016)

---

## Review Schedule

**Next review:** After MVP deployment  
**Criteria for change:**
- Users request persistent accounts
- Need user profiles/preferences
- Privacy concerns arise
- Better alternative emerges

---

## Implementation Time

**Total time:** 30 minutes

1. Set up Firebase project (10 min)
2. Install SDK, configure (5 min)
3. Implement sign-in logic (10 min)
4. Test with multiple users (5 min)

**Proven in figma-clone repo - can copy directly**