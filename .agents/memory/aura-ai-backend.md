---
name: Aura AI backend architecture
description: How the Expo app connects to the Express API server with PostgreSQL, JWT auth, and offline fallback
---

## Stack
- API server: Express on port 8080 (externalPort 80), routes at `/api`
- Database: PostgreSQL via Drizzle ORM (`@workspace/db`)
- Auth: JWT via `jsonwebtoken`, passwords via `bcryptjs`, secret from `SESSION_SECRET` env
- App: Expo app calls API via `EXPO_PUBLIC_DOMAIN` env var → `https://${EXPO_PUBLIC_DOMAIN}/api`

## Key design decisions
- **Companion IDs are user-scoped**: `aurora-${userId}`, `orion-${userId}`, `lyra-${userId}` — prevents conflicts when multiple users register
- **API-first with AsyncStorage fallback**: AppContext tries the API, falls back to local storage if unreachable. Unauthenticated users get DEFAULT_COMPANIONS (ids: aurora/orion/lyra) which work offline
- **Smart AI engine**: No external AI API. Server-side intent detection + persona-based response pools (aurora=empathetic, orion=strategic, lyra=creative). Responses vary based on history length + message content hash
- **App API client**: `artifacts/aura-ai/lib/api.ts` — thin fetch wrapper with token from AsyncStorage, typed per endpoint
- **New AppContext methods**: `sendMessageToAPI(companionId, content)` → returns AI message or null (fallback), `loadMessagesFromAPI(companionId)` → syncs DB history to local state

**Why:** Free tier — no OpenAI integration available. Smart fallback ensures app always works even if API is down.

## Routes
- `POST /api/auth/register` — creates user + seeds 3 default companions, returns JWT
- `POST /api/auth/login` — returns JWT
- `GET /api/auth/me` — returns profile from token
- `PUT /api/auth/me` — updates profile
- `GET /api/companions` — lists user's companions
- `POST /api/companions` — creates companion
- `PUT /api/companions/:id` — updates companion
- `GET /api/companions/:id/messages` — message history
- `POST /api/companions/:id/chat` — saves user msg + generates + saves AI reply
